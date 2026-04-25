// ============================================================
// Crisis OS — Textarea Component
// ============================================================

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, showCount, className, id, maxLength, value, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const charCount = typeof value === 'string' ? value.length : 0;

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
        <textarea
          ref={ref}
          id={inputId}
          value={value}
          maxLength={maxLength}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-lg text-sm text-slate-100 min-h-[100px] resize-y',
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
          {...props}
        />
        <div className="flex items-center justify-between">
          {error ? (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
              {error}
            </p>
          ) : hint ? (
            <p className="text-xs text-slate-500">{hint}</p>
          ) : (
            <span />
          )}
          {showCount && maxLength && (
            <p className="text-xs text-slate-500">
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
