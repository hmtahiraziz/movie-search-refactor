import { render, screen } from '@testing-library/react';
import { ErrorDisplay } from '../ErrorDisplay';

describe('ErrorDisplay', () => {
  it('should render error message from Error object', () => {
    const error = new Error('Test error message');
    render(<ErrorDisplay error={error} />);
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should render error message from string', () => {
    render(<ErrorDisplay error="String error message" />);
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('String error message')).toBeInTheDocument();
  });

  it('should render custom title', () => {
    const error = new Error('Test error');
    render(<ErrorDisplay error={error} title="Custom Title" />);
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const error = new Error('Test error');
    const { container } = render(<ErrorDisplay error={error} className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

