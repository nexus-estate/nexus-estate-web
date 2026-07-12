'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/types';

function getUserDisplayName(user:  { firstName: string | null; lastName: string | null }  ): string {
  if (!user) return '';
  const { firstName, lastName } = user;
  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  if (lastName) return lastName;
  return 'User';
}

function getUserInitial(user: { profile: { firstName: string | null } } | null): string {
  if (!user?.profile?.firstName) return 'U';
  return user.profile.firstName.charAt(0).toUpperCase();
}

export default function Header() {
  const { user, isAuthenticated, signout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
          <svg className="h-7 w-7" viewBox="0 0 28 28" fill="currentColor">
            <path d="M14 2L2 12h3v10h7v-6h4v6h7V12h3L14 2z" />
          </svg>
          Nexus Estate
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            Trang chủ
          </Link>
          <Link href="/properties" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            Nhà đất
          </Link>
          <Link href="/properties?purpose=rent" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
            Cho thuê
          </Link>
          {isAuthenticated && (
            <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
          )}
        </nav>

        {/* Auth Buttons / Profile */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                  {getUserInitial(user)}
                </div>
                <span className="hidden sm:inline">{getUserDisplayName(user)}</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-lg border border-gray-200 bg-white py-1 shadow-lg animate-fade-in">
                    <div className="border-b border-gray-100 px-4 py-2.5">
                      <p className="text-sm font-medium text-gray-900">{getUserDisplayName(user)}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 capitalize">
                        {user?.role?.toLowerCase()}
                      </span>
                    </div>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setProfileOpen(false)}
                    >
                      Dashboard
                    </Link>
                    {user?.role === UserRole.ADMIN && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setProfileOpen(false)}
                      >
                        Quản trị
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setProfileOpen(false)}
                    >
                      Thông tin cá nhân
                    </Link>
                    <div className="border-t border-gray-100">
                      <button
                        onClick={() => { signout(); setProfileOpen(false); }}
                        className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/signin"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Đăng ký
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="ml-2 rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <nav className="flex flex-col px-4 pb-3 pt-2">
            <Link href="/" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100" onClick={() => setMobileOpen(false)}>Trang chủ</Link>
            <Link href="/properties" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100" onClick={() => setMobileOpen(false)}>Nhà đất</Link>
            <Link href="/properties?purpose=rent" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100" onClick={() => setMobileOpen(false)}>Cho thuê</Link>
            {isAuthenticated && (
              <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100" onClick={() => setMobileOpen(false)}>Dashboard</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}