'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function SignUpPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const update =
    (field: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (form.password.length < 8)
      return setError('Mật khẩu phải có ít nhất 8 ký tự.');
    if (form.password !== form.confirmPassword)
      return setError('Mật khẩu xác nhận không khớp.');
    setLoading(true);
    try {
      await register({ email: form.email, password: form.password });
      setSuccess(true);
      setTimeout(() => router.push('/signin'), 1800);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể tạo tài khoản. Vui lòng thử lại.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="animate-fade-up text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-[#c7a66b]/50 bg-[#efe7d7] text-[#8b6b38]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-9 w-9"
            aria-hidden="true"
          >
            <path
              d="M5 12.5l4.5 4.5L19 7"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </div>
        <p className="eyebrow mt-8">Hoàn tất đăng ký</p>
        <h1 className="mt-5 font-display text-5xl leading-none text-[#102f2d]">
          Chào mừng bạn đến
          <br />
          <span className="italic text-[#9a7b4f]">Nexus Estate.</span>
        </h1>
        <p className="mt-6 text-sm leading-6 text-[#75807d]">
          Tài khoản đã được tạo. Chúng tôi đang chuyển bạn đến trang đăng
          nhập...
        </p>
        <Link
          href="/signin"
          className="mt-8 inline-flex border-b border-[#9a7b4f] pb-2 text-xs font-bold uppercase tracking-[.15em] text-[#173b38]"
        >
          Đăng nhập ngay →
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-up pt-12 lg:pt-0">
      <p className="eyebrow">Trở thành thành viên</p>
      <h1 className="mt-5 font-display text-5xl leading-none tracking-[-.03em] text-[#102f2d]">
        Bắt đầu hành trình
        <br />
        <span className="italic text-[#9a7b4f]">tìm chốn riêng.</span>
      </h1>
      <p className="mt-5 text-sm leading-6 text-[#75807d]">
        Tạo tài khoản để lưu tài sản yêu thích và nhận tư vấn phù hợp với nhu
        cầu của bạn.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
              value={form.email}
              onChange={update('email')}
              placeholder="name@example.com"
              className="auth-input pl-11"
            />
          </div>
        </label>
        <label className="block">
          <span className="auth-label">Mật khẩu</span>
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
              autoComplete="new-password"
              required
              minLength={8}
              value={form.password}
              onChange={update('password')}
              placeholder="Tối thiểu 8 ký tự"
              className="auth-input px-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center text-[#89918f]"
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
        <label className="block">
          <span className="auth-label">Xác nhận mật khẩu</span>
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
              autoComplete="new-password"
              required
              minLength={8}
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              placeholder="Nhập lại mật khẩu"
              className="auth-input pl-11"
            />
          </div>
        </label>
        <label className="flex cursor-pointer items-start gap-3 pt-1 text-xs leading-5 text-[#697572]">
          <input
            required
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#173b38]"
          />
          <span>
            Tôi đồng ý với{' '}
            <Link
              href="/"
              className="font-semibold text-[#8e7043] underline underline-offset-2"
            >
              Điều khoản dịch vụ
            </Link>{' '}
            và{' '}
            <Link
              href="/"
              className="font-semibold text-[#8e7043] underline underline-offset-2"
            >
              Chính sách bảo mật
            </Link>
            .
          </span>
        </label>
        <button type="submit" disabled={loading} className="auth-submit">
          <span>{loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}</span>
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border border-white/40 border-t-white" />
          ) : (
            <span aria-hidden="true">→</span>
          )}
        </button>
      </form>
      <p className="mt-7 text-center text-sm text-[#75807d]">
        Đã là thành viên?{' '}
        <Link
          href="/signin"
          className="font-semibold text-[#8e7043] underline decoration-[#c8b087] underline-offset-4"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
