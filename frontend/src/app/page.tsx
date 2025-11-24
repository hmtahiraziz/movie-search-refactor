'use client';

import { useMemo, useCallback, Suspense } from 'react';
import { useSearchMovies, useAddToFavorites, useRemoveFromFavorites } from '@/hooks/useMovies';
import { useSearchState } from '@/hooks/useSearchState';
import { Movie } from '@/types/movie';
import SearchBar from '@/components/searchBar';
import MovieCard from '@/components/MovieCard';
import Pagination from '@/components/pagination';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { PAGINATION } from '@/constants';
import { calculateTotalPages } from '@/utils/paginationUtils';
import { isValidPage } from '@/utils/urlUtils';

function SearchPageContent() {
  const { query: searchQuery, page: currentPage, setQuery, setPage } = useSearchState();
  
  const searchEnabled = searchQuery.trim().length > 0;
  const { data: searchResults, isLoading, error } = useSearchMovies(searchQuery, currentPage, searchEnabled);
  const addToFavorites = useAddToFavorites();
  const removeFromFavorites = useRemoveFromFavorites();

  const totalPages = useMemo(() => {
    if (!searchResults?.data.totalResults) return 0;
    return calculateTotalPages(searchResults.data.totalResults, PAGINATION.PAGE_SIZE);
  }, [searchResults?.data.totalResults]);

  const handleSearch = useCallback((query: string, resetPage: boolean = true) => {
    setQuery(query, resetPage);
  }, [setQuery]);

  const handleToggleFavorite = async (movie: Movie) => {
    if (addToFavorites.isPending || removeFromFavorites.isPending) {
      return;
    }

    try {
      if (movie.isFavorite) {
        await removeFromFavorites.mutateAsync(movie.imdbID);
      } else {
        await addToFavorites.mutateAsync(movie);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handlePageChange = useCallback((page: number) => {
    if (isValidPage(page, totalPages)) {
      setPage(page);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [setPage, totalPages]);

  const isMutating = addToFavorites.isPending || removeFromFavorites.isPending;

  return (
    <div className="min-h-screen bg-gradient-hero">
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <div className="flex items-center justify-center gap-3 mb-6">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text">
            Movie Finder
          </h1>
        </div>
        <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
      </div>

      {error && <ErrorDisplay error={error} />}

      {isLoading && <LoadingState />}

      {!isLoading && !error && (
        <>
          {searchResults?.data.movies.length === 0 && !searchQuery && (
            <EmptyState
              title="Start Your Search"
              description="Search for your favorite movies and add them to your favorites"
            />
          )}

          {searchResults?.data.movies.length === 0 && searchQuery && (
            <EmptyState
              title="No Movies Found"
              description={`No movies found for "${searchQuery}"`}
            />
          )}

          {searchResults?.data.movies && searchResults.data.movies.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {searchResults.data.movies.map((movie) => (
                  <MovieCard
                    key={movie.imdbID}
                    movie={movie}
                    isFavorite={movie.isFavorite ?? false}
                    onToggleFavorite={handleToggleFavorite}
                    isMutating={isMutating}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  </div>
);
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-hero">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text">
                Movie Finder
              </h1>
            </div>
          </div>
          <LoadingState />
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}

