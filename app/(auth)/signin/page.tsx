'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }
    setLoading(true);
    try {
      await login({ email, password });
      router.push('/');
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể đăng nhập. Vui lòng thử lại.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-up pt-12 lg:pt-0">
      <p className="eyebrow">Chào mừng trở lại</p>
      <h1 className="mt-5 font-display text-5xl leading-none tracking-[-.03em] text-[#102f2d]">
        Đăng nhập vào
        <br />
        <span className="italic text-[#9a7b4f]">không gian riêng.</span>
      </h1>
      <p className="mt-5 text-sm leading-6 text-[#75807d]">
        Quản lý bộ sưu tập yêu thích và kết nối với chuyên gia bất động sản của
        bạn.
      </p>

      <form onSubmit={handleSubmit} className="mt-9 space-y-5">
        {error && (
          <div
            role="alert"
            className="border-l-2 border-[#a64336] bg-[#f7ebe8] px-4 py-3 text-sm leading-5 text-[#8e352c]"
          >
            {error}
          </div>
        )}
        <label className="block">
          <span className="auth-label">Địa chỉ email</span>
          <div className="relative mt-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="auth-field-icon"
              aria-hidden="true"
            >
              <path
                d="M4 6h16v12H4zM4 7l8 6 8-6"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              className="auth-input pl-11"
            />
          </div>
        </label>
        <label className="block">
          <div className="flex items-center justify-between">
            <span className="auth-label">Mật khẩu</span>
            <span className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#9a7b4f]">
              Hỗ trợ tài khoản: 1900 1234
            </span>
          </div>
          <div className="relative mt-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="auth-field-icon"
              aria-hidden="true"
            >
              <rect
                x="5"
                y="10"
                width="14"
                height="10"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path
                d="M8 10V7a4 4 0 018 0v3"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tối thiểu 8 ký tự"
              className="auth-input px-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center text-[#89918f] transition hover:text-[#173b38]"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="2.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
              </svg>
            </button>
          </div>
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-xs text-[#697572]">
          <input type="checkbox" className="h-4 w-4 accent-[#173b38]" /> Ghi nhớ
          đăng nhập trên thiết bị này
        </label>
        <button type="submit" disabled={loading} className="auth-submit">
          <span>{loading ? 'Đang xác thực...' : 'Đăng nhập'}</span>
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border border-white/40 border-t-white" />
          ) : (
            <span aria-hidden="true">→</span>
          )}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-[#75807d]">
        Chưa có tài khoản?{' '}
        <Link
          href="/signup"
          className="font-semibold text-[#8e7043] underline decoration-[#c8b087] underline-offset-4"
        >
          Tạo tài khoản mới
        </Link>
      </p>
      <div className="mt-9 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[.15em] text-[#949c99]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path
            d="M12 3l7 3v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6l7-3z"
            stroke="currentColor"
            strokeWidth="1.4"
          />
        </svg>
        Kết nối được bảo vệ an toàn
      </div>
    </div>
  );
}
