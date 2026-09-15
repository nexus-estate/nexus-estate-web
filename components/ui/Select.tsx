import { forwardRef, type SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, placeholder, error, className, id, ...props }, ref) => {
    const selectId =
      id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={clsx(
            'block min-h-10 w-full rounded-[var(--radius-md)] border bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] shadow-[var(--shadow-xs)] transition-[border-color,box-shadow,background-color] focus:outline-none focus:ring-[3px] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-disabled)]',
            error
              ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[rgb(207_34_46_/_0.16)]'
              : 'border-[var(--border-interactive)] hover:border-[var(--border-strong)] focus:border-[var(--focus-border)] focus:ring-[var(--focus-ring)]',
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p
            id={`${selectId}-error`}
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

Select.displayName = 'Select';
