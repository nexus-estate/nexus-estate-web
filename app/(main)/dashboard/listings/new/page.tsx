'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

/**
 * Temporary compatibility shim: Property creation moved to the Provider
 * platform at /provider/properties/new. Renders no duplicate form and is
 * removed in the legacy-cleanup stage.
 */
export default function LegacyNewListingPage() {
  const router = useRouter();
  const t = useTranslations('customer.listing');

  useEffect(() => {
    router.replace('/provider/properties/new');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <p className="text-sm text-[var(--text-muted)]">{t('redirecting')}</p>
    </div>
  );
}
