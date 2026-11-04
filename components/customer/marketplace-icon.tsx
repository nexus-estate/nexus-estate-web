import type { SVGProps } from 'react';

const paths = {
  crown: 'm2 6 5 4 5-7 5 7 5-4-3 13H5ZM6 22h12',
  flame:
    'M12 2c2 5-3 6-3 10 0 2 1 3 3 3s3-2 3-4c3 2 5 4 5 7a8 8 0 0 1-16 0c0-5 3-7 4-9-1 5 2 5 2 3 0-3 2-5 2-10Z',
  clock: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM12 6v6l5 3',
  home: 'm3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9',
  key: 'M14 3a7 7 0 0 0-6.5 9.6L2 18v4h4v-3h3v-3l2.4-2.5A7 7 0 1 0 14 3ZM16 7h.01',
  building:
    'M4 22V3h12v19M16 10h4v12M2 22h20M8 7h.01M12 7h.01M8 11h.01M12 11h.01M8 15h.01M12 15h.01M8 22v-3h4v3',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  search: 'm21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  chevron: 'm9 5 7 7-7 7',
  area: 'M4 3h16v18H4ZM4 8l5-5M4 15 16 3M9 21 20 10M16 21l4-4',
  bed: 'M3 18v3m18-3v3M2 18V9m20 9V9M2 15h20v3H2ZM5 15V7h14v8M7 11h3v4m4 0v-4h3',
  bath: 'M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5ZM6 12V5a3 3 0 0 1 6 0M5 22l2-2m10 0 2 2',
  tag: 'M3 3h9l9 9-9 9-9-9ZM7 7h.01',
  grid: 'M3 3h7v7H3ZM14 3h7v7h-7ZM3 14h7v7H3ZM14 14h7v7h-7Z',
  images: 'M3 3h18v18H3ZM3 17l6-6 4 4 3-3 5 5M16 7h.01',
  message: 'M3 3h18v14H9l-6 4ZM7 9h.01M12 9h.01M17 9h.01',
  check: 'm5 12 4 4L19 6',
  menu: 'M3 6h18M3 12h18M3 18h18',
  close: 'm6 6 12 12M6 18 18 6',
} as const;

export type MarketplaceIconName = keyof typeof paths;

export function MarketplaceIcon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: MarketplaceIconName }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
