export interface OmdbMovie {
  Title: string;
  imdbID: string;
  Year: string;
  Poster: string;
  Type?: string;
}

export interface OmdbSearchResponse {
  Search?: OmdbMovie[];
  totalResults?: string;
  Response: string;
  Error?: string;
}

