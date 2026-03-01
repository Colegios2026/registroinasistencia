import { supabase } from './supabaseClient';
import { Course } from '../types';
import { handleError } from '../utils/error-handler';
import { Database } from '../types/db';

export const courseService = {
  getCourses: async (level?: 'BASICA' | 'MEDIA'): Promise<Database['public']['Tables']['courses']['Row'][]> => {
    try {
      console.log('courseService: getCourses called with level', level);
      
      let query = supabase
        .from('courses')
        .select('id, name, level')
        .order('position');

      if (level) query = query.eq('level', level);
      
      const { data, error } = await query;
      if (error) {
        console.error('courseService: query error', error);
        throw error;
      }
      
      console.log('courseService: query success, data count', data?.length);
      return (data || []) as Database['public']['Tables']['courses']['Row'][];
    } catch (error) {
      handleError(error);
      return [];
    }
  },

  bulkInsertCourses: async (courses: { name: string; level: 'BASICA' | 'MEDIA' }[]) => {
    try {
      const { data, error } = await supabase.from('courses').insert(courses as Database['public']['Tables']['courses']['Insert'][]).select();
      if (error) throw error;
      // Note: React Query will handle invalidation, no manual cache invalidation needed
      return data;
    } catch (error) {
      handleError(error);
    }
  }
};
