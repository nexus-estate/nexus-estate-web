import { FormHTMLAttributes } from 'react';
import clsx from 'clsx';

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  errors?: Record<string, string | undefined>;
  className?: string;
}

export function Form({ children, errors, className, ...props }: FormProps) {
  return (
    <form className={clsx('space-y-6', className)} noValidate {...props}>
      {errors?.form && (
        <div
          role="alert"
          className="rounded-[var(--radius-md)] border border-[var(--danger)]/20 bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger-strong)]"
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
  required,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]"
      >
        {label}
        {required && <span className="ml-1 text-[var(--danger)]">*</span>}
      </label>
      {children}
      {error && (
        <p
          role="alert"
          className="mt-1.5 text-xs font-medium text-[var(--danger)]"
        >
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
        'flex items-center gap-3 border-t border-[var(--border-muted)] pt-5',
        alignClass[align],
      )}
    >
      {children}
    </div>
  );
}
