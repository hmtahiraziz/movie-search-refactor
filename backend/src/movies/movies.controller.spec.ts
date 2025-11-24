import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { FavoritesQueryDto } from './dto/favorites-query.dto';
import { AddFavoriteDto } from './dto/add-favorite.dto';

describe('MoviesController', () => {
  let controller: MoviesController;
  let service: MoviesService;

  const mockMoviesService = {
    getMovieByTitle: jest.fn(),
    addToFavorites: jest.fn(),
    removeFromFavorites: jest.fn(),
    getFavorites: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MoviesService,
          useValue: mockMoviesService,
        },
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    service = module.get<MoviesService>(MoviesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchMovies', () => {
    it('should call service with correct parameters', async () => {
      const queryDto: SearchQueryDto = { q: 'test', page: 1 };
      const expectedResult = {
        data: {
          movies: [],
          count: 0,
          totalResults: '0',
        },
      };

      mockMoviesService.getMovieByTitle.mockResolvedValue(expectedResult);

      const result = await controller.searchMovies(queryDto);
      expect(service.getMovieByTitle).toHaveBeenCalledWith('test', 1);
      expect(result).toEqual(expectedResult);
    });

    it('should use default page if not provided', async () => {
      const queryDto: SearchQueryDto = { q: 'test' };
      const expectedResult = {
        data: {
          movies: [],
          count: 0,
          totalResults: '0',
        },
      };

      mockMoviesService.getMovieByTitle.mockResolvedValue(expectedResult);

      await controller.searchMovies(queryDto);
      expect(service.getMovieByTitle).toHaveBeenCalledWith('test', 1);
    });
  });

  describe('addToFavorites', () => {
    it('should call service with correct movie data', () => {
      const movieDto: AddFavoriteDto = {
        title: 'Test Movie',
        imdbID: 'tt123',
        year: 2020,
        poster: 'poster1',
      };

      const expectedResult = {
        data: {
          message: 'Movie added to favorites',
        },
      };

      mockMoviesService.addToFavorites.mockReturnValue(expectedResult);

      const result = controller.addToFavorites(movieDto);
      expect(service.addToFavorites).toHaveBeenCalledWith({
        title: 'Test Movie',
        imdbID: 'tt123',
        year: 2020,
        poster: 'poster1',
      });
      expect(result).toEqual(expectedResult);
    });

    it('should handle optional fields', () => {
      const movieDto: AddFavoriteDto = {
        title: 'Test Movie',
        imdbID: 'tt123',
      };

      mockMoviesService.addToFavorites.mockReturnValue({
        data: { message: 'Movie added to favorites' },
      });

      controller.addToFavorites(movieDto);
      expect(service.addToFavorites).toHaveBeenCalledWith({
        title: 'Test Movie',
        imdbID: 'tt123',
        year: 0,
        poster: '',
      });
    });
  });

  describe('removeFromFavorites', () => {
    it('should call service with correct imdbID', () => {
      const expectedResult = {
        data: {
          message: 'Movie removed from favorites',
        },
      };

      mockMoviesService.removeFromFavorites.mockReturnValue(expectedResult);

      const result = controller.removeFromFavorites('tt123');
      expect(service.removeFromFavorites).toHaveBeenCalledWith('tt123');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getFavorites', () => {
    it('should call service with correct page', async () => {
      const queryDto: FavoritesQueryDto = { page: 2 };
      const expectedResult = {
        data: {
          favorites: [],
          count: 0,
          totalResults: '0',
          currentPage: 2,
          totalPages: 0,
        },
      };

      mockMoviesService.getFavorites.mockResolvedValue(expectedResult);

      const result = await controller.getFavorites(queryDto);
      expect(service.getFavorites).toHaveBeenCalledWith(2);
      expect(result).toEqual(expectedResult);
    });

    it('should use default page if not provided', async () => {
      const queryDto: FavoritesQueryDto = {};
      const expectedResult = {
        data: {
          favorites: [],
          count: 0,
          totalResults: '0',
          currentPage: 1,
          totalPages: 0,
        },
      };

      mockMoviesService.getFavorites.mockResolvedValue(expectedResult);

      await controller.getFavorites(queryDto);
      expect(service.getFavorites).toHaveBeenCalledWith(1);
    });
  });
});

