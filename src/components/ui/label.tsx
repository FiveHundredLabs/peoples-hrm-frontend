import * as React from 'react';
import { cn } from '../../lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'text-xs font-bold uppercase tracking-[0.5px] text-[#262626] leading-tight mb-1.5 block peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none',
          className,
        )}
        {...props}
      />
    );
  },
);
Label.displayName = 'Label';
