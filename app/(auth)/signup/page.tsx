'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { safeCustomerNext } from '@/lib/customer-return-path';

function PasswordField({
  id,
  label,
  placeholder,
  value,
  onChange,
  visible,
  onToggle,
  autoComplete,
  showToggle = false,
  toggleLabel,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  visible: boolean;
  onToggle?: () => void;
  autoComplete: string;
  showToggle?: boolean;
  toggleLabel?: string;
}) {
  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          minLength={8}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={showToggle ? 'field pr-10' : 'field'}
        />
        {showToggle && onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute inset-y-0 right-0 grid w-10 place-items-center text-[var(--text-subtle)] transition-colors hover:text-[var(--text)]"
            aria-label={toggleLabel}
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
        )}
      </div>
    </div>
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { register } = useAuth();
  const t = useTranslations('auth.customer');
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const next = safeCustomerNext(search.get('next'));
  const signInHref =
    next === '/' ? '/signin' : `/signin?next=${encodeURIComponent(next)}`;

  const update =
    (field: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (form.password.length < 8) return setError(t('passwordLength'));
    if (form.password !== form.confirmPassword)
      return setError(t('passwordMismatch'));
    setLoading(true);
    try {
      await register({ email: form.email, password: form.password });
      setSuccess(true);
      setTimeout(() => router.push(signInHref), 1800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="animate-fade-up text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[var(--success)]/25 bg-[var(--success-soft)] text-[var(--success-strong)]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path
              d="M5 12.5l4.5 4.5L19 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="label-caps mt-6">{t('successEyebrow')}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text)]">
          {t('successTitle')} {t('successAccent')}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
          {t('successDescription')}
        </p>
        <Link href={signInHref} className="btn btn-primary btn-lg mt-6 w-full">
          {t('signInNow')}
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <p className="label-caps">{t('signupEyebrow')}</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text)]">
        {t('signupTitle')} {t('signupAccent')}
      </h1>
      <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
        {t('signupDescription')}
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
          <label className="field-label" htmlFor="signup-email">
            {t('email')}
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={update('email')}
            placeholder={t('emailPlaceholder')}
            className="field"
          />
        </div>
        <PasswordField
          id="signup-password"
          label={t('password')}
          placeholder={t('passwordPlaceholder')}
          value={form.password}
          onChange={update('password')}
          visible={showPassword}
          onToggle={() => setShowPassword(!showPassword)}
          autoComplete="new-password"
          showToggle
          toggleLabel={showPassword ? t('hidePassword') : t('showPassword')}
        />
        <PasswordField
          id="signup-confirm-password"
          label={t('confirmPassword')}
          placeholder={t('confirmPlaceholder')}
          value={form.confirmPassword}
          onChange={update('confirmPassword')}
          visible={showPassword}
          autoComplete="new-password"
        />
        <label className="flex cursor-pointer items-start gap-2 text-sm leading-6 text-[var(--text-muted)]">
          <input
            required
            type="checkbox"
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
          />
          <span>
            {t('termsPrefix')}{' '}
            <Link href="/" className="link">
              {t('terms')}
            </Link>{' '}
            {` ${t('and')} `}
            <Link href="/" className="link">
              {t('privacy')}
            </Link>
            .
          </span>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-lg w-full"
        >
          {loading ? t('creating') : t('create')}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
        {t('hasAccount')}{' '}
        <Link href={signInHref} className="link">
          {t('signInNow')}
        </Link>
      </p>
    </div>
  );
}
