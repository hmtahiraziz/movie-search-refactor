export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/movies',
} as const;

export const STORAGE_KEYS = {
  SEARCH_STATE: 'movie-search-state',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  PAGE_SIZE: 10,
  MIN_PAGE: 1,
} as const;

export const SEARCH = {
  DEBOUNCE_DELAY_MS: 500,
  SYNC_DELAY_MS: 100,
} as const;

export const REACT_QUERY = {
  RETRY_COUNT: 1,
  RETRY_DELAY_MS: 1000,
  STALE_TIME_MS: 60 * 1000,
  QUERY_KEYS: {
    MOVIES: 'movies',
    SEARCH: 'search',
    FAVORITES: 'favorites',
  },
} as const;

export const SKELETON = {
  COUNT: 10,
  DELAY_INCREMENT_MS: 100,
  ANIMATION_DELAYS: {
    POSTER: 0,
    TITLE_1: 100,
    TITLE_2: 200,
    ICON: 300,
    YEAR: 400,
  },
} as const;

export const URL_PARAMS = {
  QUERY: 'q',
  PAGE: 'page',
} as const;

export const HTTP_STATUS = {
  NOT_FOUND: 404,
} as const;

