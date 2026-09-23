import { Badge } from './Badge';

const STATUS_VARIANTS = {
  ACTIVE: 'success',
  DRAFT: 'warning',
  ARCHIVED: 'default',
  VERIFIED: 'success',
  APPROVED: 'success',
  PUBLISHED: 'success',
  PENDING: 'warning',
  PENDING_REVIEW: 'warning',
  IN_REVIEW: 'warning',
  SUSPENDED: 'error',
  REJECTED: 'error',
  DISABLED: 'error',
  REVOKED: 'error',
} as const;

export function StatusBadge({
  status,
  label,
  size = 'md',
}: {
  status: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const normalized = status.toUpperCase();
  const variant =
    STATUS_VARIANTS[normalized as keyof typeof STATUS_VARIANTS] ?? 'default';
  return (
    <Badge variant={variant} size={size}>
      {label ?? status}
    </Badge>
  );
}
