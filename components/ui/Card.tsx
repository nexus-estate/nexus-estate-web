import { type ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
}

function Card({ children, className }: CardProps) {
  return <div className={clsx('panel', className)}>{children}</div>;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div
      className={clsx(
        'border-b border-[var(--border-muted)] px-4 py-3.5 sm:px-5',
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
  return <div className={clsx('px-4 py-4 sm:px-5', className)}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div
      className={clsx(
        'border-t border-[var(--border-muted)] bg-[var(--surface-subtle)] px-4 py-3.5 sm:px-5',
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
