'use client';
import { NextIntlClientProvider } from 'next-intl';
import { messages } from '@/lib/i18n';
import administrationEn from '@/messages/en/administration.json';
import authEn from '@/messages/en/auth.json';
import commonEn from '@/messages/en/common.json';
import customerEn from '@/messages/en/customer.json';
import providerEn from '@/messages/en/provider.json';
import administrationVi from '@/messages/vi/administration.json';
import authVi from '@/messages/vi/auth.json';
import commonVi from '@/messages/vi/common.json';
import customerVi from '@/messages/vi/customer.json';
import providerVi from '@/messages/vi/provider.json';
export const localeMessages = {
  vi: {
    ...messages.vi,
    common: { ...(messages.vi.common as object), ...commonVi },
    auth: { ...(messages.vi.auth as object), ...authVi },
    customer: customerVi,
    provider: providerVi,
    administration: administrationVi,
  },
  en: {
    ...messages.en,
    common: { ...(messages.en.common as object), ...commonEn },
    auth: { ...(messages.en.auth as object), ...authEn },
    customer: customerEn,
    provider: providerEn,
    administration: administrationEn,
  },
};
export function AppProviders({
  locale,
  children,
}: {
  locale: 'vi' | 'en';
  children: React.ReactNode;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={localeMessages[locale]}>
      {children}
    </NextIntlClientProvider>
  );
}
