import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from '../pagination';

describe('Pagination', () => {
  const mockOnPageChange = jest.fn();

  beforeEach(() => {
    mockOnPageChange.mockClear();
  });

  it('should render page numbers', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    );
    
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should disable previous button on first page', () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    );
    
    const buttons = container.querySelectorAll('button');
    const prevButton = buttons[0]; // First button is previous
    expect(prevButton).toBeDisabled();
  });

  it('should disable next button on last page', () => {
    const { container } = render(
      <Pagination
        currentPage={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    );
    
    const buttons = container.querySelectorAll('button');
    const nextButton = buttons[buttons.length - 1]; // Last button is next
    expect(nextButton).toBeDisabled();
  });

  it('should call onPageChange when clicking page number', async () => {
    const user = userEvent.setup();
    render(
      <Pagination
        currentPage={1}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    );
    
    const pageButton = screen.getByText('2');
    await user.click(pageButton);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('should call onPageChange when clicking next button', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    );
    
    const buttons = container.querySelectorAll('button');
    const nextButton = buttons[buttons.length - 1]; // Last button is next
    await user.click(nextButton);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('should call onPageChange when clicking previous button', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Pagination
        currentPage={2}
        totalPages={10}
        onPageChange={mockOnPageChange}
      />
    );
    
    const buttons = container.querySelectorAll('button');
    const prevButton = buttons[0]; // First button is previous
    await user.click(prevButton);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(1);
  });

  it('should show ellipsis for large page counts', () => {
    render(
      <Pagination
        currentPage={10}
        totalPages={20}
        onPageChange={mockOnPageChange}
      />
    );
    
    const ellipsis = screen.getAllByText('...');
    expect(ellipsis.length).toBeGreaterThan(0);
  });
});

