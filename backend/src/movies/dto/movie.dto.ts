import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class MovieDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  imdbID: string;

  @IsNumber()
  @IsOptional()
  year: number;

  @IsString()
  @IsOptional()
  poster: string;
}

