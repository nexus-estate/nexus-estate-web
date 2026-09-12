import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { I18nProvider } from '@/lib/i18n';
import { QueryProvider } from '@/lib/query-client';

export const metadata: Metadata = {
  title: 'Nexus Estate — Tuyển chọn bất động sản tinh hoa',
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
    <html lang="vi" className="h-full">
      <body className="flex min-h-full flex-col bg-[#f7f5ef] font-sans antialiased">
        <QueryProvider>
          <I18nProvider>{children}</I18nProvider>
        </QueryProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
