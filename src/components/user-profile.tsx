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
      // Removed pr-4 from here, as parent Navbar will handle overall padding
      // Added flex-shrink-0 to prevent welcome message from shrinking too much on small screens
      <div className="flex items-center justify-end text-white text-right flex-shrink-0">
        {/* Added responsive text size for the welcome message to fit better on small screens */}
        {/* The welcome message is hidden on small screens (below md) to prevent overflow */}
        <p className="mr-2 text-sm sm:mr-4 sm:text-base hidden md:block">Welcome, {session.user.name || session.user.email}!</p>
        <SignOutButton />
      </div>
    );
  }

  return <SignInButton />;
}
