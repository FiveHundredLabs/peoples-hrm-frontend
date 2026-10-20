import React from 'react';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { AlertTriangle } from 'lucide-react';

export interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Delete Permanently',
  isLoading = false,
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose} title={title} description={description} maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-[#dc2626]/10 border border-[#dc2626]/20 text-[#dc2626] text-xs">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>This action cannot be undone. Associated data will be safely archived or removed.</span>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-semibold rounded-none px-4"
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
