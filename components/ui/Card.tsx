import { type ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
}

function Card({ children, className }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-xs)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div
      className={clsx(
        'border-b border-[var(--border-muted)] px-5 py-4 sm:px-6',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

function CardBody({ children, className }: CardBodyProps) {
  return <div className={clsx('px-5 py-5 sm:px-6', className)}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div
      className={clsx(
        'border-t border-[var(--border-muted)] bg-[var(--surface-subtle)] px-5 py-4 sm:px-6',
        className,
      )}
    >
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export { Card };
export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps };
