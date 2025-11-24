import { MovieDto } from './movie.dto';

export class FavoritesResponseDto {
  data: {
    favorites: MovieDto[];
    count: number;
    totalResults: string;
    currentPage: number;
    totalPages: number;
  };
}

