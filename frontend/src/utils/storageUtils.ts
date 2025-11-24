import { STORAGE_KEYS, PAGINATION } from '@/constants';

export interface SearchState {
  query: string;
  page: number;
}

/**
 * Retrieves search state from sessionStorage
 * @returns Search state object with query and page, or default values
 */
export const getSearchState = (): SearchState => {
  if (typeof window === 'undefined') {
    return { query: '', page: PAGINATION.DEFAULT_PAGE };
  }

  try {
    const stored = sessionStorage.getItem(STORAGE_KEYS.SEARCH_STATE);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        query: parsed.query || '',
        page: parsed.page || PAGINATION.DEFAULT_PAGE,
      };
    }
  } catch (error) {
    console.error('Error reading search state from storage:', error);
  }

  return { query: '', page: PAGINATION.DEFAULT_PAGE };
};

/**
 * Saves search state to sessionStorage
 * @param query - The search query string
 * @param page - The page number
 */
export const saveSearchState = (query: string, page: number): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.setItem(
      STORAGE_KEYS.SEARCH_STATE,
      JSON.stringify({ query: query.trim(), page })
    );
  } catch (error) {
    console.error('Error saving search state to storage:', error);
  }
};

