// ============================================================
// Crisis OS — Input Component
// ============================================================

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-300"
          >
            {label}
            {props.required && (
              <span className="text-primary-400 ml-1">*</span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-lg text-sm text-slate-100',
            'bg-slate-800/60 border border-slate-700',
            'placeholder:text-slate-500',
            'transition-colors duration-200',
            'hover:border-slate-600',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
            error && 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-red-400 flex items-center gap-1"
          >
            <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-slate-500">{hint}</p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';
