"use client";

import { useState, useMemo, useCallback } from "react";
import MovieCard from "@/components/MovieCard";
import Pagination from "@/components/pagination";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { PAGINATION } from "@/constants";
import { isValidPage } from "@/utils/urlUtils";
import { useAddToFavorites, useFavorites, useRemoveFromFavorites } from "@/hooks/useMovies";
import { Movie } from "@/types/movie";

const Favorites = () => {
  const [currentPage, setCurrentPage] = useState<number>(PAGINATION.DEFAULT_PAGE);
  const { data: favorites, isLoading, error } = useFavorites(currentPage);
  
  const addToFavorites = useAddToFavorites();
  const removeFromFavorites = useRemoveFromFavorites();
  
  // On the favorites page, all movies are favorites, so remove,
  // but also support add in case this is reused in a context where movies might not be favorites
  const handleToggleFavorite = async (movie: Movie) => {
    const isFavorite = favorites?.data.favorites.some(fav => fav.imdbID === movie.imdbID) ?? false;
    try {
      if (isFavorite) {
        await removeFromFavorites.mutateAsync(movie.imdbID);

        // After removal, if this was the only movie on the last page, go to previous page
        if (favorites?.data.favorites.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        await addToFavorites.mutateAsync(movie);
      }
    } catch (error) {
      console.error(isFavorite ? 'Failed to remove from favorites:' : 'Failed to add to favorites:', error);
    }
  };

  const totalPages = useMemo(() => {
    return favorites?.data.totalPages || 0;
  }, [favorites?.data.totalPages]);

  const handlePageChange = useCallback((page: number) => {
    if (isValidPage(page, totalPages)) {
      setCurrentPage(page);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [totalPages]);
  
  const totalResults = useMemo(() => {
    if (!favorites?.data?.totalResults) return 0;
    const total = typeof favorites.data.totalResults === 'string'
      ? parseInt(favorites.data.totalResults, 10)
      : favorites.data.totalResults;
    return isNaN(total) ? 0 : total;
  }, [favorites?.data?.totalResults]);
  
  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <h1 className="text-4xl md:text-5xl text-white font-bold  bg-clip-text ">
              My Favorites
            </h1>
          </div>
          <p className="text-center text-muted-foreground">
            {totalResults} {totalResults === 1 ? "movie" : "movies"} saved
          </p>
        </div>

        {error && <ErrorDisplay error={error} />}

        {isLoading && <LoadingState />}

        {!isLoading && !error && totalResults === 0 && (
          <EmptyState
            title="No Favorites Yet"
            description="Start adding movies to your favorites from the search page"
            actionLabel="Search Movies"
            actionHref="/"
          />
        )}

        {!isLoading && !error && totalResults > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {favorites?.data.favorites.map((movie) => (
                <MovieCard
                  key={movie.imdbID}
                  movie={movie}
                  isFavorite={true}
                  onToggleFavorite={handleToggleFavorite}
                  isMutating={removeFromFavorites.isPending}
                />
              ))}
            </div>

            {totalPages > PAGINATION.DEFAULT_PAGE && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Favorites;

