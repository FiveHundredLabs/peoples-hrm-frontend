import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, hasError, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-11 w-full rounded-none bg-white px-3.5 py-2.5 text-sm text-[#262626] placeholder:text-[#9a9a9a] placeholder:text-sm placeholder:font-light border border-[#e6e6e6] leading-normal transition-all focus-visible:outline-none focus-visible:border-[#262626] focus-visible:ring-1 focus-visible:ring-[#262626] disabled:cursor-not-allowed disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          hasError && 'border-[#dc2626] focus-visible:border-[#dc2626] focus-visible:ring-[#dc2626]',
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
