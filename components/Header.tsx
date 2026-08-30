'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import type { User } from '@/lib/sdk';

function userName(user: User | null) {
  if (!user) return '';
  return user.fullName || user.username || user.email;
}

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const isAdmin = user?.role?.name?.toLowerCase() === 'admin';

  const nav = [
    ['Mua', '/properties?purpose=buy'],
    ['Thuê', '/properties?purpose=rent'],
    ['Bộ sưu tập', '/properties'],
    ['Dành cho chủ nhà', '/dashboard/listings/new'],
  ];

  return (
    <header className="sticky inset-x-0 top-0 z-50 border-b border-white/10 bg-[#071b1b]/95 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-[84px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-14">
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label="Nexus Estate - Trang chủ"
        >
          <svg
            viewBox="0 0 42 42"
            fill="none"
            className="h-9 w-9 text-[#d2b477]"
            aria-hidden="true"
          >
            <path
              d="M7 34V16L21 6l14 10v18M13 34V19.5L21 14l8 5.5V34M3 34h36"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path d="M18 34V23h6v11" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          <span>
            <strong className="block font-display text-[21px] font-normal leading-none tracking-[0.04em]">
              NEXUS
            </strong>
            <small className="mt-1 block text-[8px] font-semibold uppercase tracking-[0.36em] text-white/55">
              Estate Collection
            </small>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-8 lg:flex"
          aria-label="Điều hướng chính"
        >
          {nav.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/75 transition hover:text-[#e2c68f]"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 border border-white/25 px-4 py-2.5 text-xs text-white transition hover:border-[#d2b477]"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#c7a66b] font-semibold text-[#092725]">
                  {userName(user).charAt(0).toUpperCase()}
                </span>
                <span className="max-w-28 truncate">{userName(user)}</span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-56 border border-[#ded9ce] bg-white py-2 text-[#173b38] shadow-2xl">
                  <div className="border-b border-[#ece8df] px-4 py-3">
                    <p className="truncate text-sm font-medium">
                      {userName(user)}
                    </p>
                    <p className="mt-1 truncate text-xs text-[#7b8582]">
                      {user.email}
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2.5 text-sm hover:bg-[#f4f1ea]"
                  >
                    Bảng điều khiển
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2.5 text-sm hover:bg-[#f4f1ea]"
                    >
                      Quản trị
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="block px-4 py-2.5 text-sm hover:bg-[#f4f1ea]"
                  >
                    Hồ sơ
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setProfileOpen(false);
                    }}
                    className="block w-full border-t border-[#ece8df] px-4 py-2.5 text-left text-sm text-red-700 hover:bg-red-50"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/signin"
                className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.13em] text-white/80 transition hover:text-white"
              >
                Đăng nhập
              </Link>
              <Link
                href="/signup"
                className="border border-[#c7a66b] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#e1c58e] transition hover:bg-[#c7a66b] hover:text-[#092725]"
              >
                Tham gia
              </Link>
            </div>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileOpen}
            className="grid h-11 w-11 place-items-center lg:hidden"
          >
            <span className="relative block h-4 w-6">
              <span
                className={`absolute left-0 top-0 h-px w-6 bg-white transition ${mobileOpen ? 'translate-y-[7px] rotate-45' : ''}`}
              />
              <span
                className={`absolute left-0 top-[7px] h-px w-6 bg-white transition ${mobileOpen ? 'opacity-0' : ''}`}
              />
              <span
                className={`absolute left-0 top-[14px] h-px w-6 bg-white transition ${mobileOpen ? '-translate-y-[7px] -rotate-45' : ''}`}
              />
            </span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#071b1b]/98 px-5 py-6 backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col" aria-label="Điều hướng di động">
            {nav.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="border-b border-white/10 py-4 font-display text-2xl text-white/90"
              >
                {label}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Link
                  href="/signin"
                  className="border border-white/25 px-4 py-3 text-center text-xs uppercase tracking-wider"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/signup"
                  className="bg-[#c7a66b] px-4 py-3 text-center text-xs uppercase tracking-wider text-[#092725]"
                >
                  Tham gia
                </Link>
              </div>
            )}
            {isAuthenticated && (
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="bg-[#c7a66b] px-4 py-3 text-center text-xs uppercase tracking-wider text-[#092725]"
                >
                  Tài khoản
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="border border-white/25 px-4 py-3 text-center text-xs uppercase tracking-wider text-white"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
