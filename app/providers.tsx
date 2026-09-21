'use client';
import { NextIntlClientProvider } from 'next-intl';
import { ProviderContextProvider } from '@/features/provider/context/provider-context.provider';
import { APP_TIME_ZONE, type Locale } from '@/lib/constants';
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
    common: commonVi,
    auth: authVi,
    customer: customerVi,
    provider: providerVi,
    administration: administrationVi,
  },
  en: {
    common: commonEn,
    auth: authEn,
    customer: customerEn,
    provider: providerEn,
    administration: administrationEn,
  },
};
export function AppProviders({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={localeMessages[locale]}
      timeZone={APP_TIME_ZONE}
    >
      <ProviderContextProvider>{children}</ProviderContextProvider>
    </NextIntlClientProvider>
  );
}
