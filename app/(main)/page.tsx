import Link from 'next/link';
import { propertyApi } from '@/lib/api/property/property.api';
import type {
  Property as ApiProperty,
  PropertyListResponse,
} from '@/lib/api/property/property.types';

type Property = ApiProperty;

const PROPERTY_TYPES = [
  { key: 'apartment', label: 'Căn hộ', icon: '🏢' },
  { key: 'house', label: 'Nhà phố', icon: '🏠' },
  { key: 'villa', label: 'Biệt thự', icon: '🏡' },
  { key: 'land', label: 'Đất nền', icon: '🗺️' },
  { key: 'office', label: 'Văn phòng', icon: '🏢' },
];

const CITIES = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Đà Lạt', 'Bình Dương'];

function formatPrice(price: number): string {
  if (price >= 1000000000) return `${(price / 1000000000).toFixed(1)} tỷ`;
  if (price >= 1000000) return `${(price / 1000000).toFixed(0)}tr`;
  return price.toLocaleString('vi-VN');
}

const THUMBNAIL_GRADIENTS = [
  'from-blue-400 to-blue-600',
  'from-emerald-400 to-emerald-600',
  'from-purple-400 to-purple-600',
  'from-amber-400 to-amber-600',
];

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
          <span className="rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-900 capitalize">
            {property.purpose === 'buy' ? 'Bán' : 'Cho thuê'}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-1">
          {property.title}
        </h3>
        <p className="mt-1 text-lg font-bold text-blue-600">
          {property.price ? formatPrice(property.price) : 'Liên hệ'}
        </p>
        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
          {property.area > 0 && <span>{property.area} m²</span>}
          {property.bedrooms > 0 && <span>{property.bedrooms} PN</span>}
          {property.bathrooms > 0 && <span>{property.bathrooms} WC</span>}
        </div>
        <p className="mt-1.5 text-xs text-gray-400">
          {property.city}
          {property.district ? `, ${property.district}` : ''}
        </p>
      </div>
    </Link>
  );
}

function getItems(response: PropertyListResponse | Property[]): Property[] {
  if (Array.isArray(response)) return response;
  return response.data ?? response.properties ?? response.items ?? [];
}

async function fetchPropertyList(filters: {
  limit: number;
  sort?: string;
}): Promise<Property[]> {
  try {
    const response = await propertyApi.list(filters, {
      next: { revalidate: 60 },
    });
    return getItems(response);
  } catch {
    return [];
  }
}

async function fetchProperties(): Promise<{
  hotProperties: Property[];
  properties: Property[];
}> {
  const [hotData, propsData] = await Promise.all([
    fetchPropertyList({ sort: 'views', limit: 4 }),
    fetchPropertyList({ limit: 8 }),
  ]);
  return {
    hotProperties: hotData,
    properties: propsData,
  };
}

export default async function HomePage() {
  const { hotProperties, properties } = await fetchProperties();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Tìm kiếm bất động sản
              <span className="block text-yellow-300">thông minh hơn</span>
            </h1>
            <p className="mt-4 text-lg text-blue-100">
              Kết nối người mua, người bán và môi giới trên nền tảng bất động
              sản hàng đầu Việt Nam. Hỗ trợ bởi AI Recommendation.
            </p>

            {/* Search Form */}
            <form action="/properties" method="GET" className="mt-8">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1 rounded-xl bg-white p-1.5 shadow-lg sm:flex sm:items-center">
                  <select
                    name="type"
                    defaultValue=""
                    className="w-full rounded-lg border-0 bg-gray-50 px-4 py-3 text-sm text-gray-900 sm:w-auto sm:rounded-r-none sm:bg-transparent"
                  >
                    <option value="">Tất cả</option>
                    <option value="apartment">Căn hộ</option>
                    <option value="house">Nhà phố</option>
                    <option value="villa">Biệt thự</option>
                    <option value="land">Đất nền</option>
                  </select>
                  <div className="hidden sm:block sm:h-8 sm:w-px sm:bg-gray-300" />
                  <input
                    type="text"
                    name="query"
                    placeholder="Nhập địa điểm, dự án..."
                    className="w-full rounded-lg border-0 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 sm:flex-1"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-yellow-400 px-8 py-3.5 text-sm font-semibold text-gray-900 transition-all hover:bg-yellow-300 shadow-lg"
                >
                  Tìm kiếm
                </button>
              </div>
            </form>

            {/* Quick Filters */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {CITIES.map((city) => (
                <Link
                  key={city}
                  href={`/properties?city=${encodeURIComponent(city)}`}
                  className="rounded-full bg-white/15 px-4 py-1.5 text-sm text-white hover:bg-white/25 transition-colors"
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Property Types */}
      <section className="border-b border-gray-100 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {PROPERTY_TYPES.map((type) => (
              <Link
                key={type.key}
                href={`/properties?type=${type.key}`}
                className="group flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-md"
              >
                <span className="text-3xl">{type.icon}</span>
                <span className="mt-2 text-sm font-medium text-gray-700 group-hover:text-blue-600">
                  {type.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hot Properties */}
      {hotProperties.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Bất động sản nổi bật
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Được nhiều người quan tâm nhất
                </p>
              </div>
              <Link
                href="/properties"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Xem tất cả &rarr;
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {hotProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Properties */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Danh sách bất động sản
              </h2>
              <p className="mt-1 text-sm text-gray-500">Cập nhật mới nhất</p>
            </div>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {properties.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <p className="text-gray-500">Chưa có bất động sản nào.</p>
              </div>
            ) : (
              properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Tại sao chọn Nexus Estate?
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: '🤖',
                title: 'AI Recommendation',
                desc: 'Gợi ý bất động sản phù hợp nhất dựa trên hành vi và sở thích của bạn.',
              },
              {
                icon: '🔍',
                title: 'Tìm kiếm thông minh',
                desc: 'Tìm kiếm nhanh chóng với nhiều bộ lọc và hỗ trợ ngôn ngữ tự nhiên.',
              },
              {
                icon: '🛡️',
                title: 'An toàn & Tin cậy',
                desc: 'Xác thực thông tin người dùng, bảo vệ giao dịch của bạn.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-gray-200 p-6 text-center"
              >
                <span className="text-4xl">{feature.icon}</span>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white">
            Bạn là môi giới bất động sản?
          </h2>
          <p className="mt-2 text-blue-100">
            Đăng tin và tiếp cận hàng ngàn khách hàng tiềm năng.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-block rounded-xl bg-white px-8 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
          >
            Đăng ký ngay
          </Link>
        </div>
      </section>
    </div>
  );
}
