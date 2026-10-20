import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomOut, RotateCw, Check, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { FileDropzone } from './file-dropzone';
import { getCroppedImg, PixelCrop } from '../../lib/crop-image-utils';

export interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void | Promise<void>;
  title?: string;
  aspectRatio?: number;
  cropShape?: 'rect' | 'round';
  initialImageSrc?: string | null;
  isLoading?: boolean;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  onClose,
  onCropComplete,
  title = 'Crop Profile Photo',
  aspectRatio = 1,
  cropShape = 'round',
  initialImageSrc = null,
  isLoading = false,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(initialImageSrc);
  const [originalFileName, setOriginalFileName] = useState<string>('avatar.jpg');
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);

  const onCropChange = (newCrop: { x: number; y: number }) => {
    setCrop(newCrop);
  };

  const onZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  const handleCropComplete = useCallback(
    (_croppedArea: any, pixelCrop: PixelCrop) => {
      setCroppedAreaPixels(pixelCrop);
    },
    [],
  );

  const handleFileAccepted = (file: File) => {
    setOriginalFileName(file.name);
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageSrc(reader.result as string);
    });
    reader.readAsDataURL(file);
  };

  const handleApplyCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, originalFileName);
      await onCropComplete(croppedFile);
      onClose();
    } catch (err) {
      console.error('Failed to crop image', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-white border border-[#e6e6e6] shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#e6e6e6]">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-[#1c69d4]" />
            <h3 className="text-sm font-bold text-ink">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-mute hover:text-ink transition-colors cursor-pointer p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {!imageSrc ? (
            <div className="py-4">
              <FileDropzone
                onFileAccepted={handleFileAccepted}
                accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
                hintText="Select or drop a JPEG, PNG, or WebP photo to crop"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cropper Container */}
              <div className="relative h-64 w-full bg-[#1a2129] overflow-hidden">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={aspectRatio}
                  cropShape={cropShape}
                  showGrid={true}
                  onCropChange={onCropChange}
                  onCropComplete={handleCropComplete}
                  onZoomChange={onZoomChange}
                />
              </div>

              {/* Controls */}
              <div className="space-y-3 bg-[#fafafa] p-3 border border-[#e6e6e6]">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-ink flex items-center gap-1">
                    <ZoomOut className="h-3.5 w-3.5 text-ink-mute" /> Zoom
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.05}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-48 cursor-pointer accent-[#1c69d4]"
                  />
                  <span className="font-mono text-ink-mute text-[11px] w-8 text-right">
                    {zoom.toFixed(1)}x
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#e6e6e6]">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setImageSrc(null)}
                    className="text-xs h-7 text-ink-mute hover:text-ink"
                  >
                    Choose Different Image
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    className="text-xs h-7"
                  >
                    <RotateCw className="h-3 w-3 mr-1" /> Rotate
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 p-3 bg-[#f7f7f7] border-t border-[#e6e6e6]">
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

          {imageSrc && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleApplyCrop}
              isLoading={isLoading}
              className="text-xs font-bold"
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              Apply & Save Photo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
