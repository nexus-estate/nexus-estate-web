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
    <section
      className={clsx(muted ? 'app-panel-muted' : 'app-panel', className)}
    >
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
    <div className="flex flex-col gap-3 border-b border-[var(--border-muted)] px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
      <div>
        <h2 className="text-base font-semibold text-[var(--text)]">{title}</h2>
        {description && (
          <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
