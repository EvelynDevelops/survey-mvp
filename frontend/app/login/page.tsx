'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/AuthCard';
import { api, ApiError } from '@/lib/api';
import { setToken } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = async (values: Record<string, string>) => {
    try {
      const response = await api.post<{ access_token: string }>('/auth/login', {
        email: values.email,
        password: values.password,
      });

      setToken(response.access_token);

      // Get user ID from token and redirect to user's dashboard
      const { getUserId } = await import('@/lib/auth');
      const userId = getUserId();

      if (userId) {
        router.push(`/dashboard/${userId}`);
      } else {
        // Fallback to /dashboard if we can't get userId
        router.push('/dashboard');
      }
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
        title="Login"
        submitText="Login"
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
            autoComplete: 'current-password',
          },
        ]}
        onSubmit={handleSubmit}
        footer={
          <>
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:underline font-medium">
              Register
            </Link>
          </>
        }
      />
    </div>
  );
}
