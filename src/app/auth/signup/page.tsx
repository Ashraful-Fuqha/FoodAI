'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

// React Hook Form and Zod imports
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Define the Zod schema for registration validation
const registerFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).optional().or(z.literal('')),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"], // Path to the field that the error applies to
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Make an API call to your backend to register the user
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Registration failed.');
      } else {
        setSuccess('Registration successful! You can now sign in.');
        reset(); // Clear form on success
        // Optionally, redirect to sign-in page after a short delay
        setTimeout(() => {
          router.push('/auth/signin');
        }, 2000);
      }
    } catch (err) {
      console.error('Registration API call failed:', err);
      setError('An unexpected error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-150px)] px-4 py-12 bg-background text-foreground transition-colors duration-300">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-lg dark:bg-gray-800 dark:text-gray-100 transition-colors duration-300">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-50">Register for FoodAI</h2>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md dark:bg-red-900 dark:text-red-100">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 text-sm text-green-700 bg-green-100 border border-green-200 rounded-md dark:bg-green-900 dark:text-green-100">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name (Optional)</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              {...register("name")}
              className="mt-1 dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
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
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="********"
              {...register("confirmPassword")}
              className="mt-1 dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account? <Link href="/auth/signin" className="text-blue-600 hover:underline dark:text-blue-400">Sign In</Link>
        </p>
      </div>
    </div>
  );
}