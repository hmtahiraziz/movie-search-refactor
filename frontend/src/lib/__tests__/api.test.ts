import { movieApi } from '../api';
import { API_CONFIG, HTTP_STATUS } from '@/constants';
import type { Movie } from '@/types/movie';

// Mock fetch
global.fetch = jest.fn();

describe('movieApi', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('searchMovies', () => {
    it('should fetch movies successfully', async () => {
      const mockResponse = {
        data: {
          movies: [{ imdbID: '1', title: 'Test Movie', year: 2020, poster: 'url' }],
          count: 1,
          totalResults: '1',
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await movieApi.searchMovies('test', 1);
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}/search?q=test&page=1`
      );
    });

    it('should encode query parameters', async () => {
      const mockResponse = { data: { movies: [], count: 0, totalResults: '0' } };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await movieApi.searchMovies('test query with spaces', 1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('q=test%20query%20with%20spaces')
      );
    });

    it('should throw error for empty query', async () => {
      await expect(movieApi.searchMovies('', 1)).rejects.toThrow();
      await expect(movieApi.searchMovies('   ', 1)).rejects.toThrow();
    });

    it('should throw error for invalid page', async () => {
      await expect(movieApi.searchMovies('test', 0)).rejects.toThrow();
      await expect(movieApi.searchMovies('test', -1)).rejects.toThrow();
    });

    it('should handle API errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
        json: async () => ({ error: 'Movie not found' }),
      });

      await expect(movieApi.searchMovies('test', 1)).rejects.toThrow();
    });
  });

  describe('getFavorites', () => {
    it('should fetch favorites successfully', async () => {
      const mockResponse = {
        data: {
          favorites: [{ imdbID: '1', title: 'Test', year: 2020, poster: 'url' }],
          count: 1,
          totalResults: '1',
          currentPage: 1,
          totalPages: 1,
        },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await movieApi.getFavorites(1);
      expect(result).toEqual(mockResponse);
    });

    it('should return empty favorites for 404', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: HTTP_STATUS.NOT_FOUND,
        json: async () => ({}),
      });

      const result = await movieApi.getFavorites(1);
      expect(result.data.favorites).toEqual([]);
      expect(result.data.count).toBe(0);
    });

    it('should throw error for invalid page', async () => {
      await expect(movieApi.getFavorites(0)).rejects.toThrow();
    });
  });

  describe('addToFavorites', () => {
    it('should add movie to favorites', async () => {
      const movie = {
        imdbID: '1',
        title: 'Test Movie',
        year: 2020,
        poster: 'url',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await movieApi.addToFavorites(movie);
      expect(fetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}/favorites`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should throw error for invalid movie', async () => {
      const invalidMovie = {} as unknown as Movie;
      await expect(movieApi.addToFavorites(invalidMovie)).rejects.toThrow();
    });
  });

  describe('removeFromFavorites', () => {
    it('should remove movie from favorites', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await movieApi.removeFromFavorites('test-id');
      expect(fetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}/favorites/test-id`,
        { method: 'DELETE' }
      );
    });

    it('should encode imdbID in URL', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await movieApi.removeFromFavorites('test id with spaces');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('test%20id%20with%20spaces'),
        expect.any(Object)
      );
    });

    it('should throw error for empty imdbID', async () => {
      await expect(movieApi.removeFromFavorites('')).rejects.toThrow();
    });
  });
});

