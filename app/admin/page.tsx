'use client';
import Link from 'next/link';
import { useAdministrationSession } from '@/features/auth/administration/administration-session.provider';
export default function AdminPage() {
  const { authorization, hasPermission, logout } = useAdministrationSession();
  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <p className="eyebrow">Internal operations</p>
          <h1 className="mt-2 text-3xl font-bold text-[#102f2d]">
            Administration
          </h1>
          <p className="mt-2 text-gray-500">
            Your navigation and actions are driven by effective permissions.
          </p>
        </div>
        <button
          className="rounded border px-4 py-2 text-sm"
          onClick={() => void logout()}
        >
          Sign out
        </button>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="font-semibold">Effective authorization</h2>
          <p className="mt-2 text-3xl font-bold text-[#173b38]">
            {authorization?.permissionCodes?.length ??
              authorization?.permissions?.length ??
              0}
          </p>
          <p className="text-sm text-gray-500">permissions available</p>
        </div>
        {hasPermission('authorization:role:read') && (
          <Link
            href="/admin/authorization"
            className="rounded-xl bg-[#173b38] p-6 text-white shadow"
          >
            <h2 className="font-semibold">Authorization workspace</h2>
            <p className="mt-2 text-sm text-white/70">
              Manage roles, permissions, subjects and audit history.
            </p>
          </Link>
        )}
      </div>
    </div>
  );
}
