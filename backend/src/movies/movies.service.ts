import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MovieDto } from './dto/movie.dto';
import { SearchMoviesResponseDto } from './dto/search-response.dto';
import { FavoritesResponseDto } from './dto/favorites-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { OmdbMovie } from './dto/omdb-response.dto';
import { MOVIES_CONSTANTS } from './constants/movies.constants';
import { OmdbService } from './services/omdb.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);
  private favorites: MovieDto[] = [];
  private favoritesLastModified: number = 0;
  private readonly favoritesFilePath: string;

  constructor(
    private configService: ConfigService,
    private omdbService: OmdbService,
  ) {
    const dataDir = path.join(process.cwd(), MOVIES_CONSTANTS.DATA_DIRECTORY);
    this.favoritesFilePath = path.join(dataDir, MOVIES_CONSTANTS.FAVORITES_FILE_NAME);
    
    this.loadFavorites();
  }

  private loadFavorites(): void {
    try {
      if (fs.existsSync(this.favoritesFilePath)) {
        const fileStats = fs.statSync(this.favoritesFilePath);
        if (fileStats.mtimeMs > this.favoritesLastModified) {
          const fileContent = fs.readFileSync(this.favoritesFilePath, 'utf-8');
          this.favorites = JSON.parse(fileContent);
          this.favoritesLastModified = fileStats.mtimeMs;
        }
      } else {
        this.ensureDataDirectoryExists();
        this.favorites = [];
        this.favoritesLastModified = Date.now();
      }
    } catch (error) {
      this.logger.error('Error loading favorites', error);
      this.favorites = [];
    }
  }

  private getFavoritesList(): MovieDto[] {
    this.loadFavorites();
    return this.favorites;
  }

  private ensureDataDirectoryExists(): void {
    const dataDir = path.dirname(this.favoritesFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  private saveFavorites(): void {
    try {
      this.ensureDataDirectoryExists();
      fs.writeFileSync(this.favoritesFilePath, JSON.stringify(this.favorites, null, 2));
      this.favoritesLastModified = Date.now();
    } catch (error) {
      this.logger.error('Error saving favorites', error);
      throw new HttpException('Failed to save favorites', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getMovieByTitle(title: string, page: number = MOVIES_CONSTANTS.DEFAULT_PAGE): Promise<SearchMoviesResponseDto> {
    try {
      const response = await this.omdbService.searchMovies(title, page);
      const favorites = this.getFavoritesList();
      const favoritesMap = new Map(favorites.map(fav => [fav.imdbID.toLowerCase(), fav]));
      
      const formattedResponse: MovieDto[] = response.movies.map((movie: OmdbMovie) => {
        const isFavorite = favoritesMap.has(movie.imdbID.toLowerCase());
        return {
          title: movie.Title,
          imdbID: movie.imdbID,
          year: this.parseYear(movie.Year),
          poster: movie.Poster,
          isFavorite,
        };
      });
      
      return {
        data: {
          movies: formattedResponse,
          count: formattedResponse.length,
          totalResults: response.totalResults,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error getting movies by title', error);
      throw new HttpException('Failed to get movies by title', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private parseYear(yearString: string): number {
    if (!yearString) return 0;
    // Extract first year from strings like "1999-2000" or "1999"
    const match = yearString.match(/^\d{4}/);
    return match ? parseInt(match[0], 10) : 0;
  }

  addToFavorites(movieToAdd: MovieDto): MessageResponseDto {
    if (!movieToAdd || typeof movieToAdd !== 'object') {
      throw new HttpException('Movie data is required', HttpStatus.BAD_REQUEST);
    }
    if (!movieToAdd.imdbID || !movieToAdd.title) {
      throw new HttpException('Movie must have imdbID and title', HttpStatus.BAD_REQUEST);
    }

    const favorites = this.getFavoritesList();
    const foundMovie = favorites.some((movie) => movie.imdbID.toLowerCase() === movieToAdd.imdbID.toLowerCase());
    if (foundMovie) {
      throw new HttpException(
        'Movie already in favorites',
        HttpStatus.BAD_REQUEST,
      );
    }
    
    const validatedMovie: MovieDto = {
      title: movieToAdd.title,
      imdbID: movieToAdd.imdbID,
      year: movieToAdd.year || 0,
      poster: movieToAdd.poster || '',
    };
    
    this.favorites.push(validatedMovie);
    this.saveFavorites();
    
    return {
      data: {
        message: 'Movie added to favorites',
      },
    };
  }

  removeFromFavorites(movieId: string): MessageResponseDto {
    if (!movieId || typeof movieId !== 'string' || !movieId.trim()) {
      throw new HttpException('Movie ID is required', HttpStatus.BAD_REQUEST);
    }

    const favorites = this.getFavoritesList();
    const foundIndex = favorites.findIndex((movie) => movie.imdbID.toLowerCase() === movieId.toLowerCase());
    if (foundIndex === -1) {
      throw new HttpException(
        'Movie not found in favorites',
        HttpStatus.NOT_FOUND,
      );
    }
    
    this.favorites.splice(foundIndex, 1);
    this.saveFavorites();
    
    return {
      data: {
        message: 'Movie removed from favorites',
      },
    };
  }

  getFavorites(page: number = MOVIES_CONSTANTS.DEFAULT_PAGE, pageSize: number = MOVIES_CONSTANTS.DEFAULT_PAGE_SIZE): FavoritesResponseDto {
    const favorites = this.getFavoritesList();
    
    if (favorites.length === 0) {
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
    
    if (!Number.isInteger(page) || page < MOVIES_CONSTANTS.MIN_PAGE) {
      throw new HttpException('Page must be a positive integer', HttpStatus.BAD_REQUEST);
    }
    if (!Number.isInteger(pageSize) || pageSize < MOVIES_CONSTANTS.MIN_PAGE_SIZE) {
      throw new HttpException('Page size must be a positive integer', HttpStatus.BAD_REQUEST);
    }
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedFavorites = favorites.slice(startIndex, endIndex);
    
    return {
      data: {
        favorites: paginatedFavorites,
        count: paginatedFavorites.length,
        totalResults: String(favorites.length),
        currentPage: page,
        totalPages: Math.ceil(favorites.length / pageSize),
      },
    };
  }
}

