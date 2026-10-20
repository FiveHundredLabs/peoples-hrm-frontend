import React, { useState } from 'react';
import { Dialog } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import { EmployeeDocument } from '../types/employee';
import { useUpdateDocument } from '../api/employee-api';
import { AlertCircle } from 'lucide-react';

export interface DocumentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  document: EmployeeDocument;
  onSuccess?: () => void;
}

export const DocumentEditModal: React.FC<DocumentEditModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  document,
  onSuccess,
}) => {
  const [title, setTitle] = useState(document.title);
  const [visibility, setVisibility] = useState(document.visibility || 'hr');
  const [expiresOn, setExpiresOn] = useState(document.expiresOn ? document.expiresOn.split('T')[0] : '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateMutation = useUpdateDocument();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await updateMutation.mutateAsync({
        employeeId,
        documentId: document.id,
        data: {
          title: title.trim(),
          visibility: visibility as any,
          expiresOn: expiresOn || undefined,
        },
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update document details';
      setErrorMessage(Array.isArray(msg) ? msg.join(' • ') : msg);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="Edit Document Metadata"
      description="Update document title, visibility access level, and expiration date."
      maxWidth="md"
    >
      <div className="space-y-4">
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-none bg-[#dc2626]/10 border border-[#dc2626]/30 p-3 text-xs text-[#dc2626]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <Label className="mb-1 block font-semibold">Document Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Passport Copy"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1 block font-semibold">Visibility Privileges</Label>
              <Select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="w-full"
              >
                <option value="hr">HR Admins Only</option>
                <option value="manager">Managers & HR</option>
                <option value="employee">Employee Visible</option>
              </Select>
            </div>

            <div>
              <Label className="mb-1 block font-semibold">Expiration Date</Label>
              <Input
                type="date"
                value={expiresOn}
                onChange={(e) => setExpiresOn(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-hairline">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary-pill"
              size="sm"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Updating...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};
