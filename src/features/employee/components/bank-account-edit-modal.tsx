import React, { useState } from 'react';
import { Dialog } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { EmployeeBankAccount } from '../types/employee';
import { useUpdateBankAccount } from '../data/employee-data';
import { AlertCircle } from 'lucide-react';

export interface BankAccountEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  account: EmployeeBankAccount;
  onSuccess?: () => void;
}

export const BankAccountEditModal: React.FC<BankAccountEditModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  account,
  onSuccess,
}) => {
  const [bankName, setBankName] = useState(account.bankName);
  const [branchName, setBranchName] = useState(account.branchName || '');
  const [accountHolderName, setAccountHolderName] = useState(account.accountHolderName);
  const [accountNumber, setAccountNumber] = useState('');
  const [isPrimary, setIsPrimary] = useState(account.isPrimary);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateMutation = useUpdateBankAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await updateMutation.mutateAsync({
        employeeId,
        accountId: account.id,
        data: {
          bankName: bankName.trim(),
          branchName: branchName.trim() || undefined,
          accountHolderName: accountHolderName.trim(),
          accountNumber: accountNumber.trim() || undefined,
          isPrimary,
        },
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update bank details';
      setErrorMessage(Array.isArray(msg) ? msg.join(' • ') : msg);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="Edit Bank Remittance Account"
      description="Update banking details and primary salary credit configuration."
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
            <Label className="mb-1 block font-semibold">Bank Name *</Label>
            <Input
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              required
              placeholder="e.g. Commercial Bank of Ceylon"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1 block font-semibold">Branch Name</Label>
              <Input
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="e.g. Kollupitiya"
              />
            </div>
            <div>
              <Label className="mb-1 block font-semibold">Account Holder Name *</Label>
              <Input
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                required
                placeholder="Name as in Passbook"
              />
            </div>
          </div>

          <div>
            <Label className="mb-1 block font-semibold">
              New Account Number (Leave blank to keep existing •••• {account.accountNumberLast4 || 'XXXX'})
            </Label>
            <Input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter new account number if changing"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isPrimary"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="h-4 w-4 rounded-none border-hairline text-primary focus:ring-0 cursor-pointer"
            />
            <Label htmlFor="isPrimary" className="cursor-pointer font-semibold">
              Set as Primary Salary Credit Account
            </Label>
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
