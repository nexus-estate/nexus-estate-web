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
    <div className="mx-auto mt-20 max-w-md rounded-xl bg-white p-8 shadow">
      <p className="eyebrow">{t('title')}</p>
      <h1 className="mt-3 text-3xl font-bold text-[#102f2d]">{t('title')}</h1>
      <form
        className="mt-8 space-y-4"
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
        <input
          className="auth-input"
          type="email"
          required
          placeholder={t('email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="auth-input"
          type="password"
          required
          placeholder={t('password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <button disabled={loading} className="auth-submit" type="submit">
          {loading ? t('signingIn') : t('submit')} <span>→</span>
        </button>
      </form>
    </div>
  );
}
