import * as React from 'react';
import { cn } from '../../lib/utils';

export interface PageContainerProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({
  title,
  description,
  actions,
  children,
  className,
}: PageContainerProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {(title || actions) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#e6e6e6]">
          <div className="min-w-0 flex-1">
            {title && (
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#262626]">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-1 text-sm text-[#6b6b6b] font-light">{description}</p>
            )}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-3 shrink-0">{actions}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
