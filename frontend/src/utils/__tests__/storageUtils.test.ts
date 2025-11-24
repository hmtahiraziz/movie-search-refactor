import { getSearchState, saveSearchState } from '../storageUtils';
import { PAGINATION } from '@/constants';

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

describe('storageUtils', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    mockSessionStorage.clear();
    // Suppress console.error for error handling tests
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  describe('getSearchState', () => {
    it('should return default state when storage is empty', () => {
      const result = getSearchState();
      expect(result).toEqual({ query: '', page: PAGINATION.DEFAULT_PAGE });
    });

    it('should return stored state from sessionStorage', () => {
      const storedState = { query: 'test', page: 2 };
      mockSessionStorage.setItem('movie-search-state', JSON.stringify(storedState));
      
      const result = getSearchState();
      expect(result).toEqual(storedState);
    });

    it('should handle missing query in stored state', () => {
      const storedState = { page: 2 };
      mockSessionStorage.setItem('movie-search-state', JSON.stringify(storedState));
      
      const result = getSearchState();
      expect(result).toEqual({ query: '', page: 2 });
    });

    it('should handle missing page in stored state', () => {
      const storedState = { query: 'test' };
      mockSessionStorage.setItem('movie-search-state', JSON.stringify(storedState));
      
      const result = getSearchState();
      expect(result).toEqual({ query: 'test', page: PAGINATION.DEFAULT_PAGE });
    });

    it('should handle invalid JSON gracefully', () => {
      mockSessionStorage.setItem('movie-search-state', 'invalid json');
      
      const result = getSearchState();
      expect(result).toEqual({ query: '', page: PAGINATION.DEFAULT_PAGE });
    });
  });

  describe('saveSearchState', () => {
    it('should save state to sessionStorage', () => {
      saveSearchState('test query', 2);
      
      const stored = mockSessionStorage.getItem('movie-search-state');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed).toEqual({ query: 'test query', page: 2 });
    });

    it('should trim query before saving', () => {
      saveSearchState('  test  ', 2);
      
      const stored = mockSessionStorage.getItem('movie-search-state');
      const parsed = JSON.parse(stored!);
      expect(parsed.query).toBe('test');
    });

    it('should handle storage errors gracefully', () => {
      // Mock sessionStorage.setItem to throw an error
      const originalSetItem = mockSessionStorage.setItem;
      mockSessionStorage.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      // Should not throw
      expect(() => {
        saveSearchState('test', 1);
      }).not.toThrow();

      mockSessionStorage.setItem = originalSetItem;
    });
  });
});

