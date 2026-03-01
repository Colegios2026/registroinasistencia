import { 
  Database, 
  Absence, 
  AbsenceWithDetails, 
  Student, 
  Course,
  Test 
} from '../types';

export interface Holiday {
  id: string;
  date: string;
  name: string;
  es_irrenunciable: boolean;
}

/**
 * Normalizes holiday data from Supabase format to application format
 */
export function normalizeHoliday(
  row: Database['public']['Tables']['feriados_chile']['Row']
): Holiday | null {
  const rawDate = row.fecha;
  let dateStr = '';
  
  try {
    if (rawDate) {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        dateStr = d.toISOString().slice(0, 10);
      } else if (typeof rawDate === 'string') {
        dateStr = rawDate.slice(0, 10);
      }
    }
  } catch {
    dateStr = '';
  }

  if (!dateStr) return null;

  return {
    id: String(row.fecha),
    date: dateStr,
    name: row.descripcion ?? '',
    es_irrenunciable: Boolean(row.es_irrenunciable ?? false)
  };
}

/**
 * Filters holidays by month and year
 */
export function filterHolidaysByPeriod(
  holidays: Holiday[],
  month?: number,
  year?: number
): Holiday[] {
  if (month === undefined || year === undefined) {
    return holidays;
  }

  return holidays.filter((h) => {
    const d = new Date(h.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

/**
 * Maps absence data with nested relationships
 */
export function normalizeAbsenceWithDetails(
  absence: Absence & {
    students: Student & { courses: Course };
  },
  affectedTests: Test[]
): AbsenceWithDetails {
  const { students, ...rest } = absence;
  const { courses, ...studentRest } = students;
  
  return {
    ...rest,
    student: { ...studentRest, course: courses },
    affected_tests: affectedTests
  };
}

/**
 * Finds affected tests for an absence period
 */
export function findAffectedTests(
  courseTests: Test[],
  absenceStartDate: string,
  absenceEndDate: string
): Test[] {
  return courseTests.filter(
    test => test.date >= absenceStartDate && test.date <= absenceEndDate
  );
}

/**
 * Groups tests by course ID for efficient lookup
 */
export function groupTestsByCourse(
  tests: Test[]
): Record<string, Test[]> {
  return tests.reduce((acc, test) => {
    const key = String(test.course_id ?? '');
    if (!acc[key]) acc[key] = [];
    acc[key].push(test);
    return acc;
  }, {} as Record<string, Test[]>);
}
