import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { LOCALE_KEY, normalizeLocale } from '@/lib/constants';
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

const messages = {
  en: {
    common: commonEn,
    auth: authEn,
    customer: customerEn,
    provider: providerEn,
    administration: administrationEn,
  },
  vi: {
    common: commonVi,
    auth: authVi,
    customer: customerVi,
    provider: providerVi,
    administration: administrationVi,
  },
};

export default getRequestConfig(async () => {
  const value = (await cookies()).get(LOCALE_KEY)?.value;
  const locale = normalizeLocale(value);
  return { locale, messages: messages[locale] };
});
