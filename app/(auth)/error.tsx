'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-red-50 p-6">
        <span className="text-4xl">⚠️</span>
      </div>
      <h1 className="mt-6 text-2xl font-bold text-gray-900">Đã xảy ra lỗi</h1>
      <p className="mt-2 text-gray-500">
        Vui lòng thử lại hoặc quay về trang chủ.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Thử lại
        </button>
        <Link
          href="/"
          className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
