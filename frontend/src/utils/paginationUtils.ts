/**
 * Calculates pagination range with ellipsis
 * @param currentPage - Current page number
 * @param totalPages - Total number of pages
 * @param maxVisible - Maximum number of visible page buttons
 * @returns Pagination calculation result
 */
export interface PaginationRange {
  startPage: number;
  endPage: number;
  showStartEllipsis: boolean;
  showEndEllipsis: boolean;
}

export const calculatePaginationRange = (
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5
): PaginationRange => {
  const halfVisible = Math.floor(maxVisible / 2);
  
  let start = Math.max(1, currentPage - halfVisible);
  const end = Math.min(totalPages, start + maxVisible - 1);
  
  // Adjust start if we're near the end
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }
  
  return {
    startPage: start,
    endPage: end,
    showStartEllipsis: start > 2,
    showEndEllipsis: end < totalPages - 1,
  };
};

/**
 * Calculates total pages from total results and page size
 * @param totalResults - Total number of results (string or number)
 * @param pageSize - Number of items per page
 * @returns Total number of pages
 */
export const calculateTotalPages = (
  totalResults: string | number,
  pageSize: number
): number => {
  const total = typeof totalResults === 'string' 
    ? parseInt(totalResults, 10) 
    : totalResults;
  
  if (isNaN(total) || total <= 0) return 0;
  
  return Math.ceil(total / pageSize);
};

