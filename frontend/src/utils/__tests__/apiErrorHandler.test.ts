import { handleApiError, handleNetworkError } from '../apiErrorHandler';

// Mock Response for Node.js environment
class MockResponse {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;
  private _body: string;

  constructor(body: string, init?: { status?: number; statusText?: string; headers?: Record<string, string> }) {
    this._body = body;
    this.ok = (init?.status || 200) >= 200 && (init?.status || 200) < 300;
    this.status = init?.status || 200;
    this.statusText = init?.statusText || 'OK';
    this.headers = new Headers(init?.headers);
  }

  async json() {
    return JSON.parse(this._body);
  }

  async text() {
    return this._body;
  }
}

// Polyfill Response if not available
type GlobalWithResponse = typeof globalThis & { Response: typeof MockResponse };
if (typeof Response === 'undefined') {
  (global as GlobalWithResponse).Response = MockResponse;
}

// Helper to get Response constructor
const getResponseClass = (): typeof MockResponse | typeof Response => {
  return typeof Response !== 'undefined' ? Response : (global as GlobalWithResponse).Response;
};

describe('apiErrorHandler', () => {
  describe('handleApiError', () => {
    it('should extract error message from response', async () => {
      const ResponseClass = getResponseClass();
      const response = new ResponseClass(JSON.stringify({ error: 'Test error' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });

      await expect(handleApiError(response)).rejects.toThrow('Test error');
    });

    it('should handle array message', async () => {
      const ResponseClass = getResponseClass();
      const response = new ResponseClass(
        JSON.stringify({ message: ['Error 1', 'Error 2'] }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      await expect(handleApiError(response)).rejects.toThrow('Error 1, Error 2');
    });

    it('should handle string message', async () => {
      const ResponseClass = getResponseClass();
      const response = new ResponseClass(JSON.stringify({ message: 'Test message' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });

      await expect(handleApiError(response)).rejects.toThrow('Test message');
    });

    it('should fallback to statusText when JSON parsing fails', async () => {
      const ResponseClass = getResponseClass();
      const response = new ResponseClass('Invalid JSON', {
        status: 400,
        statusText: 'Bad Request',
      });

      await expect(handleApiError(response)).rejects.toThrow('Request failed: Bad Request');
    });

    it('should include statusCode in error', async () => {
      const ResponseClass = getResponseClass();
      const response = new ResponseClass(
        JSON.stringify({ error: 'Test', statusCode: 404 }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      try {
        await handleApiError(response);
        fail('Expected error to be thrown');
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(Error);
        expect((error as { statusCode?: number }).statusCode).toBe(404);
      }
    });
  });

  describe('handleNetworkError', () => {
    it('should return Error instance as-is', () => {
      const error = new Error('Network error');
      const result = handleNetworkError(error, 'Default message');
      expect(result).toBe(error);
      expect(result.message).toBe('Network error');
    });

    it('should wrap non-Error in Error with default message', () => {
      const result = handleNetworkError('string error', 'Default message');
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Default message');
    });

    it('should handle null/undefined', () => {
      const result = handleNetworkError(null, 'Default message');
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Default message');
    });
  });
});

