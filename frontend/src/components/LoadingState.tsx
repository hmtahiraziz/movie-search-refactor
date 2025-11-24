import MovieCardSkeleton from './MovieCardSkeleton';
import { SKELETON } from '@/constants';

interface LoadingStateProps {
  count?: number;
  className?: string;
}

/**
 * Reusable loading state component with skeleton cards
 */
export const LoadingState = ({ 
  count = SKELETON.COUNT,
  className = '' 
}: LoadingStateProps) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <MovieCardSkeleton 
          key={index} 
          delay={index * SKELETON.DELAY_INCREMENT_MS} 
        />
      ))}
    </div>
  );
};

