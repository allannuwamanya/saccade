import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon, 
  title, 
  description, 
  action, 
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-[var(--radius-lg)] ${className}`}>
      {icon && (
        <div className="mb-4 text-[var(--color-text-muted)] p-3 rounded-full bg-[var(--color-surface-2)]">
          {icon}
        </div>
      )}
      <h3 className="text-[var(--text-lg)] font-medium text-[var(--color-text-primary)] mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
};
