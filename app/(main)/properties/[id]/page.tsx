'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { leadApi } from '@/lib/api/lead/lead.api';
import { propertyApi } from '@/lib/api/property/property.api';
import type { Property } from '@/lib/api/property/property.types';
import { searchApi } from '@/lib/api/search/search.api';

const formatPrice = (price: number) => {
  if (price >= 1000000000) return `${(price / 1000000000).toFixed(2)} tỷ`;
  if (price >= 1000000) return `${(price / 1000000).toFixed(0)} triệu`;
  return price.toLocaleString('vi-VN');
};

export default function PropertyDetailPage() {
  const params = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [similar, setSimilar] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    message: '',
  });
  const [leadSent, setLeadSent] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const [propData, simData] = await Promise.all([
          propertyApi.getById(params.id as string),
          searchApi.similarProperties(params.id as string, 3).catch(() => []),
        ]);
        setProperty(propData);
        setSimilar(Array.isArray(simData) ? simData : []);
      } catch (err) {
        console.error('Failed to fetch property:', err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [params.id]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadLoading(true);
    try {
      await leadApi.create({
        listingId: params.id as string,
        name: leadForm.name,
        phone: leadForm.phone,
        message: leadForm.message,
      });
      setLeadSent(true);
    } catch {
      alert('Gửi liên hệ thất bại. Vui lòng thử lại.');
    } finally {
      setLeadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="skeleton h-96 rounded-xl" />
          <div className="mt-6 space-y-4">
            <div className="skeleton h-8 w-2/3 rounded" />
            <div className="skeleton h-6 w-1/3 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">Không tìm thấy bất động sản.</p>
          <Link
            href="/properties"
            className="mt-2 inline-block text-blue-600 hover:underline"
          >
            Quay lại
          </Link>
        </div>
      </div>
    );
  }

  const p = property;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <Link href="/properties" className="hover:text-blue-600">
            Nhà đất
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{p.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero image */}
            <div className="flex h-72 sm:h-96 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 text-white">
              <div className="text-center">
                <span className="text-8xl opacity-40">
                  {p.type === 'apartment'
                    ? '🏢'
                    : p.type === 'house'
                      ? '🏠'
                      : p.type === 'villa'
                        ? '🏡'
                        : '🗺️'}
                </span>
              </div>
            </div>

            {/* Property info */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h1 className="text-2xl font-bold text-gray-900">{p.title}</h1>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {p.price ? formatPrice(p.price) : 'Liên hệ'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {p.purpose === 'buy' ? 'Bán' : 'Cho thuê'} &middot;{' '}
                {p.type === 'apartment'
                  ? 'Căn hộ'
                  : p.type === 'house'
                    ? 'Nhà phố'
                    : p.type === 'villa'
                      ? 'Biệt thự'
                      : 'Đất nền'}
              </p>

              <div className="mt-4 flex flex-wrap gap-4 border-y border-gray-100 py-4">
                {p.area && (
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{p.area}</p>
                    <p className="text-xs text-gray-500">m²</p>
                  </div>
                )}
                {p.bedrooms && (
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">
                      {p.bedrooms}
                    </p>
                    <p className="text-xs text-gray-500">Phòng ngủ</p>
                  </div>
                )}
                {p.bathrooms && (
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">
                      {p.bathrooms}
                    </p>
                    <p className="text-xs text-gray-500">Phòng tắm</p>
                  </div>
                )}
              </div>

              {p.description && (
                <div className="mt-4">
                  <h2 className="font-semibold text-gray-900">Mô tả</h2>
                  <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              )}

              <div className="mt-4">
                <h2 className="font-semibold text-gray-900">Địa chỉ</h2>
                <p className="mt-1 text-sm text-gray-600">
                  {p.city}
                  {p.district ? `, ${p.district}` : ''}
                  {p.address ? ` - ${p.address}` : ''}
                </p>
              </div>

              {p.broker && (
                <div className="mt-6 rounded-xl bg-gray-50 p-4">
                  <h2 className="font-semibold text-gray-900">
                    Thông tin môi giới
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {p.broker.fullName}
                  </p>
                  {p.broker.phone && (
                    <p className="text-sm text-blue-600">{p.broker.phone}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Contact form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-bold text-gray-900">Liên hệ ngay</h2>
              <p className="mt-1 text-sm text-gray-500">
                Quan tâm đến bất động sản này?
              </p>

              {leadSent ? (
                <div className="mt-4 rounded-xl bg-green-50 p-4 text-center">
                  <p className="text-sm font-medium text-green-700">
                    Gửi liên hệ thành công!
                  </p>
                  <p className="mt-1 text-xs text-green-600">
                    Môi giới sẽ liên hệ với bạn sớm nhất.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="mt-4 space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Họ và tên *"
                    value={leadForm.name}
                    onChange={(e) =>
                      setLeadForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Số điện thoại *"
                    value={leadForm.phone}
                    onChange={(e) =>
                      setLeadForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <textarea
                    placeholder="Lời nhắn (không bắt buộc)"
                    rows={3}
                    value={leadForm.message}
                    onChange={(e) =>
                      setLeadForm((f) => ({ ...f, message: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={leadLoading}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {leadLoading ? 'Đang gửi...' : 'Gửi liên hệ'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Similar properties */}
        {similar.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-gray-900">
              Bất động sản tương tự
            </h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((s) => (
                <Link
                  key={s.id}
                  href={`/properties/${s.id}`}
                  className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg"
                >
                  <div className="relative h-40 bg-gradient-to-br from-gray-400 to-gray-600">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl opacity-30">
                        {s.type === 'apartment'
                          ? '🏢'
                          : s.type === 'house'
                            ? '🏠'
                            : s.type === 'villa'
                              ? '🏡'
                              : '🗺️'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-1">
                      {s.title}
                    </h3>
                    <p className="mt-1 text-base font-bold text-blue-600">
                      {s.price ? formatPrice(s.price) : 'Liên hệ'}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">{s.city}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
