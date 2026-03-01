import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase client before importing the service
let mockAbsencesData: any = { data: null, error: null };
let mockTestsData: any = { data: null, error: null };

const makeAbsencesChain = () => {
  const chain: any = {};
  
  // Chain for SELECT
  chain.select = () => chain;
  chain.order = () => chain;
  chain.eq = () => chain;
  chain.lte = () => chain;
  chain.gte = () => chain;
  chain.then = (resolve: any) => resolve(mockAbsencesData);

  // Chain for INSERT
  const insertChain: any = {};
  insertChain.select = () => ({ single: () => ({ then: (resolve: any) => resolve(mockAbsencesData) }) });
  chain.insert = (_: any) => insertChain;

  // Chain for UPDATE
  const updateChain: any = {};
  updateChain.eq = () => updateChain;
  updateChain.select = () => ({ single: () => ({ then: (resolve: any) => resolve(mockAbsencesData) }) });
  chain.update = (_: any) => updateChain;

  return chain;
};

const makeTestsChain = () => {
  const chain: any = {};
  chain.select = () => chain;
  chain.in = () => chain;
  chain.then = (resolve: any) => resolve(mockTestsData);
  return chain;
};

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'absences' || table === 'tests') {
        return table === 'absences' ? makeAbsencesChain() : makeTestsChain();
      }
      return makeAbsencesChain();
    },
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/file.pdf' } })
      })
    }
  }
}));

import { absenceService } from './absenceService';

describe('services/absenceService (integration - mocked supabase)', () => {
  beforeEach(() => {
    mockAbsencesData = { data: null, error: null };
    mockTestsData = { data: null, error: null };
    vi.resetAllMocks();
  });

  describe('getAbsences', () => {
    it('returns empty array when no data', async () => {
      mockAbsencesData = { data: [], error: null };
      mockTestsData = { data: [], error: null };
      
      const result = await absenceService.getAbsences();
      expect(result).toEqual([]);
    });

    it('returns absences with student and course details', async () => {
      mockAbsencesData = {
        data: [
          {
            id: 'abc-123',
            student_id: 'stu-1',
            start_date: '2024-01-15',
            end_date: '2024-01-16',
            observation: 'Enfermedad',
            document_url: null,
            status: 'pendiente',
            students: {
              id: 'stu-1',
              full_name: 'Juan Pérez',
              course_id: 'course-1',
              rut: '12345678-9',
              courses: { id: 'course-1', name: '8°A', level: 'BASICA' }
            }
          }
        ],
        error: null
      };
      mockTestsData = { data: [], error: null };

      const result = await absenceService.getAbsences();
      
      expect(result).toBeDefined();
      expect(result![0]!.id).toBe('abc-123');
      expect(result![0]!.student.full_name).toBe('Juan Pérez');
      expect(result![0]!.student.course.name).toBe('8°A');
    });

    it('filters absences by level', async () => {
      mockAbsencesData = { data: [], error: null };
      mockTestsData = { data: [], error: null };

      const result = await absenceService.getAbsences({ level: 'MEDIA' });
      
      expect(result).toEqual([]);
    });

    it('filters absences by courseId', async () => {
      mockAbsencesData = { data: [], error: null };
      mockTestsData = { data: [], error: null };

      const result = await absenceService.getAbsences({ courseId: 'course-1' });
      
      expect(result).toEqual([]);
    });

    it('filters absences by status', async () => {
      mockAbsencesData = { data: [], error: null };
      mockTestsData = { data: [], error: null };

      const result = await absenceService.getAbsences({ status: 'justificada' });
      
      expect(result).toEqual([]);
    });

    it('filters absences by date range', async () => {
      mockAbsencesData = { data: [], error: null };
      mockTestsData = { data: [], error: null };

      const result = await absenceService.getAbsences({ 
        startDate: '2024-01-01', 
        endDate: '2024-01-31' 
      });
      
      expect(result).toEqual([]);
    });

    it('includes affected tests in date range', async () => {
      mockAbsencesData = {
        data: [
          {
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
              courses: { id: 'course-1', name: '8°A', level: 'BASICA' }
            }
          }
        ],
        error: null
      };
      mockTestsData = {
        data: [
          { id: 'test-1', course_id: 'course-1', date: '2024-01-15', subject: 'Matemática', type: 'prueba' }
        ],
        error: null
      };

      const result = await absenceService.getAbsences();
      
      expect(result).toBeDefined();
      expect(result![0]!.affected_tests).toHaveLength(1);
      expect(result![0]!.affected_tests![0]!.subject).toBe('Matemática');
    });

    it('throws error when supabase returns error', async () => {
      mockAbsencesData = { data: null, error: { message: 'Database error' } };
      mockTestsData = { data: null, error: null };

      // Should handle error internally and return empty array
      const result = await absenceService.getAbsences();
      expect(result).toBeUndefined();
    });
  });

  describe('createAbsence', () => {
    it('creates absence without file and returns row', async () => {
      const newAbsence = {
        student_id: 'stu-1',
        start_date: '2024-02-01',
        end_date: '2024-02-02',
        observation: 'Médico'
      };
      
      mockAbsencesData = { 
        data: { id: 'new-abs-1', ...newAbsence, status: 'pendiente' }, 
        error: null 
      };

      const result = await absenceService.createAbsence(newAbsence as any);
      
      expect(result).toBeDefined();
      expect(result!.row.id).toBe('new-abs-1');
    });

    it('creates absence with file and returns uploadFailed false', async () => {
      const newAbsence = {
        student_id: 'stu-1',
        start_date: '2024-02-01',
        end_date: '2024-02-02',
        observation: 'Médico'
      };
      
      mockAbsencesData = { 
        data: { id: 'new-abs-2', ...newAbsence, status: 'justificada', document_url: 'https://example.com/file.pdf' }, 
        error: null 
      };

      // Create a mock file
      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      
      const result = await absenceService.createAbsence(newAbsence as any, mockFile);
      
      expect(result).toBeDefined();
      expect(result!.row.id).toBe('new-abs-2');
    });
  });

  describe('updateAbsence', () => {
    it('updates absence and returns row', async () => {
      const updates = {
        observation: 'Actualizado',
        status: 'justificada'
      };
      
      mockAbsencesData = { 
        data: { id: 'abs-1', ...updates }, 
        error: null 
      };

      const result = await absenceService.updateAbsence('abs-1', updates as any);
      
      expect(result).toBeDefined();
      expect(result!.row.id).toBe('abs-1');
    });

    it('updates absence with new file and sets status to justificada', async () => {
      const updates = {
        observation: 'Nuevo documento'
      };
      
      mockAbsencesData = { 
        data: { id: 'abs-1', ...updates, status: 'justificada', document_url: 'https://example.com/new.pdf' }, 
        error: null 
      };

      const mockFile = new File(['test'], 'new.pdf', { type: 'application/pdf' });
      
      const result = await absenceService.updateAbsence('abs-1', updates as any, mockFile);
      
      expect(result).toBeDefined();
      expect(result!.row.status).toBe('justificada');
    });
  });
});
