import { FormHTMLAttributes } from 'react';
import clsx from 'clsx';

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  errors?: Record<string, string | undefined>;
  className?: string;
}

export function Form({ children, errors, className, ...props }: FormProps) {
  return (
    <form className={clsx('space-y-5', className)} noValidate {...props}>
      {errors?.form && (
        <div
          role="alert"
          className="rounded-[var(--radius-sm)] border border-[var(--danger)]/25 bg-[var(--danger-soft)] px-3.5 py-2.5 text-sm font-medium text-[var(--danger-strong)]"
        >
          {errors.form}
        </div>
      )}
      {children}
    </form>
  );
}

export function FormField({
  label,
  name,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="field-label">
        {label}
        {required && (
          <span className="ml-0.5 text-[var(--danger)]" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="field-help">{hint}</p>}
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormActions({
  children,
  align = 'right',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
}) {
  const alignClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };
  return (
    <div
      className={clsx(
        'flex flex-wrap items-center gap-3 border-t border-[var(--border-muted)] pt-4',
        alignClass[align],
      )}
    >
      {children}
    </div>
  );
}
