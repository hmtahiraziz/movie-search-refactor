import { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { SEARCH } from "@/constants";

interface SearchBarProps {
  onSearch: (query: string, resetPage?: boolean) => void;
  debounceMs?: number;
  initialValue?: string;
}

const SearchBar = ({ onSearch, debounceMs = SEARCH.DEBOUNCE_DELAY_MS, initialValue = "" }: SearchBarProps) => {
  const [query, setQuery] = useState(initialValue);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastInitialValueRef = useRef(initialValue);
  const isSyncingRef = useRef(false);
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    if (initialValue !== lastInitialValueRef.current) {
      isSyncingRef.current = true;
      lastInitialValueRef.current = initialValue;
      setQuery(initialValue);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      setTimeout(() => {
        isSyncingRef.current = false;
      }, SEARCH.SYNC_DELAY_MS);
    }
  }, [initialValue]);

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    if (isSyncingRef.current) {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmedQuery = query.trim();
    const isUserTyping = query !== lastInitialValueRef.current;
    
    if (trimmedQuery.length > 0) {
      debounceTimerRef.current = setTimeout(() => {
        onSearch(trimmedQuery, isUserTyping);
      }, debounceMs);
    } else if (isUserTyping) {
      onSearch("", true);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, onSearch, debounceMs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery && trimmedQuery.length > 0) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      onSearch(trimmedQuery, true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
      <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <Input
        type="text"
        placeholder="Search for movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-12 h-14 text-lg bg-white border-gray-300 focus:border-blue-500 transition-colors text-black"
      />
    </form>
  );
};

export default SearchBar;

