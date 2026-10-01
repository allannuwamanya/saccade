import React, { useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, icon, id: explicitId, ...props }, ref) => {
    const generatedId = useId();
    const inputId = explicitId || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + generatedId : generatedId);
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 cursor-pointer select-none"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div
              className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-muted)]"
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`flex h-10 w-full rounded-xl border bg-[var(--color-bg)] px-3 py-2 text-xs ring-offset-[var(--color-bg)] placeholder:text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors
              ${error ? 'border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)] text-rose-200' : 'border-[var(--color-border)] focus-visible:ring-[var(--color-accent)] text-white'}
              ${icon ? 'pl-9' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} role="alert" className="mt-1.5 text-xs text-[var(--color-danger)] flex items-center gap-1 font-medium">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="mt-1.5 text-xs text-[var(--color-text-muted)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
