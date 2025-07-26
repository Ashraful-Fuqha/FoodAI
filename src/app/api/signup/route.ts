// src/app/api/register/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid'; // For generating unique tokens

// Placeholder for email sending function
// In a real application, you would integrate with a service like Nodemailer, Resend, SendGrid, Mailgun, etc.
async function sendVerificationEmail(email: string, token: string) {
  const verificationLink = `${process.env.AUTH_URL}/api/auth/verify-email?token=${token}`;
  console.log(`
    ========================================================
    EMAIL VERIFICATION LINK FOR ${email}:
    ${verificationLink}
    ========================================================
    (In a real app, this email would be sent via a service)
  `);
  // Example with a real email service (conceptual, requires setup):
  /*
  const nodemailer = require('nodemailer');
  let transporter = nodemailer.createTransport({
    host: "smtp.your-email-service.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // your email service user
      pass: process.env.EMAIL_PASS, // your email service password
    },
  });

  await transporter.sendMail({
    from: '"FoodAI" <no-reply@foodai.com>', // sender address
    to: email, // list of receivers
    subject: "Verify your FoodAI account", // Subject line
    html: `<p>Please click this link to verify your email: <a href="${verificationLink}">${verificationLink}</a></p>`, // html body
  });
  */
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
      // If user exists but is not verified, you might want to resend email or prompt them
      if (!existingUser.emailVerified) {
        // Option: Resend verification email if not verified
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
    const verificationToken = uuidv4(); // Generate unique token

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken: verificationToken, // Save the token
        emailVerified: null, // Initially null, will be set on verification
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
