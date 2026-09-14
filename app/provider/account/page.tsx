'use client';
import { PageHeader } from '@/components/portal/page-header';
export default function ProviderAccountPage() {
  return (
    <>
      <PageHeader
        title="Provider account"
        description="Manage provider business identity and status."
      />
      <div className="border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--text-muted)]">
        Provider account data is loaded from the selected provider context.
      </div>
    </>
  );
}
