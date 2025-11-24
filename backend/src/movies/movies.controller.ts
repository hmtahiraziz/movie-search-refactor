import { Controller, Get, Post, Delete, Param, Query, Body, ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { SearchMoviesResponseDto } from './dto/search-response.dto';
import { FavoritesResponseDto } from './dto/favorites-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { SearchQueryDto } from './dto/search-query.dto';
import { FavoritesQueryDto } from './dto/favorites-query.dto';
import { AddFavoriteDto } from './dto/add-favorite.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('search')
  async searchMovies(
    @Query(new ValidationPipe({ transform: true, whitelist: true })) queryDto: SearchQueryDto,
  ): Promise<SearchMoviesResponseDto> {
    const page = queryDto.page || 1;
    return await this.moviesService.getMovieByTitle(queryDto.q.trim(), page);
  }

  @Post('favorites')
  addToFavorites(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })) movieToAdd: AddFavoriteDto,
  ): MessageResponseDto {
    const movieDto = {
      title: movieToAdd.title,
      imdbID: movieToAdd.imdbID,
      year: movieToAdd.year || 0,
      poster: movieToAdd.poster || '',
    };
    return this.moviesService.addToFavorites(movieDto);
  }

  @Delete('favorites/:imdbID')
  removeFromFavorites(@Param('imdbID') imdbID: string): MessageResponseDto {
    if (!imdbID || typeof imdbID !== 'string' || !imdbID.trim()) {
      throw new HttpException('imdbID parameter is required and cannot be empty', HttpStatus.BAD_REQUEST);
    }
    return this.moviesService.removeFromFavorites(imdbID.trim());
  }

  @Get('favorites/list')
  async getFavorites(
    @Query(new ValidationPipe({ transform: true, whitelist: true })) queryDto: FavoritesQueryDto,
  ): Promise<FavoritesResponseDto> {
    const page = queryDto.page || 1;
    return await this.moviesService.getFavorites(page);
  }

}

