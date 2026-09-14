'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { propertyApi } from '@/lib/api/property/property.api';
import type {
  Property,
  PropertyListResponse,
} from '@/lib/api/property/property.types';

const PROPERTY_TYPES = [
  { value: '', label: 'Tất cả loại' },
  { value: 'apartment', label: 'Căn hộ' },
  { value: 'house', label: 'Nhà phố' },
  { value: 'villa', label: 'Biệt thự' },
  { value: 'land', label: 'Đất nền' },
  { value: 'office', label: 'Văn phòng' },
];

const PURPOSES = [
  { value: '', label: 'Tất cả' },
  { value: 'buy', label: 'Bán' },
  { value: 'rent', label: 'Cho thuê' },
];

const THUMBNAIL_GRADIENTS = [
  'from-blue-400 to-blue-600',
  'from-emerald-400 to-emerald-600',
  'from-purple-400 to-purple-600',
  'from-amber-400 to-amber-600',
] as const;

function formatPrice(price: number): string {
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)} tỷ`;
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)} triệu`;
  return price.toLocaleString('vi-VN');
}

function getThumbnailGradient(id: string): string {
  const index =
    id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    THUMBNAIL_GRADIENTS.length;
  return THUMBNAIL_GRADIENTS[index];
}

function PropertyCard({ property }: { property: Property }) {
  const colorClass = getThumbnailGradient(property.id);

  return (
    <Link
      href={`/properties/${property.id}`}
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg"
    >
      <div className={`relative h-48 bg-gradient-to-br ${colorClass}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl opacity-30">
            {property.type === 'apartment'
              ? '🏢'
              : property.type === 'house'
                ? '🏠'
                : property.type === 'villa'
                  ? '🏡'
                  : '🗺️'}
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-900">
            {property.purpose === 'buy' ? 'Bán' : 'Cho thuê'}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-1">
          {property.title}
        </h3>
        <p className="mt-1 text-lg font-bold text-blue-600">
          {property.price != null ? formatPrice(property.price) : 'Liên hệ'}
        </p>
        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
          {property.area != null && property.area > 0 && (
            <span>{property.area} m²</span>
          )}
          {property.bedrooms != null && property.bedrooms > 0 && (
            <span>{property.bedrooms} PN</span>
          )}
          {property.bathrooms != null && property.bathrooms > 0 && (
            <span>{property.bathrooms} WC</span>
          )}
        </div>
        <p className="mt-1.5 text-xs text-gray-400">
          {property.city}
          {property.district ? `, ${property.district}` : ''}
        </p>
      </div>
    </Link>
  );
}

export default function PropertiesPage() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    purpose: searchParams.get('purpose') || '',
    city: searchParams.get('city') || '',
    query: searchParams.get('query') || '',
    page: 1,
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await propertyApi.list({
          page: filters.page,
          limit: 12,
          type: filters.type,
          purpose: filters.purpose,
          city: filters.city,
          q: filters.query,
        });
        const items = Array.isArray(response)
          ? response
          : ((response as PropertyListResponse).data ??
            (response as PropertyListResponse).properties ??
            (response as PropertyListResponse).items ??
            []);
        const itemsArray = Array.isArray(items) ? items : [];
        setProperties(itemsArray);
        setTotal(
          !Array.isArray(response) && 'total' in response
            ? (response.total ?? itemsArray.length)
            : itemsArray.length,
        );
      } catch {
        setProperties([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filters]);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label
                className="block text-xs font-medium text-gray-500 mb-1"
                htmlFor="search-query"
              >
                Tìm kiếm
              </label>
              <input
                id="search-query"
                type="text"
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                placeholder="Địa điểm, dự án..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
            <div className="w-40">
              <label
                className="block text-xs font-medium text-gray-500 mb-1"
                htmlFor="filter-purpose"
              >
                Mục đích
              </label>
              <select
                id="filter-purpose"
                value={filters.purpose}
                onChange={(e) => handleFilterChange('purpose', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
              >
                {PURPOSES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-44">
              <label
                className="block text-xs font-medium text-gray-500 mb-1"
                htmlFor="filter-type"
              >
                Loại
              </label>
              <select
                id="filter-type"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 outline-none"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-44">
              <label
                className="block text-xs font-medium text-gray-500 mb-1"
                htmlFor="filter-city"
              >
                Thành phố
              </label>
              <input
                id="filter-city"
                type="text"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                placeholder="Hồ Chí Minh..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mt-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            {filters.purpose === 'rent'
              ? 'Bất động sản cho thuê'
              : 'Bất động sản'}
          </h1>
          {total > 0 && (
            <p className="text-sm text-gray-500">{total} kết quả</p>
          )}
        </div>

        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-200 bg-white overflow-hidden"
                >
                  <div className="skeleton h-48" />
                  <div className="space-y-3 p-4">
                    <div className="skeleton h-4 w-3/4 rounded" />
                    <div className="skeleton h-4 w-1/2 rounded" />
                    <div className="skeleton h-3 w-2/3 rounded" />
                  </div>
                </div>
              ))
            : properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
        </div>

        {!loading && properties.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-gray-500">Không tìm thấy bất động sản nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}
