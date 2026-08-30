'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api-client';
import { useTranslations } from '@/lib/i18n';
import type { User } from '@/lib/sdk';

interface Listing {
  id: string;
  propertyId: string;
  status: string;
  viewCount: number;
  createdAt: string;
}

interface Package {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  maxListings: number;
}

function getUserFullName(user: User | null): string {
  if (!user) return '';
  if (user.fullName) return user.fullName;
  if (user.username) return user.username;
  return user.email;
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t } = useTranslations();

  const { data: listings = [], isLoading: listingsLoading } = useQuery<
    Listing[]
  >({
    queryKey: ['my-listings'],
    queryFn: async () => {
      const response = await apiClient.get<Listing[]>(
        '/listings?page=1&limit=10',
      );
      return response.data ?? [];
    },
    enabled: isAuthenticated,
  });

  const { data: packages = [], isLoading: packagesLoading } = useQuery<
    Package[]
  >({
    queryKey: ['packages'],
    queryFn: async () => {
      const response = await apiClient.get<Package[]>('/payments/packages');
      return response.data ?? [];
    },
    enabled: isAuthenticated,
  });

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const totalViews = listings.reduce(
    (a: number, l: Listing) => a + (l.viewCount || 0),
    0,
  );

  const roleLabel = t(`role.${user?.role?.name || 'BUYER'}`);

  const loadingData = listingsLoading || packagesLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <h1 className="text-2xl font-bold">
            {t('dashboard.welcome')}, {getUserFullName(user)}!
          </h1>
          <p className="mt-1 text-blue-100">{t('dashboard.welcomeSub')}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/dashboard/listings/new"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
            >
              {t('dashboard.newListing')}
            </Link>
            <Link
              href="/properties"
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400 transition-colors"
            >
              {t('dashboard.explore')}
            </Link>
          </div>
        </div>

        {/* Stats cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: t('dashboard.statsListings'),
              value: listings.length,
              icon: '📋',
              color: 'bg-blue-50 text-blue-700',
            },
            {
              label: t('dashboard.statsViews'),
              value: totalViews,
              icon: '👁️',
              color: 'bg-green-50 text-green-700',
            },
            {
              label: t('dashboard.statsRole'),
              value: roleLabel,
              icon: '👤',
              color: 'bg-purple-50 text-purple-700',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <span
                  className={`rounded-lg px-2 py-1 text-xs font-medium ${stat.color}`}
                >
                  {stat.icon}
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* My Listings */}
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  {t('dashboard.myListings')}
                </h2>
                <Link
                  href="/dashboard/listings/new"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  {t('dashboard.add')}
                </Link>
              </div>
            </Card.Header>
            <Card.Body>
              {loadingData ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton h-12 rounded-lg" />
                  ))}
                </div>
              ) : listings.length === 0 ? (
                <div className="rounded-xl bg-gray-50 p-6 text-center">
                  <p className="text-sm text-gray-500">
                    {t('dashboard.noListings')}
                  </p>
                  <Link
                    href="/dashboard/listings/new"
                    className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline"
                  >
                    {t('dashboard.postNow')}
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {listings.slice(0, 5).map((listing: Listing) => (
                    <div
                      key={listing.id}
                      className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {listing.propertyId}
                        </p>
                        <Badge
                          variant={
                            listing.status === 'published'
                              ? 'success'
                              : listing.status === 'draft'
                                ? 'default'
                                : 'warning'
                          }
                          size="sm"
                        >
                          {listing.status === 'published'
                            ? t('dashboard.statusPublished')
                            : listing.status === 'draft'
                              ? t('dashboard.statusDraft')
                              : t('dashboard.statusPending')}
                        </Badge>
                      </div>
                      <div className="text-right text-xs text-gray-400">
                        {listing.viewCount > 0 && (
                          <p>
                            {listing.viewCount} {t('dashboard.views')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Packages */}
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  {t('dashboard.packages')}
                </h2>
              </div>
            </Card.Header>
            <Card.Body>
              {loadingData ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="skeleton h-24 rounded-lg" />
                  ))}
                </div>
              ) : packages.length === 0 ? (
                <div className="rounded-xl bg-gray-50 p-6 text-center">
                  <p className="text-sm text-gray-500">
                    {t('dashboard.noPackages')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {packages.map((pkg: Package) => (
                    <div
                      key={pkg.id}
                      className="rounded-xl border border-gray-200 p-4 hover:border-blue-200 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">
                          {pkg.name}
                        </h3>
                        <p className="text-lg font-bold text-blue-600">
                          {pkg.price?.toLocaleString('vi-VN')}₫
                        </p>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                        <span>
                          {pkg.durationDays} {t('dashboard.days')}
                        </span>
                        <span>
                          {t('dashboard.maxListings')} {pkg.maxListings}{' '}
                          {t('dashboard.posts')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
