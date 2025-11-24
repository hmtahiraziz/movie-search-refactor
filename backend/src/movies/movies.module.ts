import { Module } from '@nestjs/common';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { OmdbService } from './services/omdb.service';

@Module({
  imports: [],
  controllers: [MoviesController],
  providers: [MoviesService, OmdbService],
})
export class MoviesModule {}

