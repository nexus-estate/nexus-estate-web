export function assertDurationDays(value: number): void {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new RangeError('durationDays must be a positive safe integer');
  }
}

export function parseDurationDays(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const days = Number(value);
  return Number.isSafeInteger(days) && days > 0 ? days : null;
}
