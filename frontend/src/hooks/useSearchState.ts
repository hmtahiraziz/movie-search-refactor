import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getSearchState, saveSearchState, SearchState } from '@/utils/storageUtils';
import { parseSearchParams, buildSearchUrl } from '@/utils/urlUtils';
import { PAGINATION } from '@/constants';

interface UseSearchStateOptions {
  onStateChange?: (state: SearchState) => void;
}

/**
 * Custom hook for managing search state with URL and sessionStorage synchronization
 * @param options - Optional configuration
 * @returns Search state and update functions
 */
export const useSearchState = (options?: UseSearchStateOptions) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isInitialMountRef = useRef(true);
  const isUpdatingUrlRef = useRef(false);

  const getInitialState = useCallback((): SearchState => {
    const urlParams = parseSearchParams(searchParams);
    
    if (urlParams.query || urlParams.page > PAGINATION.DEFAULT_PAGE) {
      return urlParams;
    }
    
    return getSearchState();
  }, [searchParams]);

  const [state, setState] = useState<SearchState>(getInitialState);

  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  const updateUrl = useCallback(
    (query: string, page: number, replace: boolean = false) => {
      const newUrl = buildSearchUrl(query, page);
      const currentParams = parseSearchParams(searchParamsRef.current);
      const currentUrl = buildSearchUrl(currentParams.query, currentParams.page);
      
      // Only update if URL actually changed
      if (newUrl === currentUrl) {
        saveSearchState(query, page);
        return;
      }
      
      isUpdatingUrlRef.current = true;
      
      if (replace) {
        router.replace(newUrl, { scroll: false });
      } else {
        router.push(newUrl, { scroll: false });
      }
      
      saveSearchState(query, page);
      
      // Reset flag after a short delay to allow URL to update
      setTimeout(() => {
        isUpdatingUrlRef.current = false;
      }, 100);
    },
    [router]
  );

  const pendingUrlUpdateRef = useRef<{ query: string; page: number; replace: boolean } | null>(null);
  const [urlUpdateTrigger, setUrlUpdateTrigger] = useState(0);

  const updateState = useCallback(
    (updates: Partial<SearchState>, updateUrlParams?: { replace?: boolean }) => {
      setState((prevState) => {
        const newState = { ...prevState, ...updates };
        
        if (updateUrlParams !== undefined) {
          pendingUrlUpdateRef.current = {
            query: newState.query,
            page: newState.page,
            replace: updateUrlParams.replace ?? false,
          };
          setUrlUpdateTrigger(prev => prev + 1);
        }
        
        options?.onStateChange?.(newState);
        return newState;
      });
    },
    [options]
  );

  useEffect(() => {
    if (pendingUrlUpdateRef.current) {
      const { query, page, replace } = pendingUrlUpdateRef.current;
      pendingUrlUpdateRef.current = null;
      
      // Use setTimeout to ensure this runs after any pending state updates
      const timeoutId = setTimeout(() => {
        updateUrl(query, page, replace);
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [urlUpdateTrigger, updateUrl]);

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      const urlParams = parseSearchParams(searchParams);
      const stored = getSearchState();
      
      const finalQuery = urlParams.query || stored.query;
      const finalPage = urlParams.page > PAGINATION.DEFAULT_PAGE ? urlParams.page : stored.page;
      
      setState((prevState) => {
        if (finalQuery !== prevState.query || finalPage !== prevState.page) {
          return { query: finalQuery, page: finalPage };
        }
        return prevState;
      });
      
      if (!urlParams.query && urlParams.page <= PAGINATION.DEFAULT_PAGE && (stored.query || stored.page > PAGINATION.DEFAULT_PAGE)) {
        // Use setTimeout to avoid updating during render
        setTimeout(() => {
          updateUrl(stored.query, stored.page, true);
        }, 0);
      } else if (urlParams.query || urlParams.page > PAGINATION.DEFAULT_PAGE) {
        saveSearchState(urlParams.query, urlParams.page);
      }
      return;
    }

    // Skip if we're the ones updating the URL
    if (isUpdatingUrlRef.current) {
      return;
    }

    const urlParams = parseSearchParams(searchParams);
    
    setState((prevState) => {
      const trimmedQuery = prevState.query.trim();
      const needsUpdate = urlParams.query !== trimmedQuery || urlParams.page !== prevState.page;
      
      if (needsUpdate) {
        saveSearchState(urlParams.query, urlParams.page);
        return { query: urlParams.query, page: urlParams.page };
      }
      
      return prevState;
    });
  }, [searchParams, updateUrl]);

  return {
    query: state.query,
    page: state.page,
    setQuery: (query: string, resetPage: boolean = true) => {
      const newPage = resetPage ? PAGINATION.DEFAULT_PAGE : state.page;
      updateState(
        { query: query.trim(), page: newPage },
        { replace: true }
      );
    },
    setPage: (page: number) => {
      updateState({ page }, { replace: false });
    },
    updateState,
  };
};

