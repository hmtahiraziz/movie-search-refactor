import { URL_PARAMS, PAGINATION } from '@/constants';

export interface SearchParams {
  query: string;
  page: number;
}

/**
 * Builds a search URL with query and page parameters
 * @param query - The search query string
 * @param page - The page number
 * @returns The formatted URL string
 */
export const buildSearchUrl = (query: string, page: number): string => {
  const params = new URLSearchParams();
  const trimmedQuery = query.trim();
  
  if (trimmedQuery) {
    params.set(URL_PARAMS.QUERY, trimmedQuery);
  }
  
  if (page > PAGINATION.DEFAULT_PAGE) {
    params.set(URL_PARAMS.PAGE, page.toString());
  }
  
  return params.toString() ? `/?${params.toString()}` : '/';
};

/**
 * Parses search parameters from URLSearchParams
 * @param searchParams - URLSearchParams object
 * @returns Parsed search parameters with query and page
 */
export const parseSearchParams = (searchParams: URLSearchParams): SearchParams => {
  const query = searchParams.get(URL_PARAMS.QUERY) || '';
  const pageParam = searchParams.get(URL_PARAMS.PAGE);
  
  let page: number = PAGINATION.DEFAULT_PAGE;
  if (pageParam) {
    const parsedPage = parseInt(pageParam, 10);
    if (!isNaN(parsedPage) && parsedPage > 0) {
      page = parsedPage;
    }
  }
  
  return { query, page };
};

/**
 * Validates if a page number is within valid range
 * @param page - The page number to validate
 * @param totalPages - Total number of pages
 * @returns True if page is valid
 */
export const isValidPage = (page: number, totalPages: number): boolean => {
  return (
    Number.isInteger(page) &&
    page >= PAGINATION.MIN_PAGE &&
    page <= totalPages
  );
};

