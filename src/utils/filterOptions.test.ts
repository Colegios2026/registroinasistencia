import { describe, it, expect } from 'vitest';
import {
  MONTHS,
  getYearOptions,
  getCourseOptions,
  getStatusOptions,
} from './filterOptions';

describe('utils/filterOptions', () => {
  describe('MONTHS', () => {
    it('contains 12 months in Spanish', () => {
      expect(MONTHS).toHaveLength(12);
      expect(MONTHS[0]).toEqual({ value: 0, label: 'Enero' });
      expect(MONTHS[11]).toEqual({ value: 11, label: 'Diciembre' });
    });

    it('has correct value-index mapping', () => {
      MONTHS.forEach((month, index) => {
        expect(month.value).toBe(index);
      });
    });
  });

  describe('getYearOptions', () => {
    it('returns default 5 years with -2 offset', () => {
      const currentYear = new Date().getFullYear();
      const years = getYearOptions();
      
      expect(years).toHaveLength(5);
      expect(years[0]!.value).toBe(currentYear - 2);
      expect(years[4]!.value).toBe(currentYear + 2);
    });

    it('respects custom yearsSpan', () => {
      const years = getYearOptions(3, 0);
      const currentYear = new Date().getFullYear();
      
      expect(years).toHaveLength(3);
      expect(years[0]!.value).toBe(currentYear);
    });

    it('respects custom offset', () => {
      const years = getYearOptions(3, -5);
      const currentYear = new Date().getFullYear();
      
      expect(years[0]!.value).toBe(currentYear - 5);
    });

    it('labels match values', () => {
      const years = getYearOptions();
      years.forEach((year) => {
        expect(year.label).toBe(year.value.toString());
      });
    });
  });

  describe('getCourseOptions', () => {
    it('returns "Todos los Cursos" as first option when courses provided', () => {
      const courses = [
        { id: 'c1', name: '1° Básico A' },
        { id: 'c2', name: '2° Básico B' },
      ];
      const options = getCourseOptions(courses);
      
      expect(options[0]).toEqual({ value: '', label: 'Todos los Cursos' });
      expect(options).toHaveLength(3);
    });

    it('maps courses correctly', () => {
      const courses = [{ id: 'c1', name: '1° Básico A' }];
      const options = getCourseOptions(courses);
      
      expect(options[1]).toEqual({ value: 'c1', label: '1° Básico A' });
    });

    it('returns only "Todos los Cursos" for empty array', () => {
      const options = getCourseOptions([]);
      
      expect(options).toHaveLength(1);
      expect(options[0]).toEqual({ value: '', label: 'Todos los Cursos' });
    });
  });

  describe('getStatusOptions', () => {
    it('returns all status options with "Todos los Estados" first', () => {
      const options = getStatusOptions();
      
      expect(options).toHaveLength(3);
      expect(options[0]).toEqual({ value: '', label: 'Todos los Estados' });
      expect(options[1]).toEqual({ value: 'PENDIENTE', label: 'Pendiente' });
      expect(options[2]).toEqual({ value: 'JUSTIFICADA', label: 'Justificada' });
    });
  });
});
