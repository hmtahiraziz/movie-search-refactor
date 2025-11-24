import { Button } from './ui/button';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * Reusable empty state component
 */
export const EmptyState = ({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className = '',
}: EmptyStateProps) => {
  const actionButton = actionLabel && (
    actionHref ? (
      <Link href={actionHref}>
        <Button className="bg-gradient-primary">{actionLabel}</Button>
      </Link>
    ) : onAction ? (
      <Button onClick={onAction} className="bg-gradient-primary">
        {actionLabel}
      </Button>
    ) : null
  );

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-semibold mb-2">{title}</h2>
        <p className="text-muted-foreground mb-6">{description}</p>
        {actionButton}
      </div>
    </div>
  );
};

