'use client';

import Link from 'next/link';
import { useTranslations } from '@/lib/i18n';

export default function Footer() {
  const { t } = useTranslations();

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-bold text-blue-600"
            >
              <svg className="h-6 w-6" viewBox="0 0 28 28" fill="currentColor">
                <path d="M14 2L2 12h3v10h7v-6h4v6h7V12h3L14 2z" />
              </svg>
              Nexus Estate
            </Link>
            <p className="mt-3 text-sm text-gray-600">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              {t('footer.explore')}
            </h2>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/properties"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  {t('footer.forSale')}
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?purpose=rent"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  {t('footer.forRent')}
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?type=apartment"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  {t('footer.apartment')}
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?type=house"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  {t('footer.house')}
                </Link>
              </li>
              <li>
                <Link
                  href="/properties?type=land"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  {t('footer.land')}
                </Link>
              </li>
            </ul>
          </div>

          {/* For Broker */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              {t('footer.forBroker')}
            </h2>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/signup"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  {t('footer.register')}
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  {t('footer.manageListings')}
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/listings/new"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  {t('footer.newListing')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              {t('footer.support')}
            </h2>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href="mailto:support@nexusestate.dev"
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  support@nexusestate.dev
                </a>
              </li>
              <li>
                <span className="text-sm text-gray-600">
                  Hotline: 1900 1234
                </span>
              </li>
              <li>
                <span className="text-sm text-gray-600">
                  TP. Hồ Chí Minh, Việt Nam
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Nexus Estate.{' '}
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
