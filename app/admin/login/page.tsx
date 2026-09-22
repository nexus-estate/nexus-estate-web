'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAdministrationSession } from '@/features/auth/administration/administration-session.provider';
import { safeAdministrationNext } from '@/lib/admin-return-path';
export default function AdminLoginPage() {
  const t = useTranslations('auth.admin');
  const { login } = useAdministrationSession();
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
      <div className="panel p-6 sm:p-8">
        <p className="label-caps">{t('title')}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text)]">
          {t('title')}
        </h1>
        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError('');
            try {
              await login(email, password);
              router.replace(safeAdministrationNext(search.get('next')));
            } catch (err) {
              setError(err instanceof Error ? err.message : t('invalid'));
            } finally {
              setLoading(false);
            }
          }}
        >
          <div>
            <label className="field-label" htmlFor="admin-email">
              {t('email')}
            </label>
            <input
              id="admin-email"
              className="field"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="admin-password">
              {t('password')}
            </label>
            <input
              id="admin-password"
              className="field"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p
              role="alert"
              className="rounded-[var(--radius-sm)] border border-[var(--danger)]/25 bg-[var(--danger-soft)] px-3.5 py-2.5 text-sm font-medium text-[var(--danger-strong)]"
            >
              {error}
            </p>
          )}
          <button
            disabled={loading}
            className="btn btn-primary btn-lg w-full"
            type="submit"
          >
            {loading ? t('signingIn') : t('submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
