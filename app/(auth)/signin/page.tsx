'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from '@/lib/i18n';

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useTranslations();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({
        identifier,
        password,
      });
      router.push('/');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t('auth.signinError');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

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
              {t('auth.signinTitle')}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('auth.signinSubtitle')}{' '}
              <Link
                href="/signup"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                {t('auth.signinLink')}
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Input
              label={t('auth.identifier')}
              id="identifier"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={t('auth.identifierPlaceholder')}
            />

            <Input
              label={t('auth.password')}
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
            />

            <Button type="submit" loading={loading} className="w-full">
              {loading ? t('auth.signinLoading') : t('auth.signinButton')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
