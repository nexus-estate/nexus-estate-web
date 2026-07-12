import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["vietnamese", "latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Nexus Estate - Nền tảng Bất Động Sản Thông Minh",
  description:
    "Kết nối người mua, người bán và môi giới bất động sản trên cùng một nền tảng thông minh. Tìm kiếm nhà đất, căn hộ, văn phòng với AI Recommendation.",
  keywords: "bất động sản, nhà đất, mua bán, cho thuê, nexus estate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}