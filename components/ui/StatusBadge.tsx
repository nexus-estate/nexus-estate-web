import { Badge } from './Badge';

const STATUS_VARIANTS = {
  ACTIVE: 'success',
  VERIFIED: 'success',
  PUBLISHED: 'success',
  PENDING: 'warning',
  PENDING_REVIEW: 'warning',
  SUSPENDED: 'error',
  REJECTED: 'error',
  DISABLED: 'error',
} as const;

export function StatusBadge({
  status,
  label,
}: {
  status: string;
  label?: string;
}) {
  const normalized = status.toUpperCase();
  const variant =
    STATUS_VARIANTS[normalized as keyof typeof STATUS_VARIANTS] ?? 'default';
  return <Badge variant={variant}>{label ?? status}</Badge>;
}
