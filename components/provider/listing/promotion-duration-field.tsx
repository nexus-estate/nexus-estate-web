'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function PromotionDurationField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  error: boolean;
}) {
  const t = useTranslations('provider');
  return (
    <div className="space-y-3">
      <Input
        name="durationDays"
        type="number"
        inputMode="numeric"
        min={1}
        step={1}
        max={Number.MAX_SAFE_INTEGER}
        required
        label={t('listings.fields.durationDays')}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        error={error ? t('listings.invalidDuration') : undefined}
      />
      <div className="flex flex-wrap gap-2">
        {[3, 7, 14, 30].map((days) => (
          <Button
            key={days}
            type="button"
            size="sm"
            variant={value === String(days) ? 'primary' : 'outline'}
            aria-pressed={value === String(days)}
            onClick={() => onChange(String(days))}
          >
            {t('listings.durationOption', { days })}
          </Button>
        ))}
      </div>
      <p className="text-sm text-[var(--text-muted)]">
        {t('listings.startsImmediately')}
      </p>
    </div>
  );
}
