import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'accent';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ 
  className = '', 
  variant = 'default', 
  size = 'md',
  children, 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center rounded-full font-medium transition-colors border';
  
  const variants = {
    default: 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-[var(--color-border)]',
    success: 'bg-[#22c55e1a] text-[var(--color-success)] border-[#22c55e33]',
    warning: 'bg-[#f59e0b1a] text-[var(--color-warning)] border-[#f59e0b33]',
    danger: 'bg-[#ef44441a] text-[var(--color-danger)] border-[#ef444433]',
    accent: 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border-[var(--color-accent)]',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-[var(--text-xs)]',
    md: 'px-2.5 py-0.5 text-[var(--text-sm)]',
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </div>
  );
};
