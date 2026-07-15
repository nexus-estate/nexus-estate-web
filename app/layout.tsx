import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/auth-context';
import { I18nProvider } from '@/lib/i18n';
import { QueryProvider } from '@/lib/query-client';

const inter = Inter({
  subsets: ['vietnamese', 'latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Nexus Estate - Nền tảng Bất Động Sản Thông Minh',
  description:
    'Kết nối người mua, người bán và môi giới bất động sản trên cùng một nền tảng thông minh. Tìm kiếm nhà đất, căn hộ, văn phòng với AI Recommendation.',
  keywords: 'bất động sản, nhà đất, mua bán, cho thuê, nexus estate',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <QueryProvider>
          <I18nProvider>
            <AuthProvider>{children}</AuthProvider>
          </I18nProvider>
        </QueryProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
