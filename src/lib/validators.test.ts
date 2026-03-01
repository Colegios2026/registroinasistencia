import { describe, expect, it } from 'vitest';
import { 
  validateAbsenceCreation, 
  testValidationSchema, 
  absenceValidationSchema, 
  inspectorateRecordValidationSchema 
} from './validators';

describe('lib/validators', () => {
  describe('validateAbsenceCreation', () => {
    it('returns invalid for malformed date', () => {
      const res = validateAbsenceCreation('not-a-date');
      expect(res.valid).toBe(false);
      expect(res.warning).toMatch(/inválida/i);
    });

    it('warns when start date is retroactive', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]!;
      const res = validateAbsenceCreation(yesterday);
      expect(res.valid).toBe(true);
      expect(res.warning).toMatch(/retroactiva/i);
    });

    it('warns when less than 24h ahead', () => {
      const soon = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString().split('T')[0]!;
      const res = validateAbsenceCreation(soon);
      expect(res.valid).toBe(true);
      expect(res.warning).toMatch(/24/i);
    });

    it('returns valid without warning for far future date', () => {
      const future = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!;
      const res = validateAbsenceCreation(future);
      expect(res.valid).toBe(true);
      expect(res.warning).toBeUndefined();
    });
  });

  describe('testValidationSchema', () => {
    it('validates a correct test object', () => {
      const validTest = {
        subject: 'Matemáticas',
        type: 'Prueba',
        course_id: 'c1',
        date: '2024-03-15',
        description: 'Unit test'
      };
      const result = testValidationSchema.safeParse(validTest);
      expect(result.success).toBe(true);
    });

    it('rejects short subject name', () => {
      const invalid = {
        subject: 'Ma', // Less than 3 chars
        type: 'Prueba',
        course_id: 'c1',
        date: '2024-03-15'
      };
      const result = testValidationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('3 caracteres');
      }
    });

    it('rejects empty type', () => {
      const invalid = {
        subject: 'Matemáticas',
        type: '',
        course_id: 'c1',
        date: '2024-03-15'
      };
      const result = testValidationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects invalid date format', () => {
      const invalid = {
        subject: 'Matemáticas',
        type: 'Prueba',
        course_id: 'c1',
        date: 'not-a-date'
      };
      const result = testValidationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('allows optional description', () => {
      const valid = {
        subject: 'Historia',
        type: 'Control',
        course_id: 'c2',
        date: '2024-03-20'
      };
      const result = testValidationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe('absenceValidationSchema', () => {
    it('validates a correct absence object', () => {
      const validAbsence = {
        student_id: 's1',
        course_id: 'c1',
        start_date: '2024-03-10',
        end_date: '2024-03-12',
        observation: 'Enfermedad'
      };
      const result = absenceValidationSchema.safeParse(validAbsence);
      expect(result.success).toBe(true);
    });

    it('rejects end_date before start_date', () => {
      const invalid = {
        student_id: 's1',
        course_id: 'c1',
        start_date: '2024-03-15',
        end_date: '2024-03-10'
      };
      const result = absenceValidationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('fecha de fin');
      }
    });

    it('rejects empty student_id', () => {
      const invalid = {
        student_id: '',
        course_id: 'c1',
        start_date: '2024-03-10',
        end_date: '2024-03-12'
      };
      const result = absenceValidationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('allows null observation', () => {
      const valid = {
        student_id: 's1',
        course_id: 'c1',
        start_date: '2024-03-10',
        end_date: '2024-03-12',
        observation: null
      };
      const result = absenceValidationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects observation over 500 chars', () => {
      const invalid = {
        student_id: 's1',
        course_id: 'c1',
        start_date: '2024-03-10',
        end_date: '2024-03-12',
        observation: 'x'.repeat(501)
      };
      const result = absenceValidationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('inspectorateRecordValidationSchema', () => {
    it('validates a correct inspectorate record', () => {
      const valid = {
        student_id: 's1',
        date_time: '2024-03-15T10:00:00',
        observation: ' student was late to class',
        actions_taken: 'Called parents'
      };
      const result = inspectorateRecordValidationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects short observation', () => {
      const invalid = {
        student_id: 's1',
        date_time: '2024-03-15T10:00:00',
        observation: 'Hi', // Less than 5 chars
      };
      const result = inspectorateRecordValidationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects invalid date_time', () => {
      const invalid = {
        student_id: 's1',
        date_time: 'not-a-datetime',
        observation: 'Valid observation text here',
      };
      const result = inspectorateRecordValidationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('allows optional actions_taken', () => {
      const valid = {
        student_id: 's1',
        date_time: '2024-03-15T10:00:00',
        observation: 'Some observation text'
      };
      const result = inspectorateRecordValidationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects actions_taken over 1000 chars', () => {
      const invalid = {
        student_id: 's1',
        date_time: '2024-03-15T10:00:00',
        observation: 'Valid observation',
        actions_taken: 'x'.repeat(1001)
      };
      const result = inspectorateRecordValidationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});
