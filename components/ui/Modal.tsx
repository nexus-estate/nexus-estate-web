'use client';

import { useEffect, useCallback, useId, useRef } from 'react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { createPortal } from 'react-dom';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  ariaLabel?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'mx-4 max-w-full',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true,
  closeOnEscape = true,
  ariaLabel,
}: ModalProps) {
  const t = useTranslations('common');
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose();
      }
    },
    [closeOnEscape, onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    const focusable = dialogRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();
    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const elements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute('disabled'));
      if (!elements.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleTab);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleTab);
      document.body.style.overflow = '';
      previousFocus.current?.focus();
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="animate-fade-in fixed inset-0 bg-[var(--overlay)]"
        onClick={closeOnOverlay ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? ariaLabel : undefined}
        className={clsx(
          'animate-fade-up panel relative flex max-h-[85vh] w-full flex-col overflow-hidden shadow-[var(--shadow-lg)]',
          sizeClasses[size],
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-[var(--border-muted)] px-4 py-3 sm:px-5">
            <h2
              id={titleId}
              className="text-sm font-semibold text-[var(--text)]"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
              type="button"
              aria-label={t('actions.close')}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-[var(--border-muted)] bg-[var(--surface-subtle)] px-4 py-3 sm:px-5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
