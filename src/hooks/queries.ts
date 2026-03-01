import React from 'react';
import { useQuery, QueryKey, UseQueryOptions, UseQueryResult, useMutation, useQueryClient } from '@tanstack/react-query';
import { inspectorateService, absenceService, courseService, studentService, testService, adminService } from '../services';
import { normalizeInspectorateRows } from '../lib/transformations';
import { supabase } from '../services/supabaseClient';
import { QUERY_KEYS_INVALIDATE } from '../constants';
import { 
  AbsenceWithDetails, 
  Test, 
  Absence, 
  Student, 
  Course,
  InspectorateRecord
} from '../types';
import { Database, Tables, TablesInsert, TablesUpdate, Enums } from '../types/db';
import { normalizeHoliday, filterHolidaysByPeriod, normalizeAbsenceWithDetails, findAffectedTests, groupTestsByCourse, Holiday as NormalizedHoliday } from '../lib/transformations';

type CourseRow = Tables<'courses'>;
type TestRow = Tables<'tests'>;
type StudentRow = Tables<'students'>;
type TestInsertRow = TablesInsert<'tests'>;
type AbsenceUpdateRow = TablesUpdate<'absences'>;
type AbsenceStatus = Enums<'absence_status'>;

export type Holiday = NormalizedHoliday;
export type TeacherPublicAbsence = {
  absence_id: string;
  student_name: string;
  course_id: string;
  course_name: string;
  course_level: string | null;
  start_date: string;
  end_date: string;
  status: AbsenceStatus;
  observation: string | null;
  affected_tests_count: number;
};

export type TeacherPublicAbsenceDetail = {
  id: string;
  date: string;
  subject: string;
  type: string;
};

function useQ<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(
  queryKey: TQueryKey,
  queryFn: () => Promise<TQueryFnData>,
  options?: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): UseQueryResult<TData, TError> {
  // React Query handles queryKey comparison internally with shallow comparison.
  // Pass options directly without manual memoization of queryKey stringify.
  return useQuery({
    ...(options as unknown as Record<string, unknown>),
    queryKey,
    queryFn
  } as unknown as UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>);
}

const queryKeys = {
  courses: (level?: string) => ['courses', level ?? 'all'] as const,
  tests: (courseId?: string, month?: number, year?: number, level?: string) => ['tests', courseId ?? 'all', month ?? -1, year ?? -1, level ?? 'all'] as const,
  holidays: (month?: number, year?: number) => ['holidays', month ?? -1, year ?? -1] as const,
  teacherPublicAbsences: (month: number, year: number, level?: string, courseId?: string) => ['teacherPublicAbsences', month, year, level ?? 'all', courseId ?? 'all'] as const,
  teacherPublicAbsenceDetail: (absenceId?: string) => ['teacherPublicAbsenceDetail', absenceId ?? 'none'] as const,
  absences: (level?: string, start?: string, end?: string) => ['absences', level ?? 'all', start ?? 'none', end ?? 'none'] as const,
  students: (courseId?: string, level?: string) => ['students', courseId ?? 'all', level ?? 'all'] as const,
  inspectorate: (level?: string, start?: string, end?: string) => ['inspectorate', level ?? 'all', start ?? 'none', end ?? 'none'] as const
};

export const useCourses = (level?: 'BASICA' | 'MEDIA') => {
  return useQ<CourseRow[]>(
    queryKeys.courses(level),
    async () => {
      let query = supabase.from('courses').select('*').order('position');
      if (level) query = query.eq('level', level);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as CourseRow[];
    }
  );
};

