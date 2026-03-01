/**
 * Centralized UI filter options to avoid duplication across pages.
 * These are consumed by Dashboard, Inasistencias, Inspectoria, and DocentePublico.
 */

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
].map((m, i) => ({ value: i, label: m }));

export const getYearOptions = (yearsSpan: number = 5, offset: number = -2) => {
  return Array.from(
    { length: yearsSpan },
    (_, i) => new Date().getFullYear() + offset + i
  ).map(y => ({ value: y, label: y.toString() }));
};

export const getCourseOptions = (courses: Array<{ id: string; name: string }>) => {
  return [
    { value: '', label: 'Todos los Cursos' },
    ...courses.map(c => ({ value: c.id, label: c.name }))
  ];
};

export const getStatusOptions = () => {
  return [
    { value: '', label: 'Todos los Estados' },
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'JUSTIFICADA', label: 'Justificada' }
  ];
};
