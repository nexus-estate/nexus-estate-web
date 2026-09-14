import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AppProviders } from '@/app/providers';
import { QueryProvider } from '@/lib/query-client';

export const metadata: Metadata = {
  title: 'Nexus Estate — Tuyển chọn bất động sản tinh hoa',
  description:
    'Kết nối người mua, người bán và môi giới bất động sản trên cùng một nền tảng thông minh. Tìm kiếm nhà đất, căn hộ, văn phòng với AI Recommendation.',
  keywords: 'bất động sản, nhà đất, mua bán, cho thuê, nexus estate',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localeCookie = (await cookies()).get('nexus.locale')?.value;
  const locale =
    localeCookie === 'vi' || localeCookie === 'en' ? localeCookie : 'en';

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
