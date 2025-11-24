import { IsString, IsNotEmpty, IsOptional, IsInt, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchQueryDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  q: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;
}

