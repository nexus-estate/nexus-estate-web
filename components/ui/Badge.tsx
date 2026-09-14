import { type ReactNode } from 'react';
import clsx from 'clsx';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success:
    'border-[var(--success)]/20 bg-[var(--success-soft)] text-[var(--success-strong)]',
  warning:
    'border-[var(--warning)]/20 bg-[var(--warning-soft)] text-[var(--warning-strong)]',
  error:
    'border-[var(--danger)]/20 bg-[var(--danger-soft)] text-[var(--danger-strong)]',
  info: 'border-[var(--info)]/20 bg-[var(--info-soft)] text-[var(--info-strong)]',
  default:
    'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1 text-sm',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-[var(--radius-full)] border font-semibold leading-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
