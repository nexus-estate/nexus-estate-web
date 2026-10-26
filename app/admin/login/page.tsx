'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/portal/language-switcher';
import { useAdministrationSession } from '@/features/auth/administration/administration-session.provider';
import { safeAdministrationNext } from '@/lib/admin-return-path';
export default function AdminLoginPage() {
  const t = useTranslations('auth.admin');
  const { login } = useAdministrationSession();
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  return (
    <main className="grid min-h-screen bg-[#f5f7f5] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative isolate flex min-h-[280px] flex-col overflow-hidden bg-[#102c2b] px-6 py-7 text-white sm:px-10 sm:py-9 lg:min-h-screen lg:px-14 lg:py-12 xl:px-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-28 -z-10 h-[30rem] w-[30rem] rounded-full border border-white/[0.08]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -top-10 -z-10 h-[22rem] w-[22rem] rounded-full border border-white/[0.08]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-14rem] left-[-10rem] -z-10 h-[30rem] w-[30rem] rounded-full bg-[#c5a76b]/10 blur-3xl"
        />
        <div className="flex items-center gap-3">
          <span
            className="grid h-11 w-11 place-items-center rounded-2xl bg-[#d9bb78] text-base font-bold text-[#163735] shadow-lg"
            aria-hidden="true"
          >
            N
          </span>
          <div>
            <p className="text-sm font-semibold tracking-wide">Nexus Estate</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.19em] text-[#d9bb78]">
              {t('workspace')}
            </p>
          </div>
        </div>
        <div className="my-auto max-w-xl py-12 lg:py-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d9bb78]">
            {t('eyebrow')}
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-5xl xl:text-6xl">
            {t('headline')}
            <span className="mt-2 block font-display font-normal italic text-[#d9bb78]">
              {t('headlineAccent')}
            </span>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/65 sm:text-base">
            {t('description')}
          </p>
          <div className="mt-10 flex items-center gap-3 text-xs text-white/55">
            <span
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-[#d9bb78]"
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                <path
                  d="M12 3l7 3v5c0 4.5-2.9 8-7 10-4.1-2-7-5.5-7-10V6l7-3z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M9 12l2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>{t('secure')}</span>
          </div>
        </div>
        <p className="text-[10px] tracking-wide text-white/35">
          Nexus Estate · {t('workspace')}
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-12">
        <div className="w-full max-w-[440px]">
          <div className="mb-6 flex justify-end">
            <div className="w-36">
              <LanguageSwitcher />
            </div>
          </div>
          <div className="mb-8 lg:mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a1844f]">
              {t('title')}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#142d2b] sm:text-4xl">
              {t('formTitle')}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#707b77]">
              {t('formDescription')}
            </p>
          </div>

          <form
            className="space-y-5"
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
            <label className="block text-sm font-medium text-[#253b38]">
              <span>{t('email')}</span>
              <span className="relative mt-2 block">
                <svg
                  viewBox="0 0 24 24"
                  className="auth-field-icon"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect
                    x="3.5"
                    y="5"
                    width="17"
                    height="14"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M4.5 7l7.5 6 7.5-6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  className="auth-input pl-11 pr-4"
                  type="email"
                  autoComplete="username"
                  autoFocus
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </span>
            </label>
            <label className="block text-sm font-medium text-[#253b38]">
              <span>{t('password')}</span>
              <span className="relative mt-2 block">
                <svg
                  viewBox="0 0 24 24"
                  className="auth-field-icon"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect
                    x="4.5"
                    y="10"
                    width="15"
                    height="11"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8 10V7a4 4 0 118 0v3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  className="auth-input pl-11 pr-20"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#65736e] hover:text-[#173d39]"
                  aria-label={
                    showPassword ? t('hidePassword') : t('showPassword')
                  }
                >
                  {showPassword ? t('hidePassword') : t('showPassword')}
                </button>
              </span>
            </label>
            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {error}
              </p>
            )}
            <button
              disabled={loading}
              className="auth-submit !mt-7 !h-12 !rounded-xl !bg-[#173d39] !px-5 !text-[11px] tracking-[0.13em] hover:!bg-[#24554f]"
              type="submit"
            >
              {loading ? t('signingIn') : t('submit')}
              {loading ? (
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  aria-hidden="true"
                />
              ) : (
                <span aria-hidden="true">→</span>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-3 border-t border-[#e3e9e5] pt-5 text-xs leading-5 text-[#77827e]">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 shrink-0 text-[#78918a]"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="5"
                y="10"
                width="14"
                height="11"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M8 10V7a4 4 0 118 0v3"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            <span>{t('confidentiality')}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
