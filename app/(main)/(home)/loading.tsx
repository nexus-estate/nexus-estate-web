import { SectionGridSkeleton } from '@/components/ui/Skeleton';

/**
 * Scoped to the (home) group on purpose: any loading.tsx above
 * /properties/[id] would commit the response to 200 before `notFound()`
 * runs, turning missing listings into soft 404s.
 */
export default function HomeLoading() {
  return (
    <div className="bg-[var(--background)]">
      <div className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-[var(--content-max)] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="skeleton h-3 w-32" />
          <div className="skeleton mt-4 h-9 w-full max-w-2xl" />
          <div className="skeleton mt-3 h-4 w-full max-w-xl" />
          <div className="panel mt-6 h-24 w-full max-w-3xl" />
        </div>
      </div>
      <SectionGridSkeleton />
    </div>
  );
}
