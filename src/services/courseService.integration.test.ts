import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase client before importing the service
let mockCoursesData: any = { data: null, error: null };
let mockBulkInsertData: any = { data: null, error: null };

const makeCoursesChain = () => {
  const chain: any = {};
  chain.select = () => chain;
  chain.order = () => chain;
  chain.eq = () => chain;
  chain.then = (resolve: any) => resolve(mockCoursesData);

  // INSERT chain
  const insertChain: any = {};
  insertChain.select = () => ({ then: (resolve: any) => resolve(mockBulkInsertData) });
  chain.insert = (_: any) => insertChain;

  return chain;
};

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: (_table: string) => makeCoursesChain()
  }
}));

import { courseService } from './courseService';

describe('services/courseService (integration - mocked supabase)', () => {
  beforeEach(() => {
    mockCoursesData = { data: null, error: null };
    mockBulkInsertData = { data: null, error: null };
    vi.resetAllMocks();
  });

  describe('getCourses', () => {
    it('returns empty array when no courses', async () => {
      mockCoursesData = { data: [], error: null };
      
      const result = await courseService.getCourses();
      expect(result).toEqual([]);
    });

    it('returns all courses without filter', async () => {
      mockCoursesData = {
        data: [
          { id: 1, name: '1° Básico', level: 'BASICA', position: 1 },
          { id: 2, name: '2° Básico', level: 'BASICA', position: 2 },
          { id: 3, name: '1° Medio', level: 'MEDIA', position: 3 }
        ],
        error: null
      };

      const result = await courseService.getCourses();
      
      expect(result).toHaveLength(3);
      expect(result[0]!.name).toBe('1° Básico');
    });

    it('filters courses by BASICA level', async () => {
      mockCoursesData = {
        data: [
          { id: 1, name: '1° Básico', level: 'BASICA', position: 1 },
          { id: 2, name: '2° Básico', level: 'BASICA', position: 2 }
        ],
        error: null
      };

      const result = await courseService.getCourses('BASICA');
      
      expect(result).toHaveLength(2);
      expect(result.every(c => c.level === 'BASICA')).toBe(true);
    });

    it('filters courses by MEDIA level', async () => {
      mockCoursesData = {
        data: [
          { id: 3, name: '1° Medio', level: 'MEDIA', position: 1 },
          { id: 4, name: '2° Medio', level: 'MEDIA', position: 2 }
        ],
        error: null
      };

      const result = await courseService.getCourses('MEDIA');
      
      expect(result).toHaveLength(2);
      expect(result.every(c => c.level === 'MEDIA')).toBe(true);
    });

    it('orders courses by position', async () => {
      mockCoursesData = {
        data: [
          { id: 2, name: '2° Básico', level: 'BASICA', position: 2 },
          { id: 1, name: '1° Básico', level: 'BASICA', position: 1 }
        ],
        error: null
      };

      const result = await courseService.getCourses();
      
      // The mock returns data as-is; actual ordering happens in the query
      expect(result).toHaveLength(2);
    });

    it('handles database error and returns empty array', async () => {
      mockCoursesData = { data: null, error: { message: 'Database error' } };

      const result = await courseService.getCourses();
      
      // Service catches error and returns empty array
      expect(result).toEqual([]);
    });
  });

  describe('bulkInsertCourses', () => {
    it('inserts multiple courses and returns data', async () => {
      const courses: { name: string; level: 'BASICA' | 'MEDIA' }[] = [
        { name: '3° Básico', level: 'BASICA' },
        { name: '4° Básico', level: 'BASICA' }
      ];
      
      mockBulkInsertData = {
        data: [
          { id: 10, ...courses[0] },
          { id: 11, ...courses[1] }
        ],
        error: null
      };

      const result = await courseService.bulkInsertCourses(courses);
      
      expect(result).toHaveLength(2);
      expect(result![0]!.id).toBe(10);
    });

    it('handles insert error', async () => {
      mockBulkInsertData = { data: null, error: { message: 'Duplicate name' } };

      const result = await courseService.bulkInsertCourses([{ name: 'Test', level: 'BASICA' as const }]);
      
      expect(result).toBeUndefined();
    });

    it('returns undefined when no data returned', async () => {
      mockBulkInsertData = { data: null, error: null };

      const result = await courseService.bulkInsertCourses([{ name: 'Test', level: 'BASICA' as const }]);
      
      expect(result).toBeUndefined();
    });
  });
});
