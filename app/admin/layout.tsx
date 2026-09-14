'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  AdministrationSessionProvider,
  useAdministrationSession,
} from '@/features/auth/administration/administration-session.provider';
function Guard({ children }: { children: React.ReactNode }) {
  const session = useAdministrationSession();
  const pathname = usePathname();
  const router = useRouter();
  if (!session.isAuthenticated && pathname !== '/admin/login') {
    router.replace('/admin/login');
    return null;
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 w-64 border-r bg-[#102f2d] p-6 text-white">
        <Link href="/admin" className="font-display text-2xl">
          Nexus Estate
        </Link>
        <nav className="mt-10 space-y-2 text-sm">
          <Link
            className="block rounded px-3 py-2 hover:bg-white/10"
            href="/admin"
          >
            Dashboard
          </Link>
          {session.hasPermission('authorization:role:read') && (
            <Link
              className="block rounded px-3 py-2 hover:bg-white/10"
              href="/admin/authorization"
            >
              Authorization
            </Link>
          )}
        </nav>
      </aside>
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdministrationSessionProvider>
      <Guard>{children}</Guard>
    </AdministrationSessionProvider>
  );
}
