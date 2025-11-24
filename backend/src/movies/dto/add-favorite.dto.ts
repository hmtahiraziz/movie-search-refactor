import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class AddFavoriteDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  imdbID: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  year?: number;

  @IsOptional()
  @IsString()
  poster?: string;
}

