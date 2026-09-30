import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[var(--text-sm)] font-medium text-[var(--color-text-primary)] mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-muted)]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`flex h-10 w-full rounded-md border bg-[var(--color-bg)] px-3 py-2 text-[var(--text-sm)] ring-offset-[var(--color-bg)] file:border-0 file:bg-transparent file:text-[var(--text-sm)] file:font-medium placeholder:text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors
              ${error ? 'border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]' : 'border-[var(--color-border)] focus-visible:ring-[var(--color-accent)]'}
              ${icon ? 'pl-10' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {(error || helperText) && (
          <p className={`mt-1.5 text-[var(--text-xs)] ${error ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-muted)]'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
