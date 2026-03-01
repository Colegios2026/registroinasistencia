import { describe, it, expect } from 'vitest';
import {
  toDateOnlyString,
  parseDateOnly,
  isSameDateOnly,
  formatDateOnlyLocale,
} from './date';

describe('utils/date', () => {
  it('toDateOnlyString handles Date, ISO string and null/undefined', () => {
    const d = new Date('2023-05-17T12:34:56Z');
    expect(toDateOnlyString(d)).toBe('2023-05-17');
    expect(toDateOnlyString('2023-05-17T00:00:00')).toBe('2023-05-17');
    expect(toDateOnlyString('2023-05-17')).toBe('2023-05-17');
    expect(toDateOnlyString(null)).toBe('');
    expect(toDateOnlyString(undefined)).toBe('');
  });

  it('parseDateOnly returns Date for valid and null for invalid/empty', () => {
    const d = parseDateOnly('2021-01-02');
    expect(d).toBeInstanceOf(Date);
    expect(d && d.toISOString().slice(0, 10)).toBe('2021-01-02');
    expect(parseDateOnly('')).toBeNull();
    expect(parseDateOnly('invalid-date')).toBeNull();
  });

  it('isSameDateOnly compares date-only equality', () => {
    expect(isSameDateOnly('2020-02-02', new Date('2020-02-02T05:00:00Z'))).toBe(true);
    expect(isSameDateOnly('2020-02-02', '2020-02-03')).toBe(false);
    expect(isSameDateOnly(null, '')).toBe(true);
  });

  it('formatDateOnlyLocale formats according to locale', () => {
    const formatted = formatDateOnlyLocale('2022-12-05', 'es-ES');
    // Avoid asserting exact day (timezone differences); check month and year present
    expect(formatted).toContain('12');
    expect(formatted).toContain('2022');
    expect(formatDateOnlyLocale('', 'es-ES')).toBe('');
  });

  it('isValidDate correctly identifies valid/invalid dates', () => {
    expect(isValidDate('2021-01-01')).toBe(true);
    expect(isValidDate(new Date())).toBe(true);
    expect(isValidDate('')).toBe(false);
    expect(isValidDate('not-a-date')).toBe(false);
    expect(isValidDate(null)).toBe(false);
    expect(isValidDate(undefined)).toBe(false);
  });
});
