import type { ReactNode } from 'react';
import clsx from 'clsx';

export function Panel({
  children,
  className,
  muted = false,
}: {
  children: ReactNode;
  className?: string;
  muted?: boolean;
}) {
  return (
    <section className={clsx(muted ? 'panel-muted' : 'panel', className)}>
      {children}
    </section>
  );
}

export function SectionHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-[var(--border-muted)] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs leading-5 text-[var(--text-muted)]">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      )}
    </div>
  );
}
