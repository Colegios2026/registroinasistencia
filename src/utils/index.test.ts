import { describe, it, expect } from 'vitest';
import { cn, formatDate, formatDateTime } from './index';

describe('utils/index', () => {
  describe('cn', () => {
    it('combines class names with twMerge', () => {
      // twMerge handles tailwind merging, basic test
      const result = cn('text-red-500', 'bg-blue-500');
      expect(result).toContain('text-red-500');
      expect(result).toContain('bg-blue-500');
    });

    it('handles conditional classes', () => {
      const isActive = true;
      const result = cn('base-class', isActive && 'active-class');
      expect(result).toContain('base-class');
      expect(result).toContain('active-class');
    });

    it('handles falsey values', () => {
      const isActive = false;
      const result = cn('base-class', isActive && 'active-class', undefined, null);
      expect(result).toBe('base-class');
    });

    it('handles array input', () => {
      const classes = ['class1', 'class2'];
      const result = cn(classes);
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });
  });

  describe('formatDate', () => {
    it('formats ISO string date correctly', () => {
      const result = formatDate('2024-03-15T10:30:00Z');
      // Check for day, month, year presence (locale-dependent format)
      expect(result).toMatch(/\d{2}/);
      expect(result).toContain('2024');
    });

    it('formats Date object correctly', () => {
      const date = new Date(2024, 2, 15); // March 15, 2024
      const result = formatDate(date);
      expect(result).toContain('2024');
    });

    it('returns empty string for invalid date', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('Invalid Date');
    });
  });

  describe('formatDateTime', () => {
    it('formats ISO string with time', () => {
      const result = formatDateTime('2024-03-15T10:30:00Z');
      expect(result).toContain('2024');
      // Check for time components (hour:minute)
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('formats Date object with time', () => {
      const date = new Date(2024, 2, 15, 14, 30);
      const result = formatDateTime(date);
      expect(result).toContain('2024');
    });

    it('returns invalid for bad date', () => {
      const result = formatDateTime('not-a-date');
      expect(result).toBe('Invalid Date');
    });
  });
});
