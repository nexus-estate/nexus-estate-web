import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function RootNotFound() {
  const t = await getTranslations('common.notFoundPage');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 py-16 text-center">
      <p className="label-caps">404</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text)]">
        {t('title')}
      </h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--text-muted)]">
        {t('description')}
      </p>
      <Link href="/" className="btn btn-primary mt-6">
        {t('search')}
      </Link>
    </main>
  );
}
