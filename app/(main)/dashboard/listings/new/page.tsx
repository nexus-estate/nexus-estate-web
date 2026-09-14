'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { listingApi } from '@/lib/api/listing/listing.api';

export default function NewListingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'apartment',
    purpose: 'buy',
    price: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    city: '',
    district: '',
    address: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isLoading && !isAuthenticated) {
    router.push('/signin');
    return null;
  }

  const handleChange =
    (field: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await listingApi.create({
        property: {
          title: form.title,
          description: form.description,
          type: form.type,
          purpose: form.purpose,
          price: parseFloat(form.price) || 0,
          area: parseFloat(form.area) || 0,
          bedrooms: parseInt(form.bedrooms) || 0,
          bathrooms: parseInt(form.bathrooms) || 0,
          city: form.city,
          district: form.district,
          address: form.address,
        },
      });
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đăng tin thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Đăng tin thành công!
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Đang chuyển về Dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 hover:underline"
          >
            &larr; Quay lại Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Đăng tin mới
          </h1>
          <p className="text-sm text-gray-500">
            Nhập thông tin bất động sản cần đăng
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Thông tin cơ bản
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tiêu đề
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={handleChange('title')}
                placeholder="Ví dụ: Căn hộ chung cư The Sun Avenue"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Loại
                </label>
                <select
                  value={form.type}
                  onChange={handleChange('type')}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="apartment">Căn hộ</option>
                  <option value="house">Nhà phố</option>
                  <option value="villa">Biệt thự</option>
                  <option value="land">Đất nền</option>
                  <option value="office">Văn phòng</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mục đích
                </label>
                <select
                  value={form.purpose}
                  onChange={handleChange('purpose')}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="buy">Bán</option>
                  <option value="rent">Cho thuê</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Giá
              </label>
              <input
                type="number"
                required
                value={form.price}
                onChange={handleChange('price')}
                placeholder="Giá tính bằng VND"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Diện tích (m²)
                </label>
                <input
                  type="number"
                  value={form.area}
                  onChange={handleChange('area')}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phòng ngủ
                </label>
                <input
                  type="number"
                  value={form.bedrooms}
                  onChange={handleChange('bedrooms')}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phòng tắm
                </label>
                <input
                  type="number"
                  value={form.bathrooms}
                  onChange={handleChange('bathrooms')}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mô tả
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={handleChange('description')}
                placeholder="Mô tả chi tiết về bất động sản..."
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
              />
            </div>

            <h2 className="text-lg font-semibold text-gray-900 pt-2">
              Địa chỉ
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Thành phố
                </label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={handleChange('city')}
                  placeholder="Hồ Chí Minh"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quận/Huyện
                </label>
                <input
                  type="text"
                  value={form.district}
                  onChange={handleChange('district')}
                  placeholder="Quận 2"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Địa chỉ cụ thể
              </label>
              <input
                type="text"
                value={form.address}
                onChange={handleChange('address')}
                placeholder="12 Mai Chí Thọ"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Đang đăng...' : 'Đăng tin'}
            </button>
            <Link
              href="/dashboard"
              className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
