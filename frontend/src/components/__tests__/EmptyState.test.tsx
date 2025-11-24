import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('should render title and description', () => {
    render(
      <EmptyState
        title="Test Title"
        description="Test Description"
      />
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should render action button with href', () => {
    render(
      <EmptyState
        title="Test Title"
        description="Test Description"
        actionLabel="Click Me"
        actionHref="/test"
      />
    );
    
    const link = screen.getByRole('link', { name: 'Click Me' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  it('should render action button with onClick', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(
      <EmptyState
        title="Test Title"
        description="Test Description"
        actionLabel="Click Me"
        onAction={handleClick}
      />
    );
    
    const button = screen.getByRole('button', { name: 'Click Me' });
    expect(button).toBeInTheDocument();
    
    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not render action button when actionLabel is not provided', () => {
    render(
      <EmptyState
        title="Test Title"
        description="Test Description"
      />
    );
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <EmptyState
        title="Test Title"
        description="Test Description"
        className="custom-class"
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

