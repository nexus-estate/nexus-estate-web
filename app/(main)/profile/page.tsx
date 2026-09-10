'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

function getInitial(email: string): string {
  return email.charAt(0).toUpperCase() || 'U';
}

function getDisplayName(email: string): string {
  const localPart = email.split('@')[0];
  return localPart || email;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, getProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshProfile = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      await getProfile();
    } catch (refreshError: unknown) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : 'Không thể tải thông tin tài khoản.',
      );
    } finally {
      setLoading(false);
    }
  }, [getProfile]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/signin');
      return;
    }

    void getProfile()
      .catch((refreshError: unknown) => {
        setError(
          refreshError instanceof Error
            ? refreshError.message
            : 'Không thể tải thông tin tài khoản.',
        );
      })
      .finally(() => setLoading(false));
  }, [getProfile, isAuthenticated, router]);

  if (!isAuthenticated || (loading && !user)) {
    return (
      <main className="grid min-h-[calc(100vh-84px)] place-items-center bg-[#f7f5ef] px-5">
        <div className="flex items-center gap-3 text-sm text-[#687572]">
          <span className="h-5 w-5 animate-spin rounded-full border border-[#173b38]/25 border-t-[#173b38]" />
          Đang tải hồ sơ...
        </div>
      </main>
    );
  }

  if (!user) return null;

  const roleName = user.role?.name || 'Chưa xác định';

  return (
    <main className="min-h-[calc(100vh-84px)] bg-[#f7f5ef] px-5 py-10 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-5xl">
        <nav className="mb-8 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8582]">
          <Link href="/" className="transition hover:text-[#173b38]">
            Trang chủ
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#9a7b4f]">Hồ sơ</span>
        </nav>

        <section className="overflow-hidden border border-[#ded9ce] bg-white shadow-[0_24px_70px_rgba(23,59,56,0.08)]">
          <div className="bg-[#0b2927] px-6 py-10 text-white sm:px-10 lg:px-14">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border border-[#d2b477]/50 bg-[#d2b477] font-display text-4xl text-[#0b2927]">
                {getInitial(user.email)}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#d2b477]">
                  Tài khoản Nexus Estate
                </p>
                <h1 className="mt-3 truncate font-display text-4xl capitalize tracking-[-0.02em] sm:text-5xl">
                  {getDisplayName(user.email)}
                </h1>
                <p className="mt-2 truncate text-sm text-white/60">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-10 px-6 py-9 sm:px-10 lg:grid-cols-[1fr_280px] lg:px-14 lg:py-12">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a7b4f]">
                    Thông tin hồ sơ
                  </p>
                  <h2 className="mt-2 font-display text-3xl text-[#173b38]">
                    Thông tin tài khoản
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => void refreshProfile()}
                  disabled={loading}
                  className="border border-[#cfc8ba] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#173b38] transition hover:border-[#9a7b4f] disabled:cursor-wait disabled:opacity-50"
                >
                  {loading ? 'Đang tải...' : 'Tải lại'}
                </button>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-6 border-l-2 border-[#a64336] bg-[#f7ebe8] px-4 py-3 text-sm text-[#8e352c]"
                >
                  {error}
                </div>
              )}

              <dl className="mt-8 divide-y divide-[#ece8df] border-y border-[#ece8df]">
                <div className="grid gap-1 py-5 sm:grid-cols-[150px_1fr] sm:gap-6">
                  <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[#7b8582]">
                    Email
                  </dt>
                  <dd className="break-all text-sm text-[#173b38]">
                    {user.email}
                  </dd>
                </div>
                <div className="grid gap-1 py-5 sm:grid-cols-[150px_1fr] sm:gap-6">
                  <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[#7b8582]">
                    Vai trò
                  </dt>
                  <dd className="text-sm capitalize text-[#173b38]">
                    {roleName}
                  </dd>
                </div>
                <div className="grid gap-1 py-5 sm:grid-cols-[150px_1fr] sm:gap-6">
                  <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[#7b8582]">
                    Mã người dùng
                  </dt>
                  <dd className="break-all font-mono text-xs text-[#52615e]">
                    {user.id}
                  </dd>
                </div>
                <div className="grid gap-1 py-5 sm:grid-cols-[150px_1fr] sm:gap-6">
                  <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[#7b8582]">
                    Mã vai trò
                  </dt>
                  <dd className="break-all font-mono text-xs text-[#52615e]">
                    {user.roleId}
                  </dd>
                </div>
              </dl>
            </div>

            <aside className="border-t border-[#ece8df] pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a7b4f]">
                Trạng thái
              </p>
              <div className="mt-5 flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#3f8a67] shadow-[0_0_0_5px_rgba(63,138,103,0.12)]" />
                <span className="text-sm font-medium text-[#173b38]">
                  Phiên đăng nhập hợp lệ
                </span>
              </div>
              <p className="mt-5 text-xs leading-6 text-[#7b8582]">
                Dữ liệu được đồng bộ trực tiếp từ endpoint hồ sơ của hệ thống.
              </p>
              <Link
                href="/dashboard"
                className="mt-8 flex items-center justify-between border border-[#173b38] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#173b38] transition hover:bg-[#173b38] hover:text-white"
              >
                Bảng điều khiển
                <span aria-hidden="true">→</span>
              </Link>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
