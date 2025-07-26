// src/app/auth/verify-status/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react'; // Icons for success/error
import { Button } from '@/components/ui/button';

export default function VerifyStatusPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const message = searchParams.get('message');

  const isSuccess = status === 'success';

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-150px)] px-4 py-12 bg-background text-foreground transition-colors duration-300">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-lg text-center dark:bg-gray-800 dark:text-gray-100 transition-colors duration-300">
        {isSuccess ? (
          <>
            <CheckCircle className="h-20 w-20 mx-auto text-green-500" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Email Verified!</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Your account has been successfully verified. You can now sign in.
            </p>
            <Link href="/auth/signin">
              <Button className="mt-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
                Go to Sign In
              </Button>
            </Link>
          </>
        ) : (
          <>
            <XCircle className="h-20 w-20 mx-auto text-red-500" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Verification Failed</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {message || 'An error occurred during email verification. Please try again or contact support.'}
            </p>
            <Link href="/auth/signin">
              <Button variant="outline" className="mt-6 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700">
                Back to Sign In
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
