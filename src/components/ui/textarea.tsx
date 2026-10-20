import * as React from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[90px] w-full rounded-none bg-white px-4 py-3 text-sm text-[#262626] placeholder:text-[#9a9a9a] border border-[#e6e6e6] transition-all focus-visible:outline-none focus-visible:border-[#262626] focus-visible:ring-1 focus-visible:ring-[#262626] disabled:cursor-not-allowed disabled:opacity-50',
          hasError && 'border-[#dc2626] focus-visible:border-[#dc2626] focus-visible:ring-[#dc2626]',
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = 'Textarea';
