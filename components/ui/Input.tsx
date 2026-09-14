import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId =
      id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-subtle)]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'block min-h-10 w-full rounded-[var(--radius-md)] border bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] shadow-[var(--shadow-xs)] transition-[border-color,box-shadow,background-color] placeholder:text-[var(--text-subtle)] focus:outline-none focus:ring-[3px] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-disabled)]',
              error
                ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[rgb(207_34_46_/_0.16)]'
                : 'border-[var(--border-interactive)] hover:border-[var(--border-strong)] focus:border-[var(--focus-border)] focus:ring-[var(--focus-ring)]',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-subtle)]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-xs font-medium text-[var(--danger)]"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
