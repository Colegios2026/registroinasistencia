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

export const isSameDateOnly = (a: string | Date | undefined | null, b: string | Date | undefined | null) => {
  return toDateOnlyString(a) === toDateOnlyString(b);
};

export const formatDateOnlyLocale = (dateLike: string | Date | undefined | null, locale = 'es-CL') => {
  const d = parseDateOnly(toDateOnlyString(dateLike));
  if (!d) return '';
  return d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
};
