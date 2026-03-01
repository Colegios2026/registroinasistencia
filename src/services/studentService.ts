import { supabase } from './supabaseClient';
import { Student, Absence, InspectorateRecord } from '../types';
import { handleError } from '../utils/error-handler';
import { Database } from '../types/db';

export const studentService = {
  getStudents: async (courseId?: string, level?: 'BASICA' | 'MEDIA') : Promise<Student[]> => {
    try {
      let query = supabase
        .from('students')
        .select('id, full_name, course_id, rut, courses!inner(id, name, level)')
        .order('full_name');

      if (courseId) {
        const parsed = /^\d+$/.test(String(courseId)) ? Number(courseId) : courseId;
        query = query.eq('course_id', String(parsed));
      }
      if (level) query = query.eq('courses.level', level);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Student[];
    } catch (error) {
      handleError(error);
      return [] as Student[];
    }
  },

  getStudentDetails: async (studentId: string) => {
    try {
      const [studentRes, absencesRes, recordsRes] = await Promise.all([
        supabase.from('students').select('id, full_name, course_id, rut, courses(id, name, level)').eq('id', studentId).single(),
        supabase.from('absences').select('id, start_date, end_date, observation, status').eq('student_id', studentId).order('start_date', { ascending: false }),
        supabase.from('inspectorate_records').select('id, date_time, observation').eq('student_id', studentId).order('date_time', { ascending: false })
      ]);

      if (studentRes.error) throw studentRes.error;
      if (absencesRes.error) throw absencesRes.error;
      if (recordsRes.error) throw recordsRes.error;

      return {
        student: studentRes.data,
        absences: absencesRes.data as Absence[],
        records: recordsRes.data as InspectorateRecord[]
      };
    } catch (error) {
      handleError(error);
      return { student: null as unknown as Student, absences: [], records: [] };
    }
  },

  bulkInsertStudents: async (students: { full_name: string; course_id: string; rut?: string }[]) => {
    try {
      const { data, error } = await supabase.from('students').insert(students as Database['public']['Tables']['students']['Insert'][]).select();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
    }
  }
};
