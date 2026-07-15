'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api-client';
import { useTranslations } from '@/lib/i18n';
import type { User } from '@/lib/sdk';

interface AdminOverview {
  totalUsers: number;
  totalBrokers: number;
  totalListings: number;
}

function getDisplayName(user: User): string {
  if (user.fullName) return user.fullName;
  if (user.username) return user.username;
  return user.email;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t } = useTranslations();

  const { data: overview } = useQuery<AdminOverview>({
    queryKey: ['admin-overview'],
    queryFn: async () => {
      const response = await apiClient.get<AdminOverview>(
        '/admin/reports/overview',
      );
      return response.data;
    },
    enabled: isAuthenticated && user?.role?.name === 'ADMIN',
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await apiClient.get<User[]>(
        '/admin/users?page=1&limit=20',
      );
      return response.data ?? [];
    },
    enabled: isAuthenticated && user?.role?.name === 'ADMIN',
  });

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user?.role?.name !== 'ADMIN') {
    router.replace('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('admin.title')}
            </h1>
            <p className="mt-1 text-sm text-gray-500">{t('admin.subtitle')}</p>
          </div>
        </div>

        {/* Overview stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: t('admin.totalUsers'),
              value: overview?.totalUsers ?? 0,
              icon: '👥',
              color: 'from-blue-400 to-blue-600',
            },
            {
              label: t('admin.totalBrokers'),
              value: overview?.totalBrokers ?? 0,
              icon: '🤝',
              color: 'from-green-400 to-green-600',
            },
            {
              label: t('admin.totalListings'),
              value: overview?.totalListings ?? 0,
              icon: '📋',
              color: 'from-purple-400 to-purple-600',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-xl bg-gradient-to-br ${stat.color} p-5 text-white`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm opacity-90">{stat.label}</p>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className="mt-2 text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Users table */}
        <div className="mt-8">
          <Card>
            <Card.Header>
              <h2 className="text-lg font-bold text-gray-900">
                {t('admin.usersTitle')}
              </h2>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3">{t('admin.name')}</th>
                      <th className="px-6 py-3">{t('admin.email')}</th>
                      <th className="px-6 py-3">{t('admin.role')}</th>
                      <th className="px-6 py-3">{t('admin.status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {usersLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i}>
                          <td colSpan={4} className="px-6 py-4">
                            <div className="skeleton h-5 w-48 rounded" />
                          </td>
                        </tr>
                      ))
                    ) : users.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          {t('admin.noUsers')}
                        </td>
                      </tr>
                    ) : (
                      users.map((u: User) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {getDisplayName(u)}
                          </td>
                          <td className="px-6 py-4 text-gray-500">{u.email}</td>
                          <td className="px-6 py-4">
                            <Badge
                              variant={
                                u.role?.name === 'ADMIN'
                                  ? 'info'
                                  : u.role?.name === 'BROKER'
                                    ? 'default'
                                    : 'success'
                              }
                              size="sm"
                            >
                              {t(`role.${u.role?.name || 'BUYER'}`)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant={
                                u.isEmailVerified ? 'success' : 'warning'
                              }
                              size="sm"
                            >
                              {u.isEmailVerified
                                ? t('admin.active')
                                : t('admin.locked')}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
