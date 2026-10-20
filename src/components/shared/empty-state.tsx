import * as React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from '../ui/button';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = FolderOpen,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-none border border-dashed border-surface-pressed bg-canvas-soft p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-none bg-canvas border border-surface-pressed text-ink shadow-xs">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-ink tracking-tight">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-body font-normal">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
