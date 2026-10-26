'use client';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

export function CollectionToolbar({
  query,
  onQuery,
  status,
  onStatus,
  statuses,
  onRefresh,
  refreshing,
}: {
  query: string;
  onQuery: (value: string) => void;
  status: string;
  onStatus: (value: string) => void;
  statuses: { value: string; label: string }[];
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const t = useTranslations('provider.controls');
  return (
    <div className="app-panel mb-5 flex flex-wrap items-center gap-3 p-4">
      <label className="min-w-48 flex-1">
        <span className="sr-only">{t('search')}</span>
        <input
          type="search"
          className="app-control px-3"
          placeholder={t('search')}
          value={query}
          onChange={(event) => onQuery(event.target.value)}
        />
      </label>
      <label>
        <span className="sr-only">{t('status')}</span>
        <select
          className="app-control min-w-40 px-3"
          value={status}
          onChange={(event) => onStatus(event.target.value)}
        >
          <option value="">{t('allStatuses')}</option>
          {statuses.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <Button
        type="button"
        variant="outline"
        loading={refreshing}
        onClick={onRefresh}
      >
        {t('refresh')}
      </Button>
    </div>
  );
}
