import { buildSearchUrl, parseSearchParams, isValidPage } from '../urlUtils';
import { PAGINATION } from '@/constants';

describe('urlUtils', () => {
  describe('buildSearchUrl', () => {
    it('should build URL with query only', () => {
      const result = buildSearchUrl('test query', 1);
      expect(result).toBe('/?q=test+query');
    });

    it('should build URL with query and page', () => {
      const result = buildSearchUrl('test query', 2);
      expect(result).toBe('/?q=test+query&page=2');
    });

    it('should return root URL when query is empty and page is 1', () => {
      const result = buildSearchUrl('', 1);
      expect(result).toBe('/');
    });

    it('should trim query before building URL', () => {
      const result = buildSearchUrl('  test  ', 1);
      expect(result).toBe('/?q=test');
    });

    it('should not include page when page is 1', () => {
      const result = buildSearchUrl('test', PAGINATION.DEFAULT_PAGE);
      expect(result).toBe('/?q=test');
    });
  });

  describe('parseSearchParams', () => {
    it('should parse query and page from URLSearchParams', () => {
      const params = new URLSearchParams('q=test&page=2');
      const result = parseSearchParams(params);
      expect(result).toEqual({ query: 'test', page: 2 });
    });

    it('should return default page when page is not provided', () => {
      const params = new URLSearchParams('q=test');
      const result = parseSearchParams(params);
      expect(result).toEqual({ query: 'test', page: PAGINATION.DEFAULT_PAGE });
    });

    it('should return default values when params are empty', () => {
      const params = new URLSearchParams();
      const result = parseSearchParams(params);
      expect(result).toEqual({ query: '', page: PAGINATION.DEFAULT_PAGE });
    });

    it('should handle invalid page numbers', () => {
      const params = new URLSearchParams('q=test&page=invalid');
      const result = parseSearchParams(params);
      expect(result).toEqual({ query: 'test', page: PAGINATION.DEFAULT_PAGE });
    });

    it('should handle negative page numbers', () => {
      const params = new URLSearchParams('q=test&page=-1');
      const result = parseSearchParams(params);
      expect(result).toEqual({ query: 'test', page: PAGINATION.DEFAULT_PAGE });
    });
  });

  describe('isValidPage', () => {
    it('should return true for valid page numbers', () => {
      expect(isValidPage(1, 10)).toBe(true);
      expect(isValidPage(5, 10)).toBe(true);
      expect(isValidPage(10, 10)).toBe(true);
    });

    it('should return false for page less than 1', () => {
      expect(isValidPage(0, 10)).toBe(false);
      expect(isValidPage(-1, 10)).toBe(false);
    });

    it('should return false for page greater than totalPages', () => {
      expect(isValidPage(11, 10)).toBe(false);
      expect(isValidPage(100, 10)).toBe(false);
    });

    it('should return false for non-integer page numbers', () => {
      expect(isValidPage(1.5, 10)).toBe(false);
      expect(isValidPage(2.7, 10)).toBe(false);
    });
  });
});

