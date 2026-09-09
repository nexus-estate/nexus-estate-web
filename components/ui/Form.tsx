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
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
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
        className="mb-1 block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-600">
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
      className={clsx('flex items-center space-x-3 pt-4', alignClass[align])}
    >
      {children}
    </div>
  );
}
