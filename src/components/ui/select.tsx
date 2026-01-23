'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'flex h-11 w-full appearance-none rounded-[var(--radius)] border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 pr-10 text-base text-[var(--foreground)] transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-[var(--error)] focus:ring-[var(--error)]',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--foreground-muted)] pointer-events-none" />
        </div>
        {error && <p className="mt-1.5 text-sm text-[var(--error)]">{error}</p>}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-[var(--foreground-muted)]">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
