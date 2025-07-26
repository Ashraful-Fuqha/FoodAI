// src/components/sign-out-button.tsx
'use client';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button'; // Import Shadcn Button

export default function SignOutButton() {
  return (
    <Button onClick={() => signOut()} variant="destructive"> {/* Using Shadcn's destructive variant */}
      Sign Out
    </Button>
  );
}