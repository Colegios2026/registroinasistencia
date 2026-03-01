import { describe, expect, it } from 'vitest';
import {
  normalizeHoliday,
  filterHolidaysByPeriod,
  findAffectedTests,
  groupTestsByCourse,
  normalizeAbsenceWithDetails,
  Holiday,
} from './transformations';
import { Absence, Course, Student, Test } from '../types';

describe('lib/transformations', () => {
  it('normalizeHoliday mapea fila de Supabase a Holiday', () => {
    const row = {
      fecha: '2026-09-18',
      descripcion: 'Fiestas Patrias',
      es_irrenunciable: true,
    };

    const result = normalizeHoliday(row as never);

    expect(result).toEqual<Holiday>({
      id: '2026-09-18',
      date: '2026-09-18',
      name: 'Fiestas Patrias',
      es_irrenunciable: true,
    });
  });

  it('filterHolidaysByPeriod filtra por mes y año', () => {
    const holidays: Holiday[] = [
      { id: '1', date: '2026-03-10', name: 'A', es_irrenunciable: false },
      { id: '2', date: '2026-04-10', name: 'B', es_irrenunciable: true },
      { id: '3', date: '2025-03-10', name: 'C', es_irrenunciable: false },
    ];

    const result = filterHolidaysByPeriod(holidays, 2, 2026);

    expect(result).toHaveLength(1);
    expect(result[0]).toBeDefined();
    expect(result[0]!.id).toBe('1');
  });

  it('groupTestsByCourse agrupa por course_id', () => {
    const tests: Test[] = [
      { id: 't1', course_id: 'c1', date: '2026-03-10', subject: 'Mat', type: 'Control', created_at: null, description: null },
      { id: 't2', course_id: 'c1', date: '2026-03-11', subject: 'Len', type: 'Prueba', created_at: null, description: null },
      { id: 't3', course_id: 'c2', date: '2026-03-12', subject: 'His', type: 'Control', created_at: null, description: null },
    ];

    const grouped = groupTestsByCourse(tests);

    expect(grouped.c1).toHaveLength(2);
    expect(grouped.c2).toHaveLength(1);
  });

  it('findAffectedTests devuelve pruebas en rango inclusivo', () => {
    const courseTests: Test[] = [
      { id: 't1', course_id: 'c1', date: '2026-03-10', subject: 'Mat', type: 'Control', created_at: null, description: null },
      { id: 't2', course_id: 'c1', date: '2026-03-15', subject: 'Len', type: 'Prueba', created_at: null, description: null },
      { id: 't3', course_id: 'c1', date: '2026-03-20', subject: 'His', type: 'Control', created_at: null, description: null },
    ];

    const affected = findAffectedTests(courseTests, '2026-03-10', '2026-03-15');

    expect(affected.map((t) => t.id)).toEqual(['t1', 't2']);
  });

  it('normalizeAbsenceWithDetails arma estructura final esperada', () => {
    const course: Course = {
      id: 'c1',
      name: '1A',
      level: 'BASICA',
      position: 1,
      created_at: null,
    };

    const student: Student & { courses: Course } = {
      id: 's1',
      rut: '11.111.111-1',
      full_name: 'Ana Pérez',
      course_id: 'c1',
      created_at: null,
      courses: course,
    };

    const absence: Absence & { students: Student & { courses: Course } } = {
      id: 'a1',
      student_id: 's1',
      start_date: '2026-03-10',
      end_date: '2026-03-12',
      observation: null,
      document_url: null,
      status: 'PENDIENTE',
      created_at: null,
      students: student,
    };

    const affectedTests: Test[] = [
      { id: 't1', course_id: 'c1', date: '2026-03-11', subject: 'Mat', type: 'Control', created_at: null, description: null },
    ];

    const result = normalizeAbsenceWithDetails(absence, affectedTests);

    expect(result.student.full_name).toBe('Ana Pérez');
    expect(result.student.course.name).toBe('1A');
    expect(result.affected_tests?.[0]).toBeDefined();
    expect(result.affected_tests?.[0]?.id).toBe('t1');
  });
});
