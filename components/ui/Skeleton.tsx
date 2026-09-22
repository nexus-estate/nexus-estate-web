import clsx from 'clsx';

export function Skeleton({
  className,
  rounded = 'md',
}: {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        'skeleton',
        rounded === 'sm' && 'rounded-[var(--radius-sm)]',
        rounded === 'md' && 'rounded-[var(--radius-md)]',
        rounded === 'lg' && 'rounded-[var(--radius-lg)]',
        rounded === 'full' && 'rounded-[var(--radius-full)]',
        className,
      )}
    />
  );
}

export function SkeletonText({
  lines = 2,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={clsx('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={clsx('h-3.5', index === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  );
}

/** Marketplace listing grid — matches PropertyCard proportions. */
export function PropertyGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]"
        >
          <Skeleton className="aspect-[4/3] w-full" rounded="sm" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Marketplace page band + filters + results. */
export function MarketplacePageSkeleton() {
  return (
    <div className="bg-[var(--background)]">
      <div className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-[var(--content-max)] px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="mt-3 h-4 w-full max-w-xl" />
        </div>
      </div>
      <div className="mx-auto max-w-[var(--content-max)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="panel p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 border-b border-[var(--border-muted)] pb-3">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="mt-5">
          <PropertyGridSkeleton />
        </div>
      </div>
    </div>
  );
}

/** Property detail: gallery + summary panel + contact rail. */
export function PropertyDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[var(--content-max)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Skeleton className="h-3 w-56" />
      <div className="mt-4 grid gap-6 lg:grid-cols-[1.9fr_1fr]">
        <div className="space-y-5">
          <Skeleton className="aspect-[16/10] w-full" rounded="lg" />
          <div className="panel space-y-4 p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-9 w-full max-w-md" />
            <SkeletonText lines={3} className="pt-2" />
          </div>
        </div>
        <div className="panel space-y-3 p-5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

/** List surface shared by the marketplace home sections. */
export function SectionGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="mx-auto max-w-[var(--content-max)] px-4 py-12 sm:px-6 lg:px-8">
      <Skeleton className="h-6 w-52" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-5">
        <PropertyGridSkeleton count={count} />
      </div>
    </div>
  );
}

/** Provider/Admin portal page: title band + panels. */
export function PortalPageSkeleton({
  panels = 2,
  fullHeight = false,
}: {
  panels?: number;
  fullHeight?: boolean;
}) {
  return (
    <div className={fullHeight ? 'min-h-screen p-6 sm:p-8' : undefined}>
      <div className="mb-6 border-b border-[var(--border-muted)] pb-5">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="mt-3 h-4 w-full max-w-md" />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {Array.from({ length: panels }).map((_, index) => (
          <div key={index} className="panel space-y-3 p-5">
            <Skeleton className="h-4 w-32" />
            <SkeletonText lines={4} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Auth form: label + control pairs. */
export function AuthFormSkeleton() {
  return (
    <div className="w-full max-w-[400px]">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-7 w-56" />
      <Skeleton className="mt-3 h-4 w-full" />
      <div className="mt-6 space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  );
}
