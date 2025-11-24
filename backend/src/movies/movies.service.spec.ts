import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { OmdbService } from './services/omdb.service';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  statSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

describe('MoviesService', () => {
  let service: MoviesService;
  let omdbService: OmdbService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockOmdbService = {
    searchMovies: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: OmdbService,
          useValue: mockOmdbService,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    omdbService = module.get<OmdbService>(OmdbService);
    configService = module.get<ConfigService>(ConfigService);

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.statSync as jest.Mock).mockReturnValue({ mtimeMs: Date.now() });
    (fs.readFileSync as jest.Mock).mockReturnValue('[]');
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
    (fs.mkdirSync as jest.Mock).mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMovieByTitle', () => {
    it('should return formatted movies with favorite status', async () => {
      const mockOmdbMovies = [
        { Title: 'Test Movie', Year: '2020', imdbID: 'tt123', Type: 'movie', Poster: 'poster1' },
      ];

      mockOmdbService.searchMovies.mockResolvedValue({
        movies: mockOmdbMovies,
        totalResults: '1',
      });

      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify([
        { title: 'Test Movie', imdbID: 'tt123', year: 2020, poster: 'poster1' },
      ]));

      const result = await service.getMovieByTitle('test', 1);
      expect(result.data.movies).toHaveLength(1);
      expect(result.data.movies[0].title).toBe('Test Movie');
    });

    it('should handle errors from OmdbService', async () => {
      mockOmdbService.searchMovies.mockRejectedValue(
        new HttpException('API Error', HttpStatus.BAD_REQUEST),
      );

      await expect(service.getMovieByTitle('test', 1)).rejects.toThrow(HttpException);
    });
  });

  describe('addToFavorites', () => {
    beforeEach(() => {
      (fs.readFileSync as jest.Mock).mockReturnValue('[]');
    });

    it('should add movie to favorites', () => {
      const movie = {
        title: 'Test Movie',
        imdbID: 'tt123',
        year: 2020,
        poster: 'poster1',
      };

      const result = service.addToFavorites(movie);
      expect(result.data.message).toBe('Movie added to favorites');
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should throw error if movie already exists', () => {
      const movie = {
        title: 'Test Movie',
        imdbID: 'tt123',
        year: 2020,
        poster: 'poster1',
      };

      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify([movie]));

      expect(() => service.addToFavorites(movie)).toThrow(HttpException);
    });

    it('should throw error if movie data is invalid', () => {
      expect(() => service.addToFavorites(null as never)).toThrow(HttpException);
      expect(() => service.addToFavorites({} as never)).toThrow(HttpException);
    });
  });

  describe('removeFromFavorites', () => {
    it('should remove movie from favorites', () => {
      const movie = {
        title: 'Test Movie',
        imdbID: 'tt123',
        year: 2020,
        poster: 'poster1',
      };

      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify([movie]));

      const result = service.removeFromFavorites('tt123');
      expect(result.data.message).toBe('Movie removed from favorites');
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should throw error if movie not found', () => {
      (fs.readFileSync as jest.Mock).mockReturnValue('[]');

      expect(() => service.removeFromFavorites('tt123')).toThrow(HttpException);
    });

    it('should throw error if movieId is invalid', () => {
      expect(() => service.removeFromFavorites('')).toThrow(HttpException);
      expect(() => service.removeFromFavorites(null as never)).toThrow(HttpException);
    });
  });

  describe('getFavorites', () => {
    it('should return paginated favorites', () => {
      const movies = Array.from({ length: 15 }, (_, i) => ({
        title: `Movie ${i}`,
        imdbID: `tt${i}`,
        year: 2020,
        poster: 'poster1',
      }));

      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(movies));

      const result = service.getFavorites(1, 10);
      expect(result.data.favorites).toHaveLength(10);
      expect(result.data.count).toBe(10);
      expect(result.data.totalResults).toBe('15');
      expect(result.data.currentPage).toBe(1);
      expect(result.data.totalPages).toBe(2);
    });

    it('should return empty array when no favorites', () => {
      (fs.readFileSync as jest.Mock).mockReturnValue('[]');

      const result = service.getFavorites(1);
      expect(result.data.favorites).toEqual([]);
      expect(result.data.count).toBe(0);
    });

    it('should throw error for invalid page', () => {
      const movies = [{ title: 'Movie', imdbID: 'tt1', year: 2020, poster: 'poster1' }];
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(movies));

      expect(() => service.getFavorites(0)).toThrow(HttpException);
      expect(() => service.getFavorites(-1)).toThrow(HttpException);
    });
  });
});

