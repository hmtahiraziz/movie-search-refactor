import { MovieDto } from './movie.dto';

export class SearchMoviesResponseDto {
  data: {
    movies: MovieDto[];
    count: number;
    totalResults: string;
  };
}

