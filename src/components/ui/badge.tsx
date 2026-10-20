import * as React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'destructive' | 'outline' | 'cream' | 'teal' | 'amber' | 'coral';
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  const variants: Record<string, string> = {
    default: 'bg-[#fafafa] text-[#262626] border border-[#e6e6e6]',
    primary: 'bg-[#1c69d4] text-white font-bold',
    coral: 'bg-[#1c69d4] text-white font-bold',
    secondary: 'bg-[#f7f7f7] text-[#262626] border border-[#e6e6e6]',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-bold',
    destructive: 'bg-rose-50 text-rose-800 border border-rose-200/60 font-bold',
    outline: 'text-[#262626] border border-[#cccccc] bg-transparent',
    cream: 'bg-[#fafafa] text-[#262626] border border-[#e6e6e6]',
    teal: 'bg-teal-50 text-teal-800 border border-teal-200/60 font-bold',
    amber: 'bg-amber-50 text-amber-900 border border-amber-200/60 font-bold',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-none px-2 py-0.5 text-xs font-bold uppercase tracking-[0.5px] select-none',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
