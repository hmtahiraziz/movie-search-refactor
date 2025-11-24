import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OmdbSearchResponse, OmdbMovie } from '../dto/omdb-response.dto';
import { MOVIES_CONSTANTS } from '../constants/movies.constants';
import axios from 'axios';

@Injectable()
export class OmdbService {
  private readonly logger = new Logger(OmdbService.name);
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OMDB_API_KEY');
    if (!apiKey) {
      throw new Error('OMDB_API_KEY environment variable is required');
    }

    const baseUrl = this.configService.get<string>('OMDB_API_BASE_URL') || MOVIES_CONSTANTS.OMDB_API_BASE_URL;
    this.baseUrl = `${baseUrl}?apikey=${apiKey}`;
  }

  async searchMovies(title: string, page: number = MOVIES_CONSTANTS.DEFAULT_PAGE): Promise<{ movies: OmdbMovie[]; totalResults: string }> {
    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new HttpException('Title is required', HttpStatus.BAD_REQUEST);
    }
    if (!Number.isInteger(page) || page < MOVIES_CONSTANTS.MIN_PAGE) {
      throw new HttpException('Page must be a positive integer', HttpStatus.BAD_REQUEST);
    }

    try {
      const response = await axios.get<OmdbSearchResponse>(
        `${this.baseUrl}&s=${encodeURIComponent(title)}&plot=full&page=${page}`,
      );
      
      if (response.data.Response === 'False' || response.data.Error) {
        return { movies: [], totalResults: '0' };
      }
      
      return {
        movies: response.data.Search || [],
        totalResults: response.data.totalResults || '0'
      };
    } catch (error) {
      this.logger.error('Error searching movies from OMDb API', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to search movies from OMDb API', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

