import React, { useState } from 'react';
import { X, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import { FileDropzone } from '../../../components/shared/file-dropzone';
import { useUploadFile, useAddEmployeeDocument } from '../api/employee-api';

export interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  onSuccess?: () => void;
}

const DOCUMENT_TYPES = [
  { value: 'nic_scan', label: 'National Identity Card (NIC)' },
  { value: 'passport', label: 'Passport Copy' },
  { value: 'employment_contract', label: 'Employment Contract' },
  { value: 'educational_certificate', label: 'Educational Degree / Certificate' },
  { value: 'bank_verification', label: 'Bank Passbook / Statement' },
  { value: 'cv_resume', label: 'Curriculum Vitae (CV)' },
  { value: 'appointment_letter', label: 'Appointment / Offer Letter' },
  { value: 'other', label: 'Other Statutory / HR Document' },
];

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  onSuccess,
}) => {
  const [documentType, setDocumentType] = useState('nic_scan');
  const [title, setTitle] = useState('');
  const [expiresOn, setExpiresOn] = useState('');
  const [visibility, setVisibility] = useState<'hr' | 'manager' | 'employee'>('hr');
  const [notes, setNotes] = useState('');
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const uploadFileMutation = useUploadFile();
  const addDocMutation = useAddEmployeeDocument();

  if (!isOpen) return null;

  const handleFileAccepted = async (file: File) => {
    setErrorMessage(null);
    setFileName(file.name);
    if (!title) {
      const suggestedTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(suggestedTitle);
    }

    try {
      const response = await uploadFileMutation.mutateAsync(file);
      setUploadedFileId(response.id);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err.message || 'File upload failed');
      setUploadedFileId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFileId) {
      setErrorMessage('Please select and upload a document file first.');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Document title is required.');
      return;
    }

    try {
      await addDocMutation.mutateAsync({
        employeeId,
        data: {
          documentType,
          title: title.trim(),
          fileId: uploadedFileId,
          visibility,
          expiresOn: expiresOn || undefined,
          notes: notes.trim() || undefined,
        },
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || err.message || 'Failed to attach document to employee.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-white border border-[#e6e6e6] shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#e6e6e6]">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#1c69d4]" />
            <h3 className="text-sm font-bold text-ink">Upload Employee Document</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-mute hover:text-ink transition-colors cursor-pointer p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 flex-1 overflow-y-auto text-xs">
          {/* File Upload Dropzone */}
          <div>
            <Label className="mb-1 block font-semibold">Select Document File *</Label>
            <FileDropzone
              onFileAccepted={handleFileAccepted}
              disabled={uploadFileMutation.isPending}
            />
            {uploadFileMutation.isPending && (
              <p className="mt-1 text-xs text-[#1c69d4] font-medium animate-pulse">
                Uploading and scanning file with storage provider...
              </p>
            )}
            {uploadedFileId && (
              <p className="mt-1 text-xs text-[#059669] flex items-center gap-1 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> File &quot;{fileName}&quot; uploaded and ready to attach.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="mb-1 block font-semibold">Document Category *</Label>
              <Select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full"
              >
                {DOCUMENT_TYPES.map((dt) => (
                  <option key={dt.value} value={dt.value}>
                    {dt.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label className="mb-1 block font-semibold">Document Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. NIC Scan (Front & Back)"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="mb-1 block font-semibold">Expiry Date (Optional)</Label>
              <Input
                type="date"
                value={expiresOn}
                onChange={(e) => setExpiresOn(e.target.value)}
              />
            </div>

            <div>
              <Label className="mb-1 block font-semibold">Visibility Privilege</Label>
              <Select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="w-full"
              >
                <option value="hr">HR Admins Only</option>
                <option value="manager">HR & Line Manager</option>
                <option value="employee">HR, Manager & Employee</option>
              </Select>
            </div>
          </div>

          <div>
            <Label className="mb-1 block font-semibold">Verification Notes / Remarks</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Verified against original NIC during onboarding"
            />
          </div>

          {errorMessage && (
            <div className="flex items-center gap-1.5 p-2 text-xs border border-[#dc2626]/20 bg-[#dc2626]/5 text-[#dc2626]">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e6e6e6]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={addDocMutation.isPending || uploadFileMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!uploadedFileId || addDocMutation.isPending || uploadFileMutation.isPending}
              isLoading={addDocMutation.isPending}
              className="font-bold"
            >
              Attach Document
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
