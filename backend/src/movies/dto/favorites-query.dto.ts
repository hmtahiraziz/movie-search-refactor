import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FavoritesQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;
}

