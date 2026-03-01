import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase client before importing the service
let mockStudentsData: any = { data: null, error: null };
let mockStudentDetailsData: any = { data: null, error: null };
let mockAbsencesData: any = { data: null, error: null };
let mockRecordsData: any = { data: null, error: null };
let mockBulkInsertData: any = { data: null, error: null };

const makeStudentsChain = () => {
  const chain: any = {};
  chain.select = () => chain;
  chain.order = () => chain;
  chain.eq = () => chain;
  chain.then = (resolve: any) => resolve(mockStudentsData);

  // INSERT chain
  const insertChain: any = {};
  insertChain.select = () => ({ then: (resolve: any) => resolve(mockBulkInsertData) });
  chain.insert = (_: any) => insertChain;

  return chain;
};

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: (table: string) => {
      return makeStudentsChain();
    }
  }
}));

// Override specific calls for getStudentDetails
vi.mock('../lib/supabaseClient', async () => {
  const actual = await vi.importActual('../lib/supabaseClient');
  return {
    ...actual,
    supabase: {
      from: (table: string) => {
        if (table === 'students') {
          const chain: any = {};
          chain.select = () => chain;
          chain.order = () => chain;
          chain.eq = () => chain;
          chain.single = () => ({ then: (resolve: any) => resolve(mockStudentDetailsData) });
          chain.then = (resolve: any) => resolve(mockStudentsData);
          
          // For bulk insert
          const insertChain: any = {};
          insertChain.select = () => ({ then: (resolve: any) => resolve(mockBulkInsertData) });
          chain.insert = (_: any) => insertChain;
          
          return chain;
        }
        if (table === 'absences') {
          const chain: any = {};
          chain.select = () => chain;
          chain.eq = () => chain;
          chain.order = () => chain;
          chain.then = (resolve: any) => resolve(mockAbsencesData);
          return chain;
        }
        if (table === 'inspectorate_records') {
          const chain: any = {};
          chain.select = () => chain;
          chain.eq = () => chain;
          chain.order = () => chain;
          chain.then = (resolve: any) => resolve(mockRecordsData);
          return chain;
        }
        // Default
        const chain: any = {};
        chain.select = () => chain;
        chain.then = (resolve: any) => resolve(mockStudentsData);
        return chain;
      }
    }
  };
});

import { studentService } from './studentService';

describe('services/studentService (integration - mocked supabase)', () => {
  beforeEach(() => {
    mockStudentsData = { data: null, error: null };
    mockStudentDetailsData = { data: null, error: null };
    mockAbsencesData = { data: null, error: null };
    mockRecordsData = { data: null, error: null };
    mockBulkInsertData = { data: null, error: null };
    vi.resetAllMocks();
  });

  describe('getStudents', () => {
    it('returns empty array when no students', async () => {
      mockStudentsData = { data: [], error: null };
      
      const result = await studentService.getStudents();
      expect(result).toEqual([]);
    });

    it('returns students with course details', async () => {
      mockStudentsData = {
        data: [
          { id: 'stu-1', full_name: 'Juan Pérez', course_id: 'course-1', rut: '12345678-9', courses: { id: 'course-1', name: '8°A', level: 'BASICA' } },
          { id: 'stu-2', full_name: 'María González', course_id: 'course-1', rut: '98765432-1', courses: { id: 'course-1', name: '8°A', level: 'BASICA' } }
        ],
        error: null
      };

      const result = await studentService.getStudents();
      
      expect(result).toHaveLength(2);
      expect(result[0]!.full_name).toBe('Juan Pérez');
      expect(result[1]!.full_name).toBe('María González');
    });

    it('filters students by courseId', async () => {
      mockStudentsData = { data: [], error: null };

      const result = await studentService.getStudents('course-1');
      
      expect(result).toEqual([]);
    });

    it('filters students by level', async () => {
      mockStudentsData = { data: [], error: null };

      const result = await studentService.getStudents(undefined, 'MEDIA');
      
      expect(result).toEqual([]);
    });

    it('handles numeric courseId', async () => {
      mockStudentsData = { data: [], error: null };

      const result = await studentService.getStudents('123');
      
      expect(result).toEqual([]);
    });

    it('orders students by full_name', async () => {
      mockStudentsData = {
        data: [
          { id: 'stu-1', full_name: 'Carlos', course_id: 'c1', courses: { id: 'c1', name: 'A', level: 'B' } }
        ],
        error: null
      };

      const result = await studentService.getStudents();
      
      expect(result[0]!.full_name).toBe('Carlos');
    });
  });

  describe('getStudentDetails', () => {
    it('returns student details with absences and records', async () => {
      mockStudentDetailsData = {
        data: { id: 'stu-1', full_name: 'Juan Pérez', course_id: 'course-1', rut: '12345678-9', courses: { id: 'course-1', name: '8°A', level: 'BASICA' } },
        error: null
      };
      mockAbsencesData = {
        data: [
          { id: 'abs-1', start_date: '2024-01-15', end_date: '2024-01-16', observation: 'Enfermedad', status: 'pendiente' }
        ],
        error: null
      };
      mockRecordsData = {
        data: [
          { id: 'rec-1', date_time: '2024-01-20T10:00:00Z', observation: 'Entrevista padres' }
        ],
        error: null
      };

      const result = await studentService.getStudentDetails('stu-1');
      
      expect(result.student).toBeDefined();
      expect(result.absences).toHaveLength(1);
      expect(result.records).toHaveLength(1);
    });

    it('handles empty absences and records', async () => {
      mockStudentDetailsData = {
        data: { id: 'stu-1', full_name: 'Juan Pérez', course_id: 'course-1', rut: '12345678-9', courses: { id: 'course-1', name: '8°A', level: 'BASICA' } },
        error: null
      };
      mockAbsencesData = { data: [], error: null };
      mockRecordsData = { data: [], error: null };

      const result = await studentService.getStudentDetails('stu-1');
      
      expect(result.absences).toHaveLength(0);
      expect(result.records).toHaveLength(0);
    });

    it('handles student not found', async () => {
      mockStudentDetailsData = { data: null, error: { message: 'Not found' } };

      const result = await studentService.getStudentDetails('nonexistent');
      
      expect(result.student).toBeNull();
    });
  });

  describe('bulkInsertStudents', () => {
    it('inserts multiple students and returns data', async () => {
      const students = [
        { full_name: 'Juan Pérez', course_id: 'course-1', rut: '12345678-9' },
        { full_name: 'María González', course_id: 'course-1', rut: '98765432-1' }
      ];
      
      mockBulkInsertData = {
        data: [
          { id: 'new-1', ...students[0] },
          { id: 'new-2', ...students[1] }
        ],
        error: null
      };

      const result = await studentService.bulkInsertStudents(students);
      
      expect(result).toHaveLength(2);
      expect(result![0]!.id).toBe('new-1');
    });

    it('handles insert error', async () => {
      mockBulkInsertData = { data: null, error: { message: 'Duplicate key' } };

      const result = await studentService.bulkInsertStudents([{ full_name: 'Test', course_id: 'c1' }]);
      
      expect(result).toBeUndefined();
    });
  });
});