export const useTests = (courseId?: string, month?: number, year?: number, level?: 'BASICA' | 'MEDIA') => {
  return useQ<TestRow[]>(
    queryKeys.tests(courseId, month, year, level),
    async () => {
      let query = supabase.from('tests').select('*, courses!inner(*)').order('date');
      if (courseId) {
        const parsed = /^\d+$/.test(String(courseId)) ? Number(courseId) : courseId;
        query = query.eq('course_id', String(parsed));
      }
      if (level) query = query.eq('courses.level', level);
      if (month !== undefined && year !== undefined) {
        const monthStr = String(month + 1).padStart(2, '0');
        const startDate = `${year}-${monthStr}-01`;
        const lastDay = new Date(year, month + 1, 0).getDate();
        const endDate = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`;
        query = query.gte('date', startDate).lte('date', endDate);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as TestRow[];
    }
  );
};

export const useHolidays = (month?: number, year?: number) => {
  return useQ<Holiday[]>(
    queryKeys.holidays(month, year),
    async () => {
      const { data, error } = await supabase.from('feriados_chile').select('*');
      if (error) throw error;
      
      const normalized = (data || [])
        .map(normalizeHoliday)
        .filter((h): h is Holiday => h !== null);

      return filterHolidaysByPeriod(normalized, month, year);
    }
  );
};

export const useTeacherPublicAbsences = (month: number, year: number, level?: 'BASICA' | 'MEDIA', courseId?: string) => {
  return useQ<TeacherPublicAbsence[]>(
    queryKeys.teacherPublicAbsences(month, year, level, courseId),
    async () => {
      const params: { p_month: number; p_year: number; p_level?: string; p_course_id?: string } = {
        p_month: month + 1,
        p_year: year
      };
      if (level) params.p_level = level;
      if (courseId) params.p_course_id = courseId;
      const { data, error } = await supabase.rpc('teacher_get_public_absences', {
        ...params
      });
      if (error) throw error;
      return (data || []) as TeacherPublicAbsence[];
    },
    {
      // Keep previous results on month/year/course changes to avoid UI blanking.
      placeholderData: (previousData) => previousData,
      staleTime: 60_000,
      refetchOnWindowFocus: false
    }
  );
};

export const useTeacherPublicAbsenceDetail = (absenceId?: string) => {
  return useQ<TeacherPublicAbsenceDetail[]>(
    queryKeys.teacherPublicAbsenceDetail(absenceId),
    async () => {
      if (!absenceId) return [];
      const { data, error } = await supabase.rpc('teacher_get_public_absence_detail', {
        p_absence_id: absenceId
      });
      if (error) throw error;
      return (data || []) as TeacherPublicAbsenceDetail[];
    },
    {
      enabled: Boolean(absenceId),
      staleTime: 60_000,
      refetchOnWindowFocus: false
    }
  );
};

// Holiday is exported above

type AbsenceWithStudent = Absence & {
  students: Database['public']['Tables']['students']['Row'] & { courses: Database['public']['Tables']['courses']['Row'] }
};

export const useAbsences = (level?: 'BASICA' | 'MEDIA', startDate?: string, endDate?: string) => {
  return useQ<AbsenceWithDetails[]>(
    queryKeys.absences(level, startDate, endDate),
    async () => {
      let query = supabase.from('absences')
        .select(`
          id, student_id, start_date, end_date, observation, document_url, status,
          students!inner (
            id, full_name, course_id, rut,
            courses!inner (id, name, level)
          )
        `)
        .order('start_date', { ascending: false });
      if (level) query = query.eq('students.courses.level', level);
      if (startDate && endDate) {
        // Overlap logic: include absences that intersect the selected period.
        query = query.lte('start_date', endDate).gte('end_date', startDate);
      } else if (startDate) {
        query = query.gte('start_date', startDate);
      } else if (endDate) {
        query = query.lte('end_date', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      const rows = (data || []) as unknown as AbsenceWithStudent[];
      const result = level
        ? rows.filter((r) => r.students?.courses?.level === level)
        : rows;
      if (result.length === 0) return [];

      const { data: allTests, error: tErr } = await supabase
        .from('tests')
        .select('id, course_id, date, subject, type');

      if (tErr) throw tErr;

      const tests = (allTests || []) as Test[];
      const testsByCourse = groupTestsByCourse(tests);

      return result.map((absence) => {
        const courseTests = testsByCourse[absence.students.course_id ?? ''] || [];
        const affected = findAffectedTests(courseTests, absence.start_date, absence.end_date);
        return normalizeAbsenceWithDetails(absence, affected);
      });
    }
  );
};

export const useStudents = (courseId?: string, level?: 'BASICA' | 'MEDIA') => {
  const result = useQ<StudentRow[]>(
    queryKeys.students(courseId, level),
    async () => {
      let query = supabase.from('students').select('id, full_name, course_id, rut, courses!inner(id, name, level)').order('full_name');
      if (courseId) {
        const parsed = /^\d+$/.test(String(courseId)) ? Number(courseId) : courseId;
        query = query.eq('course_id', String(parsed));
      }
      if (level) query = query.eq('courses.level', level);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as StudentRow[];
    }
  );

  // Efficiently memoize the returned data array by comparing a compact
  // key built from the items' ids. If the set/order of ids hasn't
  // changed we return the previous array reference to keep identity
  // stable and avoid unnecessary renders or state updates.
  const lastRef = React.useRef<{
    key: string;
    data: StudentRow[];
  } | null>(null);

  const memoData = React.useMemo(() => {
    const data = result.data ?? [];
    const key = data.length === 0 ? '' : data.map(d => d.id).join('|');
    if (lastRef.current && lastRef.current.key === key) return lastRef.current.data;
    lastRef.current = { key, data };
    return data;
  }, [result.data]);

  return { ...result, data: memoData } as UseQueryResult<StudentRow[]>;
};

type InspectorateWithStudent = InspectorateRecord & {
  students: Database['public']['Tables']['students']['Row'] & { courses: Database['public']['Tables']['courses']['Row'] }
};

export const useInspectorate = (level?: 'BASICA' | 'MEDIA', startDate?: string, endDate?: string) => {
  return useQ<InspectorateWithStudent[]>(
    queryKeys.inspectorate(level, startDate, endDate),
    async () => {
      let query = supabase.from('inspectorate_records').select('id, student_id, date_time, observation, students!inner(id, full_name, course_id, courses!inner(id, name, level))').order('date_time', { ascending: false });
      if (startDate) query = query.gte('date_time', startDate);
      if (endDate) query = query.lte('date_time', endDate);
      const { data, error } = await query;
      if (error) throw error;
      const rows = (data || []) as unknown as Array<Record<string, unknown>>;
      // normalize shape to always have `student` property
      const normalized = normalizeInspectorateRows(rows) as InspectorateWithStudent[];
      if (!level) return normalized;
      return normalized.filter((r) => r.student.course?.level === level);
    }
  );
};

export const useStudentDetails = (studentId?: string) => {
  return useQ<{
    absences: Database['public']['Tables']['absences']['Row'][];
    records: Database['public']['Tables']['inspectorate_records']['Row'][];
  }>(
    ['studentDetails', studentId ?? 'none'],
    async () => {
      if (!studentId) return { absences: [], records: [] };
      const [absRes, recRes] = await Promise.all([
        supabase.from('absences').select('*').eq('student_id', studentId).order('start_date', { ascending: false }),
        supabase.from('inspectorate_records').select('*').eq('student_id', studentId).order('date_time', { ascending: false })
      ]);

      const absData = absRes.data ?? [];
      const recData = recRes.data ?? [];

      if (absRes.error) throw absRes.error;
      if (recRes.error) throw recRes.error;

      return { absences: absData as Database['public']['Tables']['absences']['Row'][], records: recData as Database['public']['Tables']['inspectorate_records']['Row'][] };
    }
  );
};

// Mutations
export const useCreateInspectorateRecord = () => {
  const qc = useQueryClient();
  return useMutation<
    Awaited<ReturnType<typeof inspectorateService.createInspectorateRecord>>,
    Error,
    Parameters<typeof inspectorateService.createInspectorateRecord>[0]
  >({
    mutationFn: (payload) => inspectorateService.createInspectorateRecord(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS_INVALIDATE.INSPECTORATE });
    }
  });
};

export const useCreateAbsence = () => {
  const qc = useQueryClient();
  return useMutation<
    Awaited<ReturnType<typeof absenceService.createAbsence>>,
    Error,
    { absence: Parameters<typeof absenceService.createAbsence>[0]; file?: File }
  >({
    mutationFn: (args) => absenceService.createAbsence(args.absence, args.file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS_INVALIDATE.ABSENCES });
    }
  });
};

export const useUpdateAbsence = () => {
  const qc = useQueryClient();
  return useMutation<
    Awaited<ReturnType<typeof absenceService.updateAbsence>>,
    Error,
    { id: string; updates: Partial<AbsenceUpdateRow>; file?: File }
  >({
    mutationFn: (args) => absenceService.updateAbsence(args.id, args.updates, args.file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS_INVALIDATE.ABSENCES });
    }
  });
};

// Course / Student / Test mutations
export const useBulkInsertCourses = () => {
  const qc = useQueryClient();
  return useMutation<
    Awaited<ReturnType<typeof courseService.bulkInsertCourses>>,
    Error,
    Parameters<typeof courseService.bulkInsertCourses>[0]
  >({
    mutationFn: (courses) => courseService.bulkInsertCourses(courses),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] });
    }
  });
};

export const useBulkInsertStudents = () => {
  const qc = useQueryClient();
  return useMutation<
    Awaited<ReturnType<typeof studentService.bulkInsertStudents>>,
    Error,
    Parameters<typeof studentService.bulkInsertStudents>[0]
  >({
    mutationFn: (students) => studentService.bulkInsertStudents(students),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
    }
  });
};

export const useCreateTest = () => {
  const qc = useQueryClient();
  return useMutation<
    Awaited<ReturnType<typeof testService.createTest>>,
    Error,
    TestInsertRow
  >({
    mutationFn: (test) => testService.createTest(test),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tests() });
    }
  });
};

export const useSeedData = () => {
  const qc = useQueryClient();
  return useMutation<
    Awaited<ReturnType<typeof adminService.seedData>>,
    Error,
    void
  >({
    mutationFn: () => adminService.seedData(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] });
      qc.invalidateQueries({ queryKey: ['students'] });
      qc.invalidateQueries({ queryKey: queryKeys.tests() });
    }
  });
};
