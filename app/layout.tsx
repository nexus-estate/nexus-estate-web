import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AppProviders } from '@/app/providers';
import { LOCALE_KEY, normalizeLocale } from '@/lib/constants';
import { getPlatformTitle, getWebPlatform } from '@/lib/platform/config';
import { QueryProvider } from '@/lib/query-client';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const platform = getWebPlatform();
  const title = getPlatformTitle(platform);

  return {
    title,
    description:
      'Nexus Estate connects customers, providers, and administration teams through one platform runtime.',
    keywords: 'real estate, property, nexus estate',
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
    <html lang={locale} className="h-full bg-[var(--background)]">
      <body className="flex min-h-full flex-col bg-[var(--background)] font-sans text-[var(--text)] antialiased">
        <QueryProvider>
          <AppProviders locale={locale}>{children}</AppProviders>
        </QueryProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
