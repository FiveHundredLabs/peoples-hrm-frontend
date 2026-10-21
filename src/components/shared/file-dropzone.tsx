import React, { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { UploadCloud, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useStorageConfig } from '../../features/rbac/data/storage-data';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

export interface FileDropzoneProps {
  onFileAccepted: (file: File) => void;
  accept?: Record<string, string[]>;
  maxSizeMb?: number;
  disabled?: boolean;
  className?: string;
  hintText?: string;
}

const EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv',
};

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileAccepted,
  accept,
  maxSizeMb,
  disabled = false,
  className,
  hintText,
}) => {
  const { data: storageConfig } = useStorageConfig();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const effectiveMaxMb = maxSizeMb || storageConfig?.maxFileSizeMb || 25;
  const effectiveMaxBytes = effectiveMaxMb * 1024 * 1024;

  // Build dynamic accept map from storageConfig if not provided
  let effectiveAccept: Record<string, string[]> | undefined = accept;
  if (!effectiveAccept && storageConfig?.allowedExtensions) {
    const mimeMap: Record<string, string[]> = {};
    for (const ext of storageConfig.allowedExtensions) {
      const mime = EXT_TO_MIME[ext.toLowerCase()] || `application/${ext.toLowerCase()}`;
      if (!mimeMap[mime]) mimeMap[mime] = [];
      mimeMap[mime].push(`.${ext.toLowerCase()}`);
    }
    effectiveAccept = mimeMap;
  }

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setErrorMessage(null);
      if (fileRejections.length > 0) {
        const firstError = fileRejections[0].errors[0];
        if (firstError.code === 'file-too-large') {
          setErrorMessage(`File is too large. Maximum allowed size is ${effectiveMaxMb} MB.`);
        } else if (firstError.code === 'file-invalid-type') {
          setErrorMessage('Invalid file type. Please upload an accepted file format.');
        } else {
          setErrorMessage(firstError.message || 'Failed to process selected file.');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        onFileAccepted(file);
      }
    },
    [effectiveMaxMb, onFileAccepted],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: effectiveAccept,
    maxSize: effectiveMaxBytes,
    multiple: false,
    disabled,
  });

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-2 w-full">
      <div
        {...getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center border-2 border-dashed p-6 text-center transition-colors cursor-pointer select-none bg-white',
          isDragActive && !isDragReject && 'border-[#1c69d4] bg-[#1c69d4]/5',
          isDragReject && 'border-[#dc2626] bg-[#dc2626]/5',
          !isDragActive && 'border-[#d1d5db] hover:border-[#1c69d4] hover:bg-[#fafafa]',
          disabled && 'cursor-not-allowed opacity-60 bg-gray-50',
          className,
        )}
      >
        <input {...getInputProps()} />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center bg-[#10b981]/10 text-[#059669]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-ink">{selectedFile.name}</span>
              <span className="text-ink-mute ml-2 font-mono">
                ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>
            <p className="text-[11px] text-ink-mute">Click or drop another file to replace</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="mt-1 h-7 text-xs text-[#dc2626] hover:bg-[#dc2626]/10"
            >
              <X className="h-3.5 w-3.5 mr-1" /> Remove
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center bg-[#1c69d4]/10 text-[#1c69d4]">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">
                {isDragActive ? 'Drop file here to upload' : 'Click to browse or drag and drop file'}
              </p>
              <p className="text-[11px] text-ink-mute mt-0.5">
                {hintText || `Max size ${effectiveMaxMb} MB • Dynamic server storage validation`}
              </p>
            </div>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-center gap-1.5 p-2 text-xs border border-[#dc2626]/20 bg-[#dc2626]/5 text-[#dc2626]">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
