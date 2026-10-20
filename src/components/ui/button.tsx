import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'primary-pill'
    | 'secondary'
    | 'secondary-pill'
    | 'subtle'
    | 'floating'
    | 'outline'
    | 'outline-aubergine'
    | 'outline-on-aubergine'
    | 'outline-on-dark'
    | 'on-dark'
    | 'ghost'
    | 'destructive'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'default',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold tracking-[0.5px] transition-colors duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c69d4]/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer select-none rounded-none';

    const variants: Record<string, string> = {
      primary:
        'bg-[#1c69d4] text-white hover:bg-[#0653b6] active:bg-[#0653b6]',
      'primary-pill':
        'bg-[#1c69d4] text-white hover:bg-[#0653b6] active:bg-[#0653b6]',
      secondary:
        'bg-white text-[#262626] hover:bg-[#f7f7f7] active:bg-[#ebebeb] border border-[#cccccc]',
      'secondary-pill':
        'bg-white text-[#262626] hover:bg-[#f7f7f7] active:bg-[#ebebeb] border border-[#cccccc]',
      subtle:
        'bg-[#f7f7f7] text-[#262626] hover:bg-[#ebebeb] active:bg-[#ebebeb]',
      floating:
        'bg-white text-[#262626] hover:bg-[#f7f7f7] border border-[#cccccc]',
      outline:
        'bg-white text-[#262626] border border-[#cccccc] hover:bg-[#f7f7f7] active:bg-[#ebebeb]',
      'outline-aubergine':
        'bg-white text-[#262626] border border-[#cccccc] hover:bg-[#f7f7f7]',
      'outline-on-aubergine':
        'bg-transparent text-white border border-white/40 hover:bg-white/10',
      'outline-on-dark':
        'bg-transparent text-white border border-white/40 hover:bg-white/10',
      'on-dark':
        'bg-transparent text-white border border-white hover:bg-white/15',
      destructive:
        'bg-[#dc2626] text-white hover:bg-[#b91c1c] active:bg-[#991b1b]',
      ghost:
        'text-[#262626] hover:bg-[#f7f7f7] active:bg-[#ebebeb]',
      link:
        'text-[#1c69d4] hover:underline p-0 h-auto font-bold rounded-none',
    };

    const sizes: Record<string, string> = {
      default: 'px-6 py-3 text-sm h-11 leading-none',
      sm: 'px-3.5 py-1.5 text-xs h-8 leading-none',
      lg: 'px-8 py-3.5 text-base h-12 leading-none',
      icon: 'h-9 w-9 p-0 shrink-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variants[variant] || variants.primary,
          variant !== 'link' && sizes[size],
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
