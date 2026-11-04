'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { Property } from '@/lib/sdk';
import { SEED_PROPERTIES } from '@/lib/seed-properties';

type Estate = Property & {
  bedrooms?: number;
  bathrooms?: number;
  images?: string[];
};

const fallbackImages = [
  '/images/properties/penthouse-saigon.webp',
  '/images/properties/villa-dalat.webp',
  '/images/properties/residence-danang.webp',
];

function formatPrice(price?: number) {
  if (!price) return 'Liên hệ';
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)} tỷ`;
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)} triệu`;
  return price.toLocaleString('vi-VN');
}

function getProperties(data: unknown): Estate[] {
  if (Array.isArray(data)) return data as Estate[];
  if (!data || typeof data !== 'object') return [];

  const payload = data as {
    data?: unknown;
    items?: unknown;
    properties?: unknown;
  };
  const items = payload.data ?? payload.items ?? payload.properties;
  return Array.isArray(items) ? (items as Estate[]) : [];
}

function getTypeLabel(type: string) {
  const labels: Record<string, string> = {
    apartment: 'Căn hộ hạng sang',
    villa: 'Biệt thự nghỉ dưỡng',
    house: 'Nhà phố trung tâm',
    land: 'Đất nền',
    office: 'Văn phòng',
  };
  return labels[type] ?? 'Bất động sản tuyển chọn';
}

function EstateCard({ estate, index }: { estate: Estate; index: number }) {
  const image =
    estate.images?.[0] || fallbackImages[index % fallbackImages.length];

  return (
    <Link
      href={`/properties/${estate.id}`}
      className="property-card group block"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#d8d3c8]">
        <Image
          src={image}
          alt={estate.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071b1b]/60 via-transparent to-transparent" />
        <span className="absolute left-5 top-5 rounded-full border border-white/40 bg-[#071b1b]/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
          {estate.purpose === 'rent'
            ? 'Cho thuê'
            : estate.id.startsWith('seed-')
              ? 'Dữ liệu mẫu'
              : 'Tuyển chọn'}
        </span>
        <div className="absolute bottom-5 left-5 text-white">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/70">
            Giá chào bán
          </p>
          <p className="mt-1 font-display text-2xl">
            {formatPrice(estate.price)}
          </p>
        </div>
      </div>
      <div className="border-x border-b border-[#ddd8cd] bg-white px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a7b4f]">
          {estate.district ? `${estate.district}, ` : ''}
          {estate.city}
        </p>
        <h3 className="mt-2 font-display text-2xl text-[#102f2d] transition-colors group-hover:text-[#9a7b4f]">
          {estate.title}
        </h3>
        <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#8a918f]">
          {getTypeLabel(estate.type)}
        </p>
        <div className="mt-5 flex items-center gap-5 border-t border-[#ece8df] pt-4 text-xs text-[#596967]">
          <span>{estate.area} m²</span>
          {estate.bedrooms ? <span>{estate.bedrooms} phòng ngủ</span> : null}
          {estate.bathrooms ? <span>{estate.bathrooms} phòng tắm</span> : null}
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedProperties() {
  const { data, isLoading } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<unknown>('/properties');
        const properties = getProperties(response);
        return (properties.length ? properties : SEED_PROPERTIES).slice(0, 3);
      } catch {
        return SEED_PROPERTIES.slice(0, 3);
      }
    },
  });

  if (isLoading) {
    return (
      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="overflow-hidden bg-white">
            <div className="skeleton aspect-[4/3]" />
            <div className="space-y-3 p-5">
              <div className="skeleton h-3 w-1/2" />
              <div className="skeleton h-7 w-4/5" />
              <div className="skeleton h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-3">
      {data.map((estate, index) => (
        <EstateCard key={estate.id} estate={estate} index={index} />
      ))}
    </div>
  );
}
