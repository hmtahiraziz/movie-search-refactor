interface ErrorDisplayProps {
  error: Error | string;
  title?: string;
  className?: string;
}

/**
 * Reusable error display component
 */
export const ErrorDisplay = ({ 
  error, 
  title = 'Error',
  className = '' 
}: ErrorDisplayProps) => {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">{title}</h2>
        <p className="text-lg text-red-500">{errorMessage}</p>
      </div>
    </div>
  );
};

