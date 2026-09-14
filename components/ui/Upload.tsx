import { useCallback, useState, useRef } from 'react';
import Image from 'next/image';
import clsx from 'clsx';

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
            `File "${file.name}" exceeds ${maxSize / 1024 / 1024}MB limit`,
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
    [maxSize, multiple, onUpload],
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
          'flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed p-8 text-center transition-[border-color,background-color,box-shadow]',
          isDragging
            ? 'border-[var(--primary)] bg-[var(--primary-soft)] shadow-[0_0_0_3px_var(--focus-ring)]'
            : 'border-[var(--border-strong)] bg-[var(--surface-subtle)] hover:border-[var(--border-interactive)] hover:bg-[var(--surface-hover)]',
        )}
      >
        <svg
          className="mb-3 h-10 w-10 text-[var(--text-subtle)]"
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
        <p className="mb-1 text-sm text-[var(--text-muted)]">
          <span className="font-semibold text-[var(--primary)]">Click to upload</span>{' '}
          or drag and drop
        </p>
        <p className="text-xs text-[var(--text-subtle)]">
          {accept ? accept.replace(/,/g, ', ') : 'Any file'} up to{' '}
          {maxSize / 1024 / 1024}MB
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
        <p role="alert" className="mt-2 text-xs font-medium text-[var(--danger)]">
          {error}
        </p>
      )}

      {uploadedFiles.length > 0 && (
        <ul className="mt-4 space-y-2">
          {uploadedFiles.map((file, index) => (
            <li
              key={`${file.file.name}-${file.file.lastModified}`}
              className="flex items-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 shadow-[var(--shadow-xs)]"
            >
              {file.preview ? (
                <Image
                  src={file.preview}
                  alt={file.file.name}
                  width={40}
                  height={40}
                  unoptimized
                  className="mr-3 h-10 w-10 rounded-[var(--radius-sm)] object-cover"
                />
              ) : (
                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--surface-muted)] text-[var(--text-subtle)]">
                  <svg
                    className="h-5 w-5"
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
                className="ml-2 rounded-[var(--radius-sm)] p-1.5 text-[var(--text-subtle)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
                aria-label={`Remove ${file.file.name}`}
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
