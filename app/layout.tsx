import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AppProviders } from '@/app/providers';
import { LOCALE_KEY, normalizeLocale } from '@/lib/constants';
import { getPlatformTitle, getWebPlatform } from '@/lib/platform/config';
import { QueryProvider } from '@/lib/query-client';
import { getSiteUrl } from '@/lib/seo';

/* Loaded once and exposed as --font-inter, which --font-sans references. */
const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
});

/*
 * No `dynamic = 'force-dynamic'` here on purpose: reading the locale cookie
 * already opts every route into dynamic rendering, and the flag additionally
 * disabled fetch caching. Caching is now controlled per request
 * (`next: { revalidate }`) inside each data loader.
 */
const SITE_DESCRIPTION =
  'Search verified apartments, houses and land across Vietnam. Nexus Estate connects customers, providers and administration teams on one platform.';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Lets the browser paint scrollbars and form controls for the active theme.
  colorScheme: 'light dark',
};

export async function generateMetadata(): Promise<Metadata> {
  const platform = getWebPlatform();
  const title = getPlatformTitle(platform);
  const siteUrl = getSiteUrl();
  const localeCookie = (await cookies()).get(LOCALE_KEY)?.value;
  const locale = normalizeLocale(localeCookie);
  const isPublicMarketplace = platform === 'marketplace';

  return {
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    applicationName: title,
    title: { default: title, template: `%s · ${title}` },
    description: SITE_DESCRIPTION,
    keywords: [
      'real estate',
      'property',
      'apartment',
      'vietnam',
      'bất động sản',
      'nexus estate',
    ],
    openGraph: {
      type: 'website',
      siteName: title,
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
      title,
      description: SITE_DESCRIPTION,
      images: [{ url: '/images/hero-villa.webp', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: SITE_DESCRIPTION,
    },
    // Provider and Administration runtimes are internal tools: keep them out
    // of search results entirely.
    robots: isPublicMarketplace
      ? { index: true, follow: true }
      : { index: false, follow: false, nocache: true },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localeCookie = (await cookies()).get(LOCALE_KEY)?.value;
  const locale = normalizeLocale(localeCookie);

  return (
    <html
      lang={locale}
      className={`${inter.variable} h-full bg-[var(--background)]`}
    >
      <body className="flex min-h-full flex-col bg-[var(--background)] font-sans text-[var(--text)] antialiased">
        <QueryProvider>
          <AppProviders locale={locale}>{children}</AppProviders>
        </QueryProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'text-sm',
            style: {
              background: 'var(--surface-raised)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)',
              padding: '10px 12px',
              fontSize: '0.875rem',
              maxWidth: '380px',
            },
            success: {
              iconTheme: { primary: 'var(--success)', secondary: '#ffffff' },
            },
            error: {
              duration: 6000,
              iconTheme: { primary: 'var(--danger)', secondary: '#ffffff' },
            },
          }}
        />
      </body>
    </html>
  );
}
