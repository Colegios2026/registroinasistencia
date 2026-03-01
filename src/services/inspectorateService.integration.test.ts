import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase client before importing the service
let mockRecordsData: any = { data: null, error: null };
let mockInsertData: any = { data: null, error: null };

const makeInspectorateChain = () => {
  const chain: any = {};
  chain.select = () => chain;
  chain.order = () => chain;
  chain.eq = () => chain;
  chain.gte = () => chain;
  chain.lte = () => chain;
  chain.then = (resolve: any) => resolve(mockRecordsData);

  // INSERT chain
  const insertChain: any = {};
  insertChain.select = () => ({ single: () => ({ then: (resolve: any) => resolve(mockInsertData) }) });
  chain.insert = (_: any) => insertChain;

  return chain;
};

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: (_table: string) => makeInspectorateChain()
  }
}));

import { inspectorateService } from './inspectorateService';

describe('services/inspectorateService (integration - mocked supabase)', () => {
  beforeEach(() => {
    mockRecordsData = { data: null, error: null };
    mockInsertData = { data: null, error: null };
    vi.resetAllMocks();
  });

  describe('getInspectorateRecords', () => {
    it('returns empty array when no records', async () => {
      mockRecordsData = { data: [], error: null };
      
      const result = await inspectorateService.getInspectorateRecords();
      expect(result).toEqual([]);
    });

    it('returns records with student and course details', async () => {
      mockRecordsData = {
        data: [
          {
            id: 'rec-1',
            student_id: 'stu-1',
            date_time: '2024-01-20T10:00:00Z',
            observation: 'Entrevista con padres',
            students: {
              id: 'stu-1',
              full_name: 'Juan Pérez',
              course_id: 'course-1',
              courses: { id: 'course-1', name: '8°A', level: 'BASICA' }
            }
          }
        ],
        error: null
      };

      const result = await inspectorateService.getInspectorateRecords();
      
      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe('rec-1');
      expect(result[0]!.student.full_name).toBe('Juan Pérez');
      expect(result[0]!.student.course.name).toBe('8°A');
    });

    it('filters records by level', async () => {
      mockRecordsData = { data: [], error: null };

      const result = await inspectorateService.getInspectorateRecords('MEDIA');
      
      expect(result).toEqual([]);
    });

    it('filters records by startDate', async () => {
      mockRecordsData = { data: [], error: null };

      const result = await inspectorateService.getInspectorateRecords(undefined, '2024-01-01');
      
      expect(result).toEqual([]);
    });

    it('filters records by endDate', async () => {
      mockRecordsData = { data: [], error: null };

      const result = await inspectorateService.getInspectorateRecords(undefined, undefined, '2024-01-31');
      
      expect(result).toEqual([]);
    });

    it('filters records by date range', async () => {
      mockRecordsData = { data: [], error: null };

      const result = await inspectorateService.getInspectorateRecords(undefined, '2024-01-01', '2024-01-31');
      
      expect(result).toEqual([]);
    });

    it('orders records by date_time descending', async () => {
      mockRecordsData = {
        data: [
          {
            id: 'rec-2',
            student_id: 'stu-2',
            date_time: '2024-02-01T10:00:00Z',
            observation: 'Segunda entrevista',
            students: {
              id: 'stu-2',
              full_name: 'María González',
              course_id: 'course-1',
              courses: { id: 'course-1', name: '8°A', level: 'BASICA' }
            }
          }
        ],
        error: null
      };

      const result = await inspectorateService.getInspectorateRecords();
      
      expect(result[0]!.date_time).toBe('2024-02-01T10:00:00Z');
    });

    it('handles database error and returns empty array', async () => {
      mockRecordsData = { data: null, error: { message: 'Database error' } };

      const result = await inspectorateService.getInspectorateRecords();
      
      expect(result).toEqual([]);
    });

    it('maps nested students correctly to student property', async () => {
      mockRecordsData = {
        data: [
          {
            id: 'rec-1',
            student_id: 'stu-1',
            date_time: '2024-01-20T10:00:00Z',
            observation: 'Test',
            students: {
              id: 'stu-1',
              full_name: 'Test Student',
              course_id: 'course-1',
              courses: { id: 'course-1', name: 'Test Course', level: 'BASICA' }
            }
          }
        ],
        error: null
      };

      const result = await inspectorateService.getInspectorateRecords();
      
      expect(result[0]!.student).toBeDefined();
      expect(result[0]!.student.course).toBeDefined();
    });
  });

  describe('createInspectorateRecord', () => {
    it('creates record and returns data', async () => {
      const newRecord = {
        student_id: 'stu-1',
        date_time: '2024-02-01T10:00:00Z',
        observation: 'Nueva observación'
      };
      
      mockInsertData = { 
        data: { id: 'new-rec-1', ...newRecord }, 
        error: null 
      };

      const result = await inspectorateService.createInspectorateRecord(newRecord as any);
      
      expect(result).toBeDefined();
      expect(result!.id).toBe('new-rec-1');
      expect(result!.observation).toBe('Nueva observación');
    });

    it('handles insert error', async () => {
      mockInsertData = { data: null, error: { message: 'Foreign key violation' } };

      const result = await inspectorateService.createInspectorateRecord({
        student_id: 'stu-1',
        date_time: '2024-02-01T10:00:00Z',
        observation: 'Test'
      });
      
      expect(result).toBeUndefined();
    });

    it('returns undefined when no data returned', async () => {
      mockInsertData = { data: null, error: null };

      const result = await inspectorateService.createInspectorateRecord({
        student_id: 'stu-1',
        date_time: '2024-02-01T10:00:00Z',
        observation: 'Test'
      });
      
      expect(result).toBeUndefined();
    });
  });
});
