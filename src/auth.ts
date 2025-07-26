// src/auth.ts
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials" // Import Credentials provider
import bcrypt from "bcryptjs" // Import bcrypt for password hashing

import prisma from "@/lib/db" // Make sure this path is correct for your Prisma client
import { NextAuthConfig } from "next-auth"

// Define auth config separately as per NextAuth best practices
export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
    }),
    // New Credentials Provider for email and password login
    Credentials({
      // You can customize the name shown on the sign-in page
      name: "Credentials",
      // Define the fields you expect for login
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // This is where you'll verify the user's credentials against your database
        if (!credentials.email || !credentials.password) {
          return null; // No email or password provided
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Find the user in your database
        const user = await prisma.user.findUnique({
          where: { email: email },
        });

        if (!user || !user.password) { // Assuming 'password' field exists on your User model
          return null; // User not found or no password set (e.g., social login user)
        }

        // Compare the provided password with the hashed password in the database
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          return null; // Passwords do not match
        }

        // If credentials are valid, return the user object.
        // NextAuth will create a session for this user.
        // IMPORTANT: Only return public information here. Do NOT return the password hash.
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          // You can add other public user properties here
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin", // This tells NextAuth to use your custom page
  },
  secret: process.env.AUTH_SECRET as string,
  trustHost: true,
}

// Create auth handlers
export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth(authOptions)
