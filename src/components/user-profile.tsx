// src/components/user-profile.tsx
'use client';
import { useSession } from 'next-auth/react';
import SignInButton from './sign-in-button';
import SignOutButton from './sign-out-button';

export default function UserProfile() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="text-white">Loading authentication...</div>;
  }

  if (session?.user) {
    return (
      <div className="flex items-center text-white">
        <span className="mr-4">Welcome, {session.user.name || session.user.email}!</span>
        <SignOutButton />
      </div>
    );
  }

  return <SignInButton />;
}