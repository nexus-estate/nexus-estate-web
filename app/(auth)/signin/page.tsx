'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuth();
  const t = useTranslations('auth.customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-up pt-12 lg:pt-0">
      <p className="eyebrow">{t('welcomeBack')}</p>
      <h1 className="mt-5 font-display text-5xl leading-none tracking-[-.03em] text-[#102f2d]">
        {t('signInTitle')}
        <br />
        <span className="italic text-[#9a7b4f]">{t('privateSpace')}</span>
      </h1>
      <p className="mt-5 text-sm leading-6 text-[#75807d]">
        {t('description')}
      </p>

      <form onSubmit={handleSubmit} className="mt-9 space-y-5">
        {error && (
          <div
            role="alert"
            className="border-l-2 border-[#a64336] bg-[#f7ebe8] px-4 py-3 text-sm leading-5 text-[#8e352c]"
          >
            {error}
          </div>
        )}
        <label className="block">
          <span className="auth-label">{t('email')}</span>
          <div className="relative mt-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="auth-field-icon"
              aria-hidden="true"
            >
              <path
                d="M4 6h16v12H4zM4 7l8 6 8-6"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t('emailPlaceholder')}
              className="auth-input pl-11"
            />
          </div>
        </label>
        <label className="block">
          <div className="flex items-center justify-between">
            <span className="auth-label">{t('password')}</span>
            <span className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#9a7b4f]">
              {t('support', { phone: '1900 1234' })}
            </span>
          </div>
          <div className="relative mt-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="auth-field-icon"
              aria-hidden="true"
            >
              <rect
                x="5"
                y="10"
                width="14"
                height="10"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path
                d="M8 10V7a4 4 0 018 0v3"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t('passwordPlaceholder')}
              className="auth-input px-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center text-[#89918f] transition hover:text-[#173b38]"
              aria-label={showPassword ? t('hidePassword') : t('showPassword')}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="2.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
              </svg>
            </button>
          </div>
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-xs text-[#697572]">
          <input type="checkbox" className="h-4 w-4 accent-[#173b38]" />{' '}
          {t('remember')}
        </label>
        <button type="submit" disabled={loading} className="auth-submit">
          <span>{loading ? t('signingIn') : t('submit')}</span>
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border border-white/40 border-t-white" />
          ) : (
            <span aria-hidden="true">→</span>
          )}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-[#75807d]">
        {t('noAccount')}{' '}
        <Link
          href="/signup"
          className="font-semibold text-[#8e7043] underline decoration-[#c8b087] underline-offset-4"
        >
          {t('createAccount')}
        </Link>
      </p>
      <div className="mt-9 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[.15em] text-[#949c99]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path
            d="M12 3l7 3v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6l7-3z"
            stroke="currentColor"
            strokeWidth="1.4"
          />
        </svg>
        {t('secureConnection')}
      </div>
    </div>
  );
}
