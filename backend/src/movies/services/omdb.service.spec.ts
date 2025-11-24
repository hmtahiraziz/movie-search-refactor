import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { OmdbService } from './omdb.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OmdbService', () => {
  let service: OmdbService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'OMDB_API_KEY') return 'test-api-key';
      if (key === 'OMDB_API_BASE_URL') return undefined;
      return undefined;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OmdbService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<OmdbService>(OmdbService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should throw error if OMDB_API_KEY is not provided', () => {
      const invalidConfigService = {
        get: jest.fn().mockReturnValue(undefined),
      };
      
      expect(() => {
        new OmdbService(invalidConfigService as unknown as ConfigService);
      }).toThrow('OMDB_API_KEY environment variable is required');
    });

    it('should initialize with API key from config', () => {
      expect(service).toBeDefined();
    });
  });

  describe('searchMovies', () => {

    it('should throw error if title is empty', async () => {
      await expect(service.searchMovies('')).rejects.toThrow(HttpException);
      await expect(service.searchMovies('   ')).rejects.toThrow(HttpException);
    });

    it('should throw error if page is invalid', async () => {
      await expect(service.searchMovies('test', 0)).rejects.toThrow(HttpException);
      await expect(service.searchMovies('test', -1)).rejects.toThrow(HttpException);
    });

    it('should return empty results when API returns false response', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          Response: 'False',
          Error: 'Movie not found!',
        },
      } as never);

      const result = await service.searchMovies('nonexistent', 1);
      expect(result.movies).toEqual([]);
      expect(result.totalResults).toBe('0');
    });

    it('should return movies when API call succeeds', async () => {
      const mockMovies = [
        { Title: 'Test Movie', Year: '2020', imdbID: 'tt123', Type: 'movie', Poster: 'poster1' },
        { Title: 'Test Movie 2', Year: '2021', imdbID: 'tt456', Type: 'movie', Poster: 'poster2' },
      ];

      mockedAxios.get.mockResolvedValue({
        data: {
          Response: 'True',
          Search: mockMovies,
          totalResults: '2',
        },
      } as never);

      const result = await service.searchMovies('test', 1);
      expect(result.movies).toEqual(mockMovies);
      expect(result.totalResults).toBe('2');
    });

    it('should handle API errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(service.searchMovies('test', 1)).rejects.toThrow(HttpException);
    });
  });
});

