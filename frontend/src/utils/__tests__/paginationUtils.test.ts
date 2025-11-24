import { calculatePaginationRange, calculateTotalPages } from '../paginationUtils';

describe('paginationUtils', () => {
  describe('calculatePaginationRange', () => {
    it('should calculate range for first page', () => {
      const result = calculatePaginationRange(1, 10);
      expect(result.startPage).toBe(1);
      expect(result.endPage).toBe(5);
      expect(result.showStartEllipsis).toBe(false);
      expect(result.showEndEllipsis).toBe(true);
    });

    it('should calculate range for middle page', () => {
      const result = calculatePaginationRange(5, 10);
      expect(result.startPage).toBe(3);
      expect(result.endPage).toBe(7);
      expect(result.showStartEllipsis).toBe(true);
      expect(result.showEndEllipsis).toBe(true);
    });

    it('should calculate range for last page', () => {
      const result = calculatePaginationRange(10, 10);
      expect(result.startPage).toBe(6);
      expect(result.endPage).toBe(10);
      expect(result.showStartEllipsis).toBe(true);
      expect(result.showEndEllipsis).toBe(false);
    });

    it('should handle small total pages', () => {
      const result = calculatePaginationRange(1, 3);
      expect(result.startPage).toBe(1);
      expect(result.endPage).toBe(3);
      expect(result.showStartEllipsis).toBe(false);
      expect(result.showEndEllipsis).toBe(false);
    });

    it('should use custom maxVisible', () => {
      const result = calculatePaginationRange(5, 20, 7);
      expect(result.endPage - result.startPage + 1).toBeLessThanOrEqual(7);
    });
  });

  describe('calculateTotalPages', () => {
    it('should calculate total pages from string totalResults', () => {
      const result = calculateTotalPages('100', 10);
      expect(result).toBe(10);
    });

    it('should calculate total pages from number totalResults', () => {
      const result = calculateTotalPages(100, 10);
      expect(result).toBe(10);
    });

    it('should return 0 for invalid totalResults', () => {
      expect(calculateTotalPages('invalid', 10)).toBe(0);
      expect(calculateTotalPages(NaN, 10)).toBe(0);
      expect(calculateTotalPages(0, 10)).toBe(0);
      expect(calculateTotalPages(-10, 10)).toBe(0);
    });

    it('should round up when not divisible', () => {
      const result = calculateTotalPages(95, 10);
      expect(result).toBe(10); // 95 / 10 = 9.5, rounded up to 10
    });

    it('should handle single page', () => {
      const result = calculateTotalPages(5, 10);
      expect(result).toBe(1);
    });
  });
});

