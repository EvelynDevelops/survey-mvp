'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/AuthCard';
import { api, ApiError } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();

  const handleSubmit = async (values: Record<string, string>) => {
    try {
      // Register the user
      await api.post('/auth/register', {
        email: values.email,
        password: values.password,
      });

      // Redirect to login page after successful registration
      router.push('/login');
    } catch (err) {
      if (err instanceof ApiError) {
        throw new Error(err.message);
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-lavender">
      <AuthCard
        brandText="Survey MVP"
        title="Register"
        submitText="Register"
        fields={[
          {
            name: 'email',
            label: 'Email',
            type: 'email',
            required: true,
            placeholder: 'you@example.com',
            autoComplete: 'email',
          },
          {
            name: 'password',
            label: 'Password',
            type: 'password',
            required: true,
            placeholder: '••••••••',
            autoComplete: 'new-password',
          },
        ]}
        onSubmit={handleSubmit}
        footer={
          <>
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Login
            </Link>
          </>
        }
      />
    </div>
  );
}
