/**
 * Handles API error responses and extracts error messages
 * @param response - The fetch Response object
 * @returns Promise that rejects with a formatted error
 */
export const handleApiError = async (response: Response): Promise<never> => {
  let errorData: { error?: string; message?: string | string[]; statusCode?: number } = {};
  
  try {
    errorData = await response.json();
  } catch {
    errorData = { error: `Request failed: ${response.statusText}` };
  }

  const message = Array.isArray(errorData.message)
    ? errorData.message.join(', ')
    : errorData.message || errorData.error;

  const error = new Error(message || `Request failed: ${response.statusText}`);
  
  if (errorData.statusCode) {
    (error as Error & { statusCode?: number }).statusCode = errorData.statusCode;
  }

  throw error;
};

/**
 * Handles network errors and wraps them in a consistent format
 * @param error - The caught error
 * @param defaultMessage - Default error message if error is not an Error instance
 * @returns Formatted error
 */
export const handleNetworkError = (error: unknown, defaultMessage: string): Error => {
  if (error instanceof Error) {
    return error;
  }
  return new Error(defaultMessage);
};

