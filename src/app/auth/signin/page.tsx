// src/app/auth/signin/page.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import Image from 'next/image';

// React Hook Form and Zod imports
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

// Define the Zod schema for validation
const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type FormData = z.infer<typeof formSchema>;

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    const result = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result?.error) {
      if (result.error === 'CredentialsSignin') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(result.error);
      }
    } else if (result?.ok) {
      router.push('/');
    }
    setLoading(false);
    reset();
  };

  const handleSocialSignIn = async (provider: string) => {
    setLoading(true);
    setError(null);
    await signIn(provider, { callbackUrl: '/' });
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-150px)] px-4 py-12 bg-background text-foreground transition-colors duration-300">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-lg dark:bg-gray-800 dark:text-gray-100 transition-colors duration-300">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-50">Sign In to FoodAI</h2>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md dark:bg-red-900 dark:text-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              className="mt-1 dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              {...register("password")}
              className="mt-1 dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In with Email'}
          </Button>
        </form>

        <Separator className="dark:bg-gray-600" />

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center space-x-2 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleSocialSignIn('google')}
            disabled={loading}
          >
            <Image
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              width={20}
              height={20}
              className="w-5 h-5 mr-2"
              unoptimized
            />
            Sign In with Google
          </Button>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center space-x-2 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleSocialSignIn('github')}
            disabled={loading}
          >
            <Image
              src="https://www.svgrepo.com/show/512317/github-142.svg"
              alt="GitHub"
              width={20}
              height={20}
              className="w-5 h-5 mr-2"
              unoptimized
            />
            Sign In with GitHub
          </Button>
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account? <Link href="/auth/signup" className="text-blue-600 hover:underline dark:text-blue-400">Register</Link>
        </p>
      </div>
    </div>
  );
}
