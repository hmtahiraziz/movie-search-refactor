import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { movieApi } from '@/lib/api';
import { Movie, SearchMoviesResponse, FavoritesResponse } from '@/types/movie';
import { REACT_QUERY } from '@/constants';

export const useSearchMovies = (
  query: string, 
  page: number = 1, 
  enabled: boolean = false
): UseQueryResult<SearchMoviesResponse, Error> => {
  const trimmedQuery = query.trim();
  
  return useQuery({
    queryKey: [REACT_QUERY.QUERY_KEYS.MOVIES, REACT_QUERY.QUERY_KEYS.SEARCH, trimmedQuery, page],
    queryFn: () => movieApi.searchMovies(trimmedQuery, page),
    enabled: enabled && trimmedQuery.length > 0,
    retry: REACT_QUERY.RETRY_COUNT,
    retryDelay: REACT_QUERY.RETRY_DELAY_MS,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    throwOnError: false,
  });
};

export const useFavorites = (page: number = 1): UseQueryResult<FavoritesResponse, Error> => {
  return useQuery({
    queryKey: [REACT_QUERY.QUERY_KEYS.MOVIES, REACT_QUERY.QUERY_KEYS.FAVORITES, page],
    queryFn: () => movieApi.getFavorites(page),
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('404')) {
        return false;
      }
      return failureCount < REACT_QUERY.RETRY_COUNT;
    },
    retryDelay: REACT_QUERY.RETRY_DELAY_MS,
    refetchOnWindowFocus: true,
    throwOnError: false,
  });
};

export const useAddToFavorites = (): UseMutationResult<void, Error, Movie, unknown> => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: movieApi.addToFavorites,
    onMutate: async (newMovie) => {
      await queryClient.cancelQueries({ queryKey: [REACT_QUERY.QUERY_KEYS.MOVIES, REACT_QUERY.QUERY_KEYS.SEARCH] });
      
      const previousSearchData = queryClient.getQueryData<SearchMoviesResponse>([
        REACT_QUERY.QUERY_KEYS.MOVIES,
        REACT_QUERY.QUERY_KEYS.SEARCH,
      ]);
      
      if (previousSearchData) {
        queryClient.setQueryData<SearchMoviesResponse>(
          [REACT_QUERY.QUERY_KEYS.MOVIES, REACT_QUERY.QUERY_KEYS.SEARCH],
          {
            ...previousSearchData,
            data: {
              ...previousSearchData.data,
              movies: previousSearchData.data.movies.map((movie) =>
                movie.imdbID === newMovie.imdbID ? { ...movie, isFavorite: true } : movie
              ),
            },
          }
        );
      }
      
      return { previousSearchData };
    },
    onError: (error, newMovie, context) => {
      if (context?.previousSearchData) {
        queryClient.setQueryData(
          [REACT_QUERY.QUERY_KEYS.MOVIES, REACT_QUERY.QUERY_KEYS.SEARCH],
          context.previousSearchData
        );
      }
      console.error('Failed to add to favorites:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: [REACT_QUERY.QUERY_KEYS.MOVIES, REACT_QUERY.QUERY_KEYS.FAVORITES],
        refetchType: 'active',
      });
      queryClient.invalidateQueries({ 
        queryKey: [REACT_QUERY.QUERY_KEYS.MOVIES, REACT_QUERY.QUERY_KEYS.SEARCH],
        refetchType: 'active',
      });
    },
  });
};

export const useRemoveFromFavorites = (): UseMutationResult<void, Error, string, unknown> => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: movieApi.removeFromFavorites,
    onMutate: async (imdbID) => {
      await queryClient.cancelQueries({ queryKey: [REACT_QUERY.QUERY_KEYS.MOVIES, REACT_QUERY.QUERY_KEYS.SEARCH] });
      
      const previousSearchData = queryClient.getQueryData<SearchMoviesResponse>([
        REACT_QUERY.QUERY_KEYS.MOVIES,
        REACT_QUERY.QUERY_KEYS.SEARCH,
      ]);
      
      if (previousSearchData) {
        queryClient.setQueryData<SearchMoviesResponse>(
          [REACT_QUERY.QUERY_KEYS.MOVIES, REACT_QUERY.QUERY_KEYS.SEARCH],
          {
            ...previousSearchData,
            data: {
              ...previousSearchData.data,
              movies: previousSearchData.data.movies.map((movie) =>
                movie.imdbID === imdbID ? { ...movie, isFavorite: false } : movie
              ),
            },
          }
        );
      }
      
      return { previousSearchData };
    },
    onError: (error, imdbID, context) => {
      if (context?.previousSearchData) {
        queryClient.setQueryData(
          [REACT_QUERY.QUERY_KEYS.MOVIES, REACT_QUERY.QUERY_KEYS.SEARCH],
          context.previousSearchData
        );
      }
      console.error('Failed to remove from favorites:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: [REACT_QUERY.QUERY_KEYS.MOVIES, REACT_QUERY.QUERY_KEYS.FAVORITES],
        refetchType: 'active',
      });
      queryClient.invalidateQueries({ 
        queryKey: [REACT_QUERY.QUERY_KEYS.MOVIES, REACT_QUERY.QUERY_KEYS.SEARCH],
        refetchType: 'active',
      });
    },
  });
};

