import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, hint, leftIcon, rightIcon, className, id, ...props },
    ref,
  ) => {
    const inputId =
      id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="field-label">
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
              'field',
              error && 'field-invalid',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
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
        {hint && !error && <p className="field-help">{hint}</p>}
        {error && (
          <p id={`${inputId}-error`} className="field-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
