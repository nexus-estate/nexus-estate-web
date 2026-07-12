'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { UserRole } from '@/lib/types';

function getUserDisplayName(user: { profile: { firstName: string | null; lastName: string | null } } | null): string {
  if (!user) return 'N/A';
  const { firstName, lastName } = user.profile;
  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  if (lastName) return lastName;
  return 'N/A';
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [overview, setOverview] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/signin');
      return;
    }
    if (!authLoading && isAuthenticated && user?.role !== UserRole.ADMIN) {
      router.replace('/dashboard');
      return;
    }
    if (isAuthenticated) {
      Promise.all([
        api.getAdminOverview().catch(() => null),
        api.getAdminUsers(1, 20).catch(() => []),
      ])
        .then(([ov, us]) => {
          setOverview(ov);
          setUsers(Array.isArray(us) ? us : []);
        })
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, authLoading, user, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user?.role !== UserRole.ADMIN) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản trị hệ thống</h1>
            <p className="mt-1 text-sm text-gray-500">Tổng quan hệ thống Nexus Estate</p>
          </div>
        </div>

        {/* Overview stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Tổng người dùng', value: overview?.totalUsers ?? 0, icon: '👥', color: 'from-blue-400 to-blue-600' },
            { label: 'Môi giới', value: overview?.totalBrokers ?? 0, icon: '🤝', color: 'from-green-400 to-green-600' },
            { label: 'Tin đăng', value: overview?.totalListings ?? 0, icon: '📋', color: 'from-purple-400 to-purple-600' },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-xl bg-gradient-to-br ${stat.color} p-5 text-white`}>
              <div className="flex items-center justify-between">
                <p className="text-sm opacity-90">{stat.label}</p>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className="mt-2 text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Users table */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">Người dùng</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Họ tên</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Vai trò</th>
                  <th className="px-6 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-6 py-4">
                        <div className="skeleton h-5 w-48 rounded" />
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      Chưa có người dùng nào.
                    </td>
                  </tr>
                ) : (
                  users.map((u: any) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {u.profile ? getUserDisplayName(u) : u.fullName || u.email}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{u.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                            u.role === UserRole.ADMIN
                              ? 'bg-purple-100 text-purple-700'
                              : u.role === UserRole.BROKER
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {u.role?.toLowerCase() || 'buyer'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {u.isActive ? 'Hoạt động' : 'Khóa'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}