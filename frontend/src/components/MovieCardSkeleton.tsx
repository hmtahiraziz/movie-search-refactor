import { SKELETON } from '@/constants';

interface MovieCardSkeletonProps {
  delay?: number;
}

const MovieCardSkeleton = ({ delay = SKELETON.ANIMATION_DELAYS.POSTER }: MovieCardSkeletonProps) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md group animate-pulse-skeleton">
      <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-gray-100 via-gray-200/80 to-gray-100">
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent -translate-x-full animate-shimmer"
            style={{ animationDelay: `${delay}ms` }}
          />
        </div>
        <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md border border-gray-200/50">
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-gray-200 to-gray-100" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-gray-50/60 to-transparent" />
      </div>

      <div className="p-4 space-y-3">
        <div className="relative h-5 bg-gray-100 rounded-md overflow-hidden">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full animate-shimmer"
            style={{ animationDelay: `${delay + SKELETON.ANIMATION_DELAYS.TITLE_1}ms` }}
          />
        </div>
        <div className="relative h-5 w-4/5 bg-gray-100 rounded-md overflow-hidden">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full animate-shimmer"
            style={{ animationDelay: `${delay + SKELETON.ANIMATION_DELAYS.TITLE_2}ms` }}
          />
        </div>
        <div className="flex items-center gap-2 mt-3">
          <div className="relative w-4 h-4 bg-gray-100 rounded overflow-hidden flex-shrink-0">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full animate-shimmer"
              style={{ animationDelay: `${delay + SKELETON.ANIMATION_DELAYS.ICON}ms` }}
            />
          </div>
          <div className="relative h-4 w-16 bg-gray-100 rounded-md overflow-hidden">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full animate-shimmer"
              style={{ animationDelay: `${delay + SKELETON.ANIMATION_DELAYS.YEAR}ms` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCardSkeleton;

