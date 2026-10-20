import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';

export interface DialogProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export function Dialog({
  open,
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
}: DialogProps) {
  const isVisible = open ?? isOpen ?? false;

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isVisible) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const maxWidths = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '2xl': 'max-w-4xl',
    '4xl': 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1a2129]/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Box */}
      <div
        className={cn(
          'relative w-full rounded-none bg-white p-5 sm:p-6 border border-[#cccccc] shadow-lg transition-all z-10 my-auto',
          maxWidths[maxWidth],
        )}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e6e6e6]">
          <div className="min-w-0 flex-1 pr-2">
            <h2 className="text-lg sm:text-xl font-bold text-[#262626] tracking-tight">{title}</h2>
            {description && <p className="text-xs text-[#6b6b6b] mt-0.5 font-light">{description}</p>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close dialog"
            className="h-8 w-8 p-0 rounded-none hover:bg-[#f7f7f7] shrink-0"
          >
            <X className="h-4 w-4 text-[#262626]" />
          </Button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="mt-4 max-h-[calc(85vh-6rem)] overflow-y-auto pr-1 scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  );
}
