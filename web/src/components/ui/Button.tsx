import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none touch-manipulation';
    
    const variants = {
      primary: 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] focus-visible:ring-[var(--color-accent)] shadow-sm hover:shadow-indigo-500/20',
      secondary: 'bg-[var(--color-surface-2)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] hover:text-white border border-[var(--color-border)] focus-visible:ring-[var(--color-border)]',
      ghost: 'hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] focus-visible:ring-[var(--color-border)]',
      danger: 'bg-[var(--color-danger)] text-white hover:opacity-90 focus-visible:ring-[var(--color-danger)]',
    };
    
    const sizes = {
      sm: 'h-8 px-3 text-xs min-h-[34px]',
      md: 'h-10 px-4 py-2 text-xs min-h-[40px]',
      lg: 'h-12 px-6 text-sm min-h-[44px]',
    };
    
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={isLoading || disabled}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
