import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] disabled:opacity-50 disabled:pointer-events-none';
    
    const variants = {
      primary: 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] focus-visible:ring-[var(--color-accent)]',
      secondary: 'bg-[var(--color-surface-2)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] focus-visible:ring-[var(--color-border)]',
      ghost: 'hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] focus-visible:ring-[var(--color-border)]',
      danger: 'bg-[var(--color-danger)] text-white hover:opacity-90 focus-visible:ring-[var(--color-danger)]',
    };
    
    const sizes = {
      sm: 'h-8 px-3 text-[var(--text-xs)]',
      md: 'h-10 px-4 py-2 text-[var(--text-sm)]',
      lg: 'h-12 px-8 text-[var(--text-base)]',
    };
    
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
