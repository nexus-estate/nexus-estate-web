'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { safeCustomerNext } from '@/lib/customer-return-path';

export default function SignInPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { login } = useAuth();
  const t = useTranslations('auth.customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const next = safeCustomerNext(search.get('next'));
  const signUpHref =
    next === '/' ? '/signup' : `/signup?next=${encodeURIComponent(next)}`;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (password.length < 8) {
      setError(t('passwordLength'));
      return;
    }
    setLoading(true);
    try {
      await login({ email, password });
      router.replace(safeCustomerNext(search.get('next')));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-up">
      <p className="label-caps">{t('welcomeBack')}</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text)]">
        {t('signInTitle')} {t('privateSpace')}
      </h1>
      <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
        {t('description')}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <div
            role="alert"
            className="rounded-[var(--radius-sm)] border border-[var(--danger)]/25 bg-[var(--danger-soft)] px-3.5 py-2.5 text-sm font-medium text-[var(--danger-strong)]"
          >
            {error}
          </div>
        )}
        <div>
          <label className="field-label" htmlFor="signin-email">
            {t('email')}
          </label>
          <input
            id="signin-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t('emailPlaceholder')}
            className="field"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="field-label mb-0" htmlFor="signin-password">
              {t('password')}
            </label>
            <span className="text-xs text-[var(--text-subtle)]">
              {t('support', { phone: '1900 1234' })}
            </span>
          </div>
          <div className="relative mt-1.5">
            <input
              id="signin-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t('passwordPlaceholder')}
              className="field pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 grid w-10 place-items-center text-[var(--text-subtle)] transition-colors hover:text-[var(--text)]"
              aria-label={showPassword ? t('hidePassword') : t('showPassword')}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4.5 w-4.5"
                aria-hidden="true"
              >
                <path
                  d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="2.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-muted)]">
          <input type="checkbox" className="h-4 w-4 accent-[var(--primary)]" />
          {t('remember')}
        </label>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-lg w-full"
        >
          {loading ? t('signingIn') : t('submit')}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
        {t('noAccount')}{' '}
        <Link href={signUpHref} className="link">
          {t('createAccount')}
        </Link>
      </p>
      <p className="mt-6 flex items-center justify-center gap-2 text-xs text-[var(--text-subtle)]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path
            d="M12 3l7 3v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6l7-3z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
        {t('secureConnection')}
      </p>
    </div>
  );
}
