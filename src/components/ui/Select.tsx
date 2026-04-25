// ============================================================
// Crisis OS — Select Component
// ============================================================

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-slate-300"
          >
            {label}
            {props.required && (
              <span className="text-primary-400 ml-1">*</span>
            )}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full appearance-none px-3.5 py-2.5 pr-10 rounded-lg text-sm text-slate-100',
              'bg-slate-800/60 border border-slate-700',
              'transition-colors duration-200',
              'hover:border-slate-600',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
              error && 'border-red-500/50',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className,
            )}
            aria-invalid={!!error}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        {error && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
            {error}
          </p>
        )}
      </div>
    );
  },
);
Select.displayName = 'Select';
