// src/app/api/auth/verify-email/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    // Redirect to an error page or show a message
    return NextResponse.redirect(new URL('/auth/verify-status?status=error&message=No token provided.', req.url));
  }

  try {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return NextResponse.redirect(new URL('/auth/verify-status?status=error&message=Invalid or expired token.', req.url));
    }

    // Mark user as verified and clear the token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(), // Set current timestamp
        verificationToken: null, // Clear the token after use
      },
    });

    // Redirect to a success page
    return NextResponse.redirect(new URL('/auth/verify-status?status=success', req.url));

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/auth/verify-status?status=error&message=An error occurred during verification.', req.url));
  }
}
