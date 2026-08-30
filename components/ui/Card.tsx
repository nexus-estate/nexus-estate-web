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
        'rounded-lg border border-gray-200 bg-white shadow-sm',
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
    <div className={clsx('border-b border-gray-200 px-6 py-4', className)}>
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

function CardBody({ children, className }: CardBodyProps) {
  return <div className={clsx('px-6 py-4', className)}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={clsx('border-t border-gray-200 px-6 py-4', className)}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export { Card };
export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps };
