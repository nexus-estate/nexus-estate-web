'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function SignUpPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (form.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }

    setLoading(true);

    try {
      await signup({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber || undefined,
      });
      setSuccess(true);
      setTimeout(() => router.push('/signin'), 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Đăng ký thất bại. Vui lòng thử lại.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">Đăng ký thành công!</h2>
            <p className="mt-2 text-sm text-gray-500">Đang chuyển đến trang đăng nhập...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {/* Header */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-blue-600">
              <svg className="h-6 w-6" viewBox="0 0 28 28" fill="currentColor">
                <path d="M14 2L2 12h3v10h7v-6h4v6h7V12h3L14 2z" />
              </svg>
              Nexus Estate
            </Link>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Tạo tài khoản</h1>
            <p className="mt-1 text-sm text-gray-500">
              Đã có tài khoản?{' '}
              <Link href="/signin" className="font-medium text-blue-600 hover:text-blue-700">
                Đăng nhập
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={form.fullName}
                onChange={handleChange('fullName')}
                placeholder="Nguyễn Văn A"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange('email')}
                placeholder="you@example.com"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Số điện thoại
              </label>
              <input
                id="phoneNumber"
                type="tel"
                value={form.phoneNumber}
                onChange={handleChange('phoneNumber')}
                placeholder="090 123 4567"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange('password')}
                placeholder="Tối thiểu 8 ký tự"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={form.confirmPassword}
                onChange={handleChange('confirmPassword')}
                placeholder="Nhập lại mật khẩu"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Bằng cách đăng ký, bạn đồng ý với{' '}
              <Link href="/" className="text-blue-600 hover:underline">Điều khoản dịch vụ</Link> và{' '}
              <Link href="/" className="text-blue-600 hover:underline">Chính sách bảo mật</Link>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}