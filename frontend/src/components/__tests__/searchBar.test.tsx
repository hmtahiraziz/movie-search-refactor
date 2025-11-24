import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../searchBar';
import { SEARCH } from '@/constants';

// Mock timers
beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

describe('SearchBar', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should render search input', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Search for movies...');
    expect(input).toBeInTheDocument();
  });

  it('should call onSearch after debounce delay', async () => {
    const user = userEvent.setup({ delay: null });
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Search for movies...');
    await user.type(input, 'test');
    
    expect(mockOnSearch).not.toHaveBeenCalled();
    
    jest.advanceTimersByTime(SEARCH.DEBOUNCE_DELAY_MS);
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test', true);
    });
  });

  it('should use custom debounce delay', async () => {
    const user = userEvent.setup({ delay: null });
    const customDelay = 1000;
    render(<SearchBar onSearch={mockOnSearch} debounceMs={customDelay} />);
    
    const input = screen.getByPlaceholderText('Search for movies...');
    await user.type(input, 'test');
    
    jest.advanceTimersByTime(customDelay - 100);
    expect(mockOnSearch).not.toHaveBeenCalled();
    
    jest.advanceTimersByTime(100);
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalled();
    });
  });

  it('should set initial value', () => {
    render(<SearchBar onSearch={mockOnSearch} initialValue="initial query" />);
    
    const input = screen.getByPlaceholderText('Search for movies...') as HTMLInputElement;
    expect(input.value).toBe('initial query');
  });

  it('should call onSearch immediately on form submit', async () => {
    const user = userEvent.setup({ delay: null });
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Search for movies...');
    await user.type(input, 'test');
    await user.type(input, '{Enter}');
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test', true);
    });
  });

  it('should clear debounce timer on new input', async () => {
    const user = userEvent.setup({ delay: null });
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Search for movies...');
    await user.type(input, 't');
    
    jest.advanceTimersByTime(SEARCH.DEBOUNCE_DELAY_MS - 100);
    
    await user.type(input, 'e');
    
    jest.advanceTimersByTime(100);
    expect(mockOnSearch).not.toHaveBeenCalled();
    
    jest.advanceTimersByTime(SEARCH.DEBOUNCE_DELAY_MS);
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('te', true);
    });
  });
});

