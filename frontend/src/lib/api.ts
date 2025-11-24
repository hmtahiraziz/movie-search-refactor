import { Movie, SearchMoviesResponse, FavoritesResponse } from '@/types/movie';
import { API_CONFIG, HTTP_STATUS } from '@/constants';
import { handleApiError, handleNetworkError } from '@/utils/apiErrorHandler';

export const movieApi = {
  searchMovies: async (query: string, page: number = 1): Promise<SearchMoviesResponse> => {
    if (!query || typeof query !== 'string' || !query.trim()) {
      throw new Error('Query is required and cannot be empty');
    }
    if (!Number.isInteger(page) || page < 1) {
      throw new Error('Page must be a positive integer');
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/search?q=${encodeURIComponent(query.trim())}&page=${page}`);

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      
      if (data.error || data.statusCode) {
        throw new Error(data.error || data.message || 'An error occurred');
      }
      
      return data;
    } catch (error) {
      throw handleNetworkError(error, 'Network error: Failed to search movies');
    }
  },

  getFavorites: async (page: number = 1): Promise<FavoritesResponse> => {
    if (!Number.isInteger(page) || page < 1) {
      throw new Error('Page must be a positive integer');
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/favorites/list?page=${page}`);
      
      if (!response.ok) {
        if (response.status === HTTP_STATUS.NOT_FOUND) {
          return {
            data: {
              favorites: [],
              count: 0,
              totalResults: '0',
              currentPage: page,
              totalPages: 0,
            },
          };
        }
        await handleApiError(response);
      }
      
      return response.json();
    } catch (error) {
      throw handleNetworkError(error, 'Network error: Failed to get favorites');
    }
  },

  addToFavorites: async (movie: Movie): Promise<void> => {
    if (!movie || !movie.imdbID || !movie.title) {
      throw new Error('Movie must have imdbID and title');
    }

    const payload = {
      title: movie.title,
      imdbID: movie.imdbID,
      year: movie.year ?? 0,
      poster: movie.poster ?? '',
    };

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json().catch(() => null);
      if (data?.error || data?.statusCode) {
        const message = Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message;
        throw new Error(message || data.error || 'Failed to add movie to favorites');
      }
    } catch (error) {
      throw handleNetworkError(error, 'Network error: Failed to add movie to favorites');
    }
  },

  removeFromFavorites: async (imdbID: string): Promise<void> => {
    if (!imdbID || typeof imdbID !== 'string' || !imdbID.trim()) {
      throw new Error('imdbID is required and cannot be empty');
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/favorites/${encodeURIComponent(imdbID.trim())}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        await handleApiError(response);
      }
    } catch (error) {
      throw handleNetworkError(error, 'Network error: Failed to remove movie from favorites');
    }
  },
};

