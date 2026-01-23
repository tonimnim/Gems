'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'flex min-h-[120px] w-full rounded-[var(--radius)] border border-[var(--card-border)] bg-[var(--card)] px-4 py-3 text-base text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] transition-colors resize-y',
            'focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-[var(--error)] focus:ring-[var(--error)]',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-[var(--error)]">{error}</p>}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-[var(--foreground-muted)]">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
