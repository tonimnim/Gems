'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, GripVertical, Check } from 'lucide-react';
import { useImageUpload } from './cloudinary-image';
import { cn } from '@/lib/utils';

interface UploadedImage {
  id: string;
  publicId: string;
  url: string;
  isCover: boolean;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  folder?: string;
  className?: string;
}

export function ImageUploader({
  images,
  onChange,
  maxImages = 5,
  folder = 'gems',
  className,
}: ImageUploaderProps) {
  const { upload, error } = useImageUpload();
  const [dragOver, setDragOver] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [recentlyUploaded, setRecentlyUploaded] = useState<Set<string>>(new Set());
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const remainingSlots = maxImages - images.length;
      const filesToUpload = Array.from(files).slice(0, remainingSlots);

      if (filesToUpload.length === 0) return;

      setUploadingCount(filesToUpload.length);

      const uploadPromises = filesToUpload.map(async (file) => {
        const result = await upload(file, folder);
        if (result) {
          return {
            id: result.publicId,
            publicId: result.publicId,
            url: result.url,
            isCover: images.length === 0, // First image is cover by default
          };
        }
        return null;
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(Boolean) as UploadedImage[];

      if (successfulUploads.length > 0) {
        // If no images existed, set first as cover
        const newImages = [...images];
        successfulUploads.forEach((img, idx) => {
          img.isCover = newImages.length === 0 && idx === 0;
          newImages.push(img);
        });
        onChange(newImages);

        // Show success feedback
        const newUploadedIds = new Set(successfulUploads.map((img) => img.id));
        setRecentlyUploaded(newUploadedIds);
        setTimeout(() => setRecentlyUploaded(new Set()), 2000);
      }

      setUploadingCount(0);
    },
    [images, maxImages, folder, upload, onChange]
  );

  // Drag to reorder handlers
  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragEnter = useCallback((index: number) => {
    setDragOverIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newImages = [...images];
      const [draggedImage] = newImages.splice(draggedIndex, 1);
      newImages.splice(dragOverIndex, 0, draggedImage);

      // Update cover status - first image is always cover
      newImages.forEach((img, idx) => {
        img.isCover = idx === 0;
      });

      onChange(newImages);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, dragOverIndex, images, onChange]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const removeImage = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index);
      // If removed image was cover and there are other images, set first as cover
      if (images[index].isCover && newImages.length > 0) {
        newImages[0].isCover = true;
      }
      onChange(newImages);
    },
    [images, onChange]
  );

  const canUploadMore = images.length < maxImages;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      {canUploadMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
            dragOver
              ? 'border-[#00AA6C] bg-[#00AA6C]/5'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          {uploadingCount > 0 ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-10 w-10 text-[#00AA6C] animate-spin" />
              <p className="text-sm text-gray-600">
                Uploading {uploadingCount} image{uploadingCount > 1 ? 's' : ''}...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Upload className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Drop images here or click to upload
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPEG, PNG, WebP or GIF (max 10MB each)
                </p>
              </div>
              <p className="text-xs text-gray-400">
                {images.length} / {maxImages} images
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={cn(
                'relative aspect-square rounded-lg overflow-hidden border-2 group cursor-grab active:cursor-grabbing transition-all',
                image.isCover ? 'border-[#00AA6C]' : 'border-gray-200',
                draggedIndex === index && 'opacity-50 scale-95',
                dragOverIndex === index && draggedIndex !== index && 'border-[#00AA6C] border-dashed',
                recentlyUploaded.has(image.id) && 'ring-2 ring-[#00AA6C] ring-offset-2'
              )}
            >
              <Image
                src={image.url}
                alt={`Upload ${index + 1}`}
                fill
                className="object-cover pointer-events-none"
                unoptimized
              />

              {/* Success checkmark for recently uploaded */}
              {recentlyUploaded.has(image.id) && (
                <div className="absolute inset-0 bg-[#00AA6C]/20 flex items-center justify-center">
                  <div className="p-2 bg-[#00AA6C] rounded-full">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                </div>
              )}

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => removeImage(index)}
                  className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Cover badge */}
              {image.isCover && (
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#00AA6C] text-white text-xs font-medium rounded">
                  Cover
                </div>
              )}

              {/* Drag handle indicator */}
              <div className="absolute top-2 right-2 p-1 bg-white/90 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-4 w-4 text-gray-500" />
              </div>

              {/* Position indicator */}
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">{index + 1}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hint text */}
      {images.length > 1 && (
        <p className="text-xs text-gray-500 text-center">
          Drag images to reorder. First image is the cover.
        </p>
      )}
    </div>
  );
}

export default ImageUploader;
