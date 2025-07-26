// src/components/sign-in-button.tsx
'use client';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button'; // Import Shadcn Button

export default function SignInButton() {
  return (
    <Button onClick={() => signIn()} className="bg-green-500 hover:bg-green-600 text-white">
      Sign In
    </Button>
  );
}