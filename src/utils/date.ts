export const toDateOnlyString = (dateLike: string | Date | undefined | null): string => {
  if (!dateLike) return '';
  if (dateLike instanceof Date) return dateLike.toISOString().slice(0, 10);
  const s = (dateLike ?? '').toString();
  if (s.indexOf('T') !== -1) return s.split('T')[0] ?? '';
  return s.slice(0, 10);
};

export const parseDateOnly = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

export const isValidDate = (dateStr: string | Date | undefined | null): boolean => {
  if (!dateStr) return false;
  const d = dateStr instanceof Date ? dateStr : new Date(dateStr);
  return !isNaN(d.getTime());
};

export const isSameDateOnly = (a: string | Date | undefined | null, b: string | Date | undefined | null) => {
  return toDateOnlyString(a) === toDateOnlyString(b);
};

export const formatDateOnlyLocale = (dateLike: string | Date | undefined | null, locale = 'es-CL') => {
  const d = parseDateOnly(toDateOnlyString(dateLike));
  if (!d) return '';
  return d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/**
 * Calculate days until a test date from today.
 * Negative numbers indicate days in the past.
 * @param testDate ISO string or Date object
 * @returns Number of days until test (0 = today, -1 = yesterday, 5 = in 5 days)
 */
export const getDaysUntilTest = (testDate: string | Date): number => {
  if (!isValidDate(testDate)) return -Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const test = new Date(testDate);
  test.setHours(0, 0, 0, 0);
  const diff = test.getTime() - today.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};
