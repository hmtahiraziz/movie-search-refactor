import { render } from '@testing-library/react';
import { LoadingState } from '../LoadingState';
import { SKELETON } from '@/constants';

describe('LoadingState', () => {
  it('should render default number of skeletons', () => {
    const { container } = render(<LoadingState />);
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBe(SKELETON.COUNT);
  });

  it('should render custom number of skeletons', () => {
    const { container } = render(<LoadingState count={5} />);
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBe(5);
  });

  it('should apply custom className', () => {
    const { container } = render(<LoadingState className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

