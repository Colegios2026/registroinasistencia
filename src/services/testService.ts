import { supabase } from './supabaseClient';
import { Test, Course } from '../types';
import { Database } from '../types/db';
import { handleError } from '../utils/error-handler';

export const testService = {
  getTests: async (courseId?: string, month?: number, year?: number, level?: 'BASICA' | 'MEDIA') : Promise<(Test & { courses: Course | null })[]> => {
    try {
      console.log('testService: getTests called with', { courseId, month, year, level });
      
      // First, get the tests
      let query = supabase
        .from('tests')
        .select('*, courses!inner(*)')
        .order('date');

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
      if (error) {
        console.error('testService: query error', error);
        // Fallback: try without the join if it failed
        console.log('testService: attempting fallback query without join');
        let fallbackQuery = supabase.from('tests').select('*').order('date');
        if (courseId) {
          const parsed = /^\d+$/.test(String(courseId)) ? Number(courseId) : courseId;
          fallbackQuery = fallbackQuery.eq('course_id', String(parsed));
        }
        const { data: fallbackData, error: fallbackError } = await fallbackQuery;
        if (fallbackError) throw fallbackError;
        
        // If fallback worked, we'll need to fetch courses separately or just return tests
        return (fallbackData || []).map(t => ({ ...(t as Database['public']['Tables']['tests']['Row']), courses: null })) as (Test & { courses: Course | null })[];
      }

      console.log('testService: query success, data count', data?.length);

      return (data || []).map(item => ({
        ...item,
        courses: Array.isArray(item.courses) ? item.courses[0] : item.courses
      })) as (Test & { courses: Course | null })[];
    } catch (error) {
      handleError(error);
      return [] as (Test & { courses: Course })[];
    }
  },

  createTest: async (test: Database['public']['Tables']['tests']['Insert']) => {
    try {
      const { data, error } = await supabase.from('tests').insert(test).select().single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
    }
  }
};
