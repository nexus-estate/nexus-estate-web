'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { UserRole } from '@/lib/types';

function getUserDisplayName(user: { profile: { firstName: string | null; lastName: string | null } } | null): string {
  if (!user) return '';
  const { firstName, lastName } = user.profile;
  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  if (lastName) return lastName;
  return 'User';
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/signin');
      return;
    }
    if (isAuthenticated) {
      Promise.all([
        api.getListings(1, 10).catch(() => []),
        api.getPackages().catch(() => []),
      ])
        .then(([l, p]) => {
          setListings(Array.isArray(l) ? l : []);
          setPackages(Array.isArray(p) ? p : []);
        })
        .finally(() => setLoadingData(false));
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const totalViews = listings.reduce((a: number, l: any) => a + (l.viewCount || 0), 0);
  const roleLabel =
    user?.role === UserRole.BROKER
      ? 'Môi giới'
      : user?.role === UserRole.ADMIN
        ? 'Quản trị'
        : 'Người mua';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <h1 className="text-2xl font-bold">Xin chào, {getUserDisplayName(user)}!</h1>
          <p className="mt-1 text-blue-100">Chào mừng bạn đến với Nexus Estate.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/dashboard/listings/new"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
            >
              + Đăng tin mới
            </Link>
            <Link
              href="/properties"
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400 transition-colors"
            >
              Khám phá bất động sản
            </Link>
          </div>
        </div>

        {/* Stats cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Tin đăng', value: listings.length, icon: '📋', color: 'bg-blue-50 text-blue-700' },
            { label: 'Lượt xem', value: totalViews, icon: '👁️', color: 'bg-green-50 text-green-700' },
            { label: 'Vai trò', value: roleLabel, icon: '👤', color: 'bg-purple-50 text-purple-700' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <span className={`rounded-lg px-2 py-1 text-xs font-medium ${stat.color}`}>{stat.icon}</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* My Listings */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Tin đăng của tôi</h2>
              <Link href="/dashboard/listings/new" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                + Thêm
              </Link>
            </div>
            {loadingData ? (
              <div className="mt-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-12 rounded-lg" />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="mt-6 rounded-xl bg-gray-50 p-6 text-center">
                <p className="text-sm text-gray-500">Bạn chưa có tin đăng nào.</p>
                <Link
                  href="/dashboard/listings/new"
                  className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline"
                >
                  Đăng tin ngay
                </Link>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {listings.slice(0, 5).map((listing: any) => (
                  <div key={listing.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{listing.propertyId}</p>
                      <span
                        className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                          listing.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : listing.status === 'draft'
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {listing.status === 'published'
                          ? 'Đã đăng'
                          : listing.status === 'draft'
                            ? 'Nháp'
                            : 'Chờ duyệt'}
                      </span>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      {listing.viewCount > 0 && <p>{listing.viewCount} lượt xem</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Packages */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Gói dịch vụ</h2>
            </div>
            {loadingData ? (
              <div className="mt-4 space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="skeleton h-24 rounded-lg" />
                ))}
              </div>
            ) : packages.length === 0 ? (
              <div className="mt-6 rounded-xl bg-gray-50 p-6 text-center">
                <p className="text-sm text-gray-500">Chưa có gói dịch vụ nào.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {packages.map((pkg: any) => (
                  <div key={pkg.id} className="rounded-xl border border-gray-200 p-4 hover:border-blue-200 transition-colors">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                      <p className="text-lg font-bold text-blue-600">
                        {pkg.price?.toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                      <span>{pkg.durationDays} ngày</span>
                      <span>Tối đa {pkg.maxListings} tin</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}