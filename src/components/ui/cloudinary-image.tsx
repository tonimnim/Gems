'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import {
  getCloudinaryUrl,
  getCloudinarySrcSet,
  getBlurPlaceholder,
  isCloudinaryUrl,
  extractPublicId,
  IMAGE_PRESETS,
  type CloudinaryTransformOptions,
} from '@/lib/cloudinary';

interface CloudinaryImageProps extends Omit<ImageProps, 'src' | 'loader'> {
  /**
   * Either a Cloudinary public ID or a full URL (Cloudinary or external)
   */
  src: string;
  /**
   * Use a predefined size preset
   */
  preset?: keyof typeof IMAGE_PRESETS;
  /**
   * Custom transformation options (overrides preset)
   */
  transforms?: CloudinaryTransformOptions;
  /**
   * Enable blur placeholder while loading
   */
  enableBlur?: boolean;
  /**
   * Fallback image if the main image fails to load
   */
  fallbackSrc?: string;
}

/**
 * Optimized image component that handles Cloudinary transformations
 * Falls back to regular Next/Image for non-Cloudinary URLs
 */
export function CloudinaryImage({
  src,
  preset,
  transforms,
  enableBlur = true,
  fallbackSrc = '/images/placeholder.jpg',
  alt,
  className,
  ...props
}: CloudinaryImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Handle error state
  if (error && fallbackSrc) {
    return (
      <Image
        src={fallbackSrc}
        alt={alt}
        className={className}
        {...props}
      />
    );
  }

  // Check if it's a Cloudinary URL or public ID
  const isCloudinary = isCloudinaryUrl(src) || !src.startsWith('http');

  if (!isCloudinary) {
    // Regular external URL - use Next/Image directly
    return (
      <Image
        src={src}
        alt={alt}
        className={className}
        onError={() => setError(true)}
        unoptimized
        {...props}
      />
    );
  }

  // Extract public ID if it's a full Cloudinary URL
  const publicId = isCloudinaryUrl(src) ? extractPublicId(src) || src : src;

  // Get transformation options
  const transformOptions: CloudinaryTransformOptions = {
    ...(preset ? IMAGE_PRESETS[preset] : {}),
    ...transforms,
  };

  // Generate optimized URL
  const optimizedUrl = getCloudinaryUrl(publicId, transformOptions);

  // Generate blur placeholder if enabled
  const blurDataUrl = enableBlur ? getBlurPlaceholder(publicId) : undefined;

  return (
    <Image
      src={optimizedUrl}
      alt={alt}
      className={className}
      placeholder={enableBlur ? 'blur' : 'empty'}
      blurDataURL={blurDataUrl}
      onError={() => setError(true)}
      onLoad={() => setLoaded(true)}
      {...props}
    />
  );
}

/**
 * Image upload hook for Cloudinary
 */
export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (
    file: File,
    folder: string = 'gems'
  ): Promise<{
    publicId: string;
    url: string;
    width: number;
    height: number;
  } | null> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setProgress(100);
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (publicId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId }),
      });

      const result = await response.json();
      return result.success;
    } catch {
      return false;
    }
  };

  return {
    upload,
    deleteImage,
    uploading,
    progress,
    error,
  };
}

export default CloudinaryImage;
