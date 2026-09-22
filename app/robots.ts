import type { MetadataRoute } from 'next';
import { tryGetWebPlatform } from '@/lib/platform/config';
import { getSiteUrl } from '@/lib/seo';

const PRIVATE_PATHS = [
  '/admin',
  '/provider',
  '/dashboard',
  '/profile',
  '/signin',
  '/signup',
];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  const platform = tryGetWebPlatform();

  if (platform && platform !== 'marketplace') {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: siteUrl ? `${siteUrl}/sitemap.xml` : undefined,
  };
}
