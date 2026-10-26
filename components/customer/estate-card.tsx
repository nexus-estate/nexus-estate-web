'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { EstateImage } from '@/components/customer/estate-image';
import type { Estate } from '@/lib/api/estate/estate.types';

export function EstateCard({ estate }: { estate: Estate }) {
  const locale = useLocale();
  const t = useTranslations('customer');
  const type = estate.type.toLowerCase();
  const price = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(estate.price);

  return (
    <Link
      href={`/properties/estate/${estate.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#e2e8e3] bg-white transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-[#9bc3b3] hover:shadow-[0_12px_30px_rgb(22_55_45_/_0.09)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#e7eee9]">
        <EstateImage
          estateId={estate.id}
          title={estate.title}
          sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#285346] shadow-sm">
          {estate.purpose === 'RENT'
            ? t('properties.listingRent')
            : t('properties.listingBuy')}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-xs font-medium text-[#66776e]">
          {estate.province.name} · {estate.ward.name}
        </p>
        <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-6 text-[#163d32] group-hover:text-[#17664f]">
          {estate.title}
        </h3>
        <p className="mt-3 text-lg font-bold text-[#16543f]">{price}</p>
        <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 border-t border-[#edf0ec] pt-3 text-xs text-[#65746b]">
          {estate.area !== null && estate.area > 0 && (
            <span>{t('properties.area', { value: estate.area })}</span>
          )}
          {estate.bedrooms !== null && estate.bedrooms > 0 && (
            <span>{t('properties.bedrooms', { value: estate.bedrooms })}</span>
          )}
          <span>{t(`home.propertyTypes.${type}`)}</span>
        </div>
      </div>
    </Link>
  );
}
