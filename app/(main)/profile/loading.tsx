import { PortalPageSkeleton } from '@/components/ui/Skeleton';

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-[var(--content-max)] px-4 py-10 sm:px-6 lg:px-8">
      <PortalPageSkeleton panels={1} />
    </div>
  );
}
