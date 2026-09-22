import {
  formatArea,
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
} from './format';

describe('formatting helpers', () => {
  describe('formatCurrency', () => {
    it('formats whole currency units without fraction digits', () => {
      expect(formatCurrency(3500000, 'en-US')).toMatch(/3,500,000/);
      expect(formatCurrency(3500000, 'en-US')).not.toMatch(/\.\d{2}/);
    });

    it('defaults to VND and honours a currency override', () => {
      expect(formatCurrency(1000, 'en-US')).toMatch(/1,000/);
      expect(formatCurrency(1000, 'en-US', { currency: 'USD' })).toMatch(
        /\$|USD/,
      );
    });

    it('falls back for missing or invalid values', () => {
      expect(formatCurrency(null, 'en-US')).toBe('—');
      expect(formatCurrency(undefined, 'en-US')).toBe('—');
      expect(formatCurrency(Number.NaN, 'en-US')).toBe('—');
      expect(formatCurrency(null, 'en-US', { fallback: 'N/A' })).toBe('N/A');
    });
  });

  describe('formatCompactCurrency', () => {
    it('compacts large amounts for dense lists', () => {
      const formatted = formatCompactCurrency(3500000000, 'en-US');
      expect(formatted).toMatch(/3\.5B|3,5B/);
    });
  });

  describe('formatNumber', () => {
    it('formats numbers and applies the fallback', () => {
      expect(formatNumber(1234567, 'en-US')).toBe('1,234,567');
      expect(formatNumber(null, 'en-US')).toBe('—');
      expect(formatNumber(null, 'en-US', '?')).toBe('?');
    });
  });

  describe('formatDate / formatDateTime', () => {
    // Built from local parts so the assertion does not depend on the timezone.
    const localDate = new Date(2026, 0, 5, 12, 30);

    it('formats dates with the requested locale', () => {
      expect(formatDate(localDate, 'en-US')).toBe('Jan 5, 2026');
    });

    it('accepts ISO strings', () => {
      expect(formatDate(localDate.toISOString(), 'en-US')).toMatch(/2026/);
    });

    it('includes the time for formatDateTime', () => {
      expect(formatDateTime(localDate, 'en-US')).toMatch(/2026/);
      expect(formatDateTime(localDate, 'en-US')).toMatch(/12:30|PM/i);
    });

    it('falls back for empty or unparseable input', () => {
      expect(formatDate(null, 'en-US')).toBe('—');
      expect(formatDate('not-a-date', 'en-US')).toBe('—');
      expect(formatDateTime(undefined, 'en-US', 'n/a')).toBe('n/a');
    });
  });

  describe('formatArea', () => {
    it('appends the square metre unit', () => {
      expect(formatArea(120, 'en-US')).toBe('120 m²');
    });

    it('falls back for missing areas', () => {
      expect(formatArea(null, 'en-US')).toBe('—');
    });
  });
});
