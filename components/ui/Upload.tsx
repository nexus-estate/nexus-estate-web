'use client';

import { useCallback, useState, useRef } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';

interface UploadedFile {
  file: File;
  preview?: string;
  progress?: number;
}

interface UploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onUpload: (files: File[]) => void;
  className?: string;
}

export function Upload({
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024,
  onUpload,
  className,
}: UploadProps) {
  const t = useTranslations('common.upload');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      setError(null);
      const validFiles: File[] = [];
      const fileArray = Array.from(files);

      for (const file of fileArray) {
        if (file.size > maxSize) {
          setError(
            t('fileTooLarge', { name: file.name, size: maxSize / 1024 / 1024 }),
          );
          return;
        }
        validFiles.push(file);
      }

      const newFiles: UploadedFile[] = validFiles.map((file) => ({
        file,
        preview: file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : undefined,
      }));

      setUploadedFiles((prev) =>
        multiple ? [...prev, ...newFiles] : newFiles,
      );
      onUpload(validFiles);
    },
    [maxSize, multiple, onUpload, t],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) processFiles(e.target.files);
    },
    [processFiles],
  );

  const removeFile = useCallback((index: number) => {
    setUploadedFiles((prev) => {
      const file = prev[index];
      if (file.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  return (
    <div className={className}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={clsx(
          'flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed px-6 py-8 text-center transition-[border-color,background-color,box-shadow]',
          isDragging
            ? 'border-[var(--primary)] bg-[var(--primary-soft)]'
            : 'border-[var(--border-strong)] bg-[var(--surface-subtle)] hover:border-[var(--border-interactive)] hover:bg-[var(--surface-hover)]',
        )}
      >
        <svg
          className="mb-2.5 h-6 w-6 text-[var(--text-subtle)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="text-sm text-[var(--text-muted)]">
          <span className="font-semibold text-[var(--primary)]">
            {t('click')}
          </span>{' '}
          {t('drop')}
        </p>
        <p className="mt-1 text-xs text-[var(--text-subtle)]">
          {accept ? accept.replace(/,/g, ', ') : t('anyFile')}{' '}
          {t('upTo', { size: maxSize / 1024 / 1024 })}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}

      {uploadedFiles.length > 0 && (
        <ul className="mt-3 space-y-2">
          {uploadedFiles.map((file, index) => (
            <li
              key={`${file.file.name}-${file.file.lastModified}`}
              className="panel-flush flex items-center px-3 py-2"
            >
              {file.preview ? (
                <Image
                  src={file.preview}
                  alt={file.file.name}
                  width={36}
                  height={36}
                  unoptimized
                  className="mr-3 h-9 w-9 rounded-[var(--radius-xs)] border border-[var(--border-muted)] object-cover"
                />
              ) : (
                <div className="mr-3 grid h-9 w-9 place-items-center rounded-[var(--radius-xs)] bg-[var(--surface-muted)] text-[var(--text-subtle)]">
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
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--text)]">
                  {file.file.name}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {(file.file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="ml-2 grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--danger)]"
                aria-label={t('remove', { name: file.file.name })}
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
