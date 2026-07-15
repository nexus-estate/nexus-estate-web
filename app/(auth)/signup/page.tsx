'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from '@/lib/i18n';

export default function SignUpPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { t } = useTranslations();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    if (form.password.length < 8) {
      setError(t('auth.passwordMinLength'));
      return;
    }

    setLoading(true);

    try {
      await register({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        phoneNumber: form.phoneNumber || undefined,
      });
      setSuccess(true);
      setTimeout(() => router.push('/signin'), 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('common.error');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              {t('auth.signupSuccess')}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {t('auth.signupRedirect')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {/* Header */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xl font-bold text-blue-600"
            >
              <svg className="h-6 w-6" viewBox="0 0 28 28" fill="currentColor">
                <path d="M14 2L2 12h3v10h7v-6h4v6h7V12h3L14 2z" />
              </svg>
              Nexus Estate
            </Link>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              {t('auth.signupTitle')}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('auth.signupSubtitle')}{' '}
              <Link
                href="/signin"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                {t('auth.signupLink')}
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Input
              label={t('auth.fullName')}
              id="fullName"
              type="text"
              required
              value={form.fullName}
              onChange={handleChange('fullName')}
              placeholder={t('auth.fullNamePlaceholder')}
            />

            <Input
              label={t('auth.email')}
              id="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange('email')}
              placeholder={t('auth.emailPlaceholder')}
            />

            <Input
              label={t('auth.phoneNumber')}
              id="phoneNumber"
              type="tel"
              value={form.phoneNumber}
              onChange={handleChange('phoneNumber')}
              placeholder={t('auth.phoneNumberPlaceholder')}
            />

            <Input
              label={t('auth.password')}
              id="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange('password')}
              placeholder={t('auth.passwordPlaceholder')}
            />

            <Input
              label={t('auth.confirmPassword')}
              id="confirmPassword"
              type="password"
              required
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              placeholder={t('auth.confirmPasswordPlaceholder')}
            />

            <Button type="submit" loading={loading} className="w-full">
              {loading ? t('auth.signupLoading') : t('auth.signupButton')}
            </Button>

            <p className="text-xs text-gray-400 text-center">
              {t('auth.termsPrefix')}{' '}
              <Link href="/" className="text-blue-600 hover:underline">
                {t('auth.termsLink')}
              </Link>{' '}
              <Link href="/" className="text-blue-600 hover:underline">
                {t('auth.privacyLink')}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
