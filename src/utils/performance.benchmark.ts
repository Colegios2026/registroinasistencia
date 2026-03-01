import { describe, bench } from 'vitest';
import {
  toDateOnlyString,
  parseDateOnly,
  isValidDate,
  isSameDateOnly,
  formatDateOnlyLocale,
  getDaysUntilTest,
} from './date';
import {
  normalizeHoliday,
  filterHolidaysByPeriod,
  normalizeAbsenceWithDetails,
  findAffectedTests,
  groupTestsByCourse,
  normalizeInspectorateRows,
  Holiday,
} from '../lib/transformations';
import { Absence, Student, Course, Test } from '../types';

describe('Date utilities performance', () => {
  bench('toDateOnlyString with ISO string', () => {
    toDateOnlyString('2024-01-15T10:30:00Z');
  });

  bench('toDateOnlyString with Date object', () => {
    toDateOnlyString(new Date('2024-01-15'));
  });

  bench('toDateOnlyString with null', () => {
    toDateOnlyString(null);
  });

  bench('parseDateOnly with valid date', () => {
    parseDateOnly('2024-01-15');
  });

  bench('parseDateOnly with invalid date', () => {
    parseDateOnly('invalid-date');
  });

  bench('isValidDate with valid string', () => {
    isValidDate('2024-01-15');
  });

  bench('isValidDate with invalid string', () => {
    isValidDate('not-a-date');
  });

  bench('isSameDateOnly with same dates', () => {
    isSameDateOnly('2024-01-15', '2024-01-15');
  });

  bench('isSameDateOnly with different dates', () => {
    isSameDateOnly('2024-01-15', '2024-01-16');
  });

  bench('formatDateOnlyLocale', () => {
    formatDateOnlyLocale('2024-01-15', 'es-CL');
  });

  bench('getDaysUntilTest in future', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    getDaysUntilTest(futureDate.toISOString());
  });

  bench('getDaysUntilTest in past', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 30);
    getDaysUntilTest(pastDate.toISOString());
  });
});

describe('Transformation functions performance', () => {
  const mockHoliday = {
    id: '1',
    fecha: '2024-01-01',
    descripcion: 'Año Nuevo',
    es_irrenunciable: true,
  };

  const holidays: Holiday[] = Array.from({ length: 100 }, (_, i) => ({
    id: String(i),
    date: `2024-${String(Math.floor(i / 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    name: `Feriado ${i}`,
    es_irrenunciable: i % 3 === 0,
  }));

  bench('normalizeHoliday', () => {
    normalizeHoliday(mockHoliday as any);
  });

  bench('filterHolidaysByPeriod', () => {
    filterHolidaysByPeriod(holidays, 0, 2024);
  });

  const mockAbsence = {
    id: 'abs-1',
    student_id: 'stu-1',
    start_date: '2024-01-10',
    end_date: '2024-01-20',
    observation: 'Enfermedad',
    document_url: null,
    status: 'pendiente',
    students: {
      id: 'stu-1',
      full_name: 'Juan Pérez',
      course_id: 'course-1',
      rut: '12345678-9',
      courses: { id: 'course-1', name: '8°A', level: 'BASICA' },
    },
  };

  const mockTests = Array.from({ length: 50 }, (_, i) => ({
    id: `test-${i}`,
    course_id: String(i % 5),
    date: `2024-01-${String((i % 28) + 1).padStart(2, '0')}`,
    subject: 'Matemática',
    type: 'prueba',
    description: null,
    created_at: null,
  })) as unknown as Test[];

  bench('normalizeAbsenceWithDetails', () => {
    normalizeAbsenceWithDetails(mockAbsence as any, mockTests);
  });

  bench('findAffectedTests', () => {
    findAffectedTests(mockTests, '2024-01-10', '2024-01-20');
  });

  bench('groupTestsByCourse', () => {
    groupTestsByCourse(mockTests);
  });

  const mockInspectorateRows = Array.from({ length: 100 }, (_, i) => ({
    id: `rec-${i}`,
    student_id: `stu-${i}`,
    date_time: `2024-01-${String((i % 28) + 1).padStart(2, '0')}T10:00:00Z`,
    observation: `Observación ${i}`,
    students: {
      id: `stu-${i}`,
      full_name: `Estudiante ${i}`,
      course_id: `course-${i % 5}`,
      rut: `${String(10000000 + i)}-${i % 10}`,
      courses: { id: `course-${i % 5}`, name: `Curso ${i % 5}`, level: i % 2 === 0 ? 'BASICA' : 'MEDIA' },
    },
  }));

  bench('normalizeInspectorateRows (100 rows)', () => {
    normalizeInspectorateRows(mockInspectorateRows as any);
  });
});

describe('Array operations performance', () => {
  const largeArray = Array.from({ length: 10000 }, (_, i) => ({
    id: String(i),
    value: i,
    name: `Item ${i}`,
  }));

  bench('Array.filter - find even numbers', () => {
    largeArray.filter((item) => item.value % 2 === 0);
  });

  bench('Array.map - transform objects', () => {
    largeArray.map((item) => ({ ...item, doubled: item.value * 2 }));
  });

  bench('Array.reduce - group by modulo', () => {
    largeArray.reduce((acc, item) => {
      const key = item.value % 10;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<number, typeof largeArray>);
  });

  bench('Array.find - find specific item', () => {
    largeArray.find((item) => item.id === '5000');
  });

  bench('Array.some - check condition', () => {
    largeArray.some((item) => item.value === 9999);
  });

  bench('Array.includes - check membership', () => {
    const item = largeArray[5000];
    if (item) largeArray.includes(item);
  });
});
