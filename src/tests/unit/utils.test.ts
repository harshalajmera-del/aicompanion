import {
  cn, formatCurrency, formatDate, formatDateRange, formatDurationMinutes,
  parsePTDuration, formatPTDuration, calculateDuration, addDaysToDate,
  slugify, truncate, pluralize, cToF, fToC, ratingLabel, capitalize,
} from '@/lib/utils';

describe('Utility Functions', () => {
  describe('cn()', () => {
    it('merges class names', () => {
      expect(cn('a', 'b')).toBe('a b');
    });
    it('handles conditional classes', () => {
      expect(cn('base', false && 'skip', 'keep')).toBe('base keep');
    });
    it('deduplicates tailwind classes', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4');
    });
  });

  describe('formatCurrency()', () => {
    it('formats USD', () => {
      expect(formatCurrency(1500, 'USD')).toMatch(/\$1,500/);
    });
    it('formats EUR', () => {
      expect(formatCurrency(1200, 'EUR')).toMatch(/1.200|1,200/);
    });
    it('rounds to integer', () => {
      expect(formatCurrency(99.7, 'USD')).not.toContain('.');
    });
  });

  describe('formatDate()', () => {
    it('formats ISO date', () => {
      expect(formatDate('2025-09-15')).toBe('Sep 15, 2025');
    });
    it('accepts custom format', () => {
      expect(formatDate('2025-09-15', 'yyyy')).toBe('2025');
    });
  });

  describe('formatDateRange()', () => {
    it('formats same-month range', () => {
      const result = formatDateRange('2025-09-15', '2025-09-22');
      expect(result).toContain('Sep');
    });
  });

  describe('formatDurationMinutes()', () => {
    it('formats minutes only', () => expect(formatDurationMinutes(45)).toBe('45m'));
    it('formats hours only', () => expect(formatDurationMinutes(120)).toBe('2h'));
    it('formats mixed', () => expect(formatDurationMinutes(150)).toBe('2h 30m'));
  });

  describe('parsePTDuration()', () => {
    it('parses 2h30m', () => expect(parsePTDuration('PT2H30M')).toBe(150));
    it('parses hours only', () => expect(parsePTDuration('PT8H')).toBe(480));
    it('parses minutes only', () => expect(parsePTDuration('PT45M')).toBe(45));
    it('returns 0 for empty', () => expect(parsePTDuration('')).toBe(0));
  });

  describe('calculateDuration()', () => {
    it('calculates days between dates', () => {
      expect(calculateDuration('2025-09-15', '2025-09-22')).toBe(7);
    });
  });

  describe('addDaysToDate()', () => {
    it('adds days correctly', () => {
      expect(addDaysToDate('2025-09-15', 7)).toBe('2025-09-22');
    });
    it('handles month rollover', () => {
      expect(addDaysToDate('2025-09-28', 5)).toBe('2025-10-03');
    });
  });

  describe('slugify()', () => {
    it('converts to lowercase hyphenated', () => {
      expect(slugify('New York City')).toBe('new-york-city');
    });
    it('removes special characters', () => {
      expect(slugify('Côte d\'Ivoire')).toBe('c-te-d-ivoire');
    });
  });

  describe('truncate()', () => {
    it('truncates long strings', () => {
      expect(truncate('Hello World', 8)).toBe('Hello…');
    });
    it('leaves short strings unchanged', () => {
      expect(truncate('Hi', 10)).toBe('Hi');
    });
  });

  describe('pluralize()', () => {
    it('singular form for 1', () => expect(pluralize(1, 'adult')).toBe('1 adult'));
    it('plural form for many', () => expect(pluralize(3, 'adult')).toBe('3 adults'));
    it('custom plural', () => expect(pluralize(2, 'child', 'children')).toBe('2 children'));
  });

  describe('temperature conversion', () => {
    it('cToF: 0°C = 32°F', () => expect(cToF(0)).toBe(32));
    it('cToF: 100°C = 212°F', () => expect(cToF(100)).toBe(212));
    it('fToC: 32°F = 0°C', () => expect(fToC(32)).toBe(0));
  });

  describe('ratingLabel()', () => {
    it('labels 9.5/10 as Exceptional', () => expect(ratingLabel(9.5)).toBe('Exceptional'));
    it('labels 8.0/10 as Excellent', () => expect(ratingLabel(8.0)).toBe('Excellent'));
    it('labels 7.0/10 as Very Good', () => expect(ratingLabel(7.0)).toBe('Very Good'));
  });

  describe('capitalize()', () => {
    it('capitalises first letter', () => expect(capitalize('hello')).toBe('Hello'));
    it('lowercases rest', () => expect(capitalize('WORLD')).toBe('World'));
  });
});
