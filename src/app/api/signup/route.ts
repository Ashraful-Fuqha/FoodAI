// src/app/api/register/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer'; // Import nodemailer

// Configure Nodemailer transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'), // Parse port as integer
  secure: process.env.EMAIL_SECURE === 'true', // Use boolean for secure
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationEmail(email: string, token: string) {
  const verificationLink = `${process.env.AUTH_URL}/api/auth/verify-email?token=${token}`;

  try {
    await transporter.sendMail({
      from: `"FoodAI" <${process.env.EMAIL_USER}>`, // Sender address (use your configured email user)
      to: email, // List of receivers
      subject: "Verify your FoodAI account", // Subject line
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #0056b3;">Welcome to FoodAI!</h2>
          <p>Thank you for registering. To activate your account, please verify your email address by clicking the link below:</p>
          <p style="margin: 20px 0;">
            <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">
              Verify Your Email
            </a>
          </p>
          <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
          <p><a href="${verificationLink}" style="color: #007bff; text-decoration: underline;">${verificationLink}</a></p>
          <p>This link will expire in a short period for security reasons.</p>
          <p>If you did not register for a FoodAI account, please ignore this email.</p>
          <p>Best regards,<br>The FoodAI Team</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 0.8em; color: #777;">This is an automated email, please do not reply.</p>
        </div>
      `, // HTML body with a styled link
    });
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send verification email to ${email}:`, error);
    // In a production app, you might want to log this error to a monitoring service
    // or notify an admin, but the registration process can still complete.
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (!existingUser.emailVerified) {
        const newVerificationToken = uuidv4();
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { verificationToken: newVerificationToken },
        });
        await sendVerificationEmail(email, newVerificationToken);
        return NextResponse.json({ message: 'User already exists but not verified. A new verification email has been sent.' }, { status: 200 });
      }
      return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken: verificationToken,
        emailVerified: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json({ message: 'User registered successfully! Please check your email to verify your account.' }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
