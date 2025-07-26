// src/app/api/register/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db'; // Your Prisma client
import bcrypt from 'bcryptjs'; // For password hashing

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Basic validation (Zod is on the client, but server-side validation is good practice too)
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is a good salt rounds value

    // Create the user in the database
    const newUser = await prisma.user.create({
      data: {
        name, // Name is optional
        email,
        password: hashedPassword,
      },
      select: { // Select only public fields to return
        id: true,
        email: true,
        name: true,
      },
    });

    return NextResponse.json({ message: 'User registered successfully!', user: newUser }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
