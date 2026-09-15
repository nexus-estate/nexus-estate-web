'use client';
import { useTranslations } from 'next-intl';
import { LoadingState } from '@/components/ui/LoadingState';
export default function AuthLoading() {
  const t = useTranslations('common');
  return <LoadingState label={t('status.loading')} />;
}
