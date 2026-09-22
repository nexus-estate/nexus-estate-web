import { Badge } from './Badge';

const STATUS_VARIANTS = {
  ACTIVE: 'success',
  VERIFIED: 'success',
  APPROVED: 'success',
  PUBLISHED: 'success',
  PENDING: 'warning',
  PENDING_REVIEW: 'warning',
  IN_REVIEW: 'warning',
  DRAFT: 'default',
  SUSPENDED: 'error',
  REJECTED: 'error',
  DISABLED: 'error',
  REVOKED: 'error',
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
