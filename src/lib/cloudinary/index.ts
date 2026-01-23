// Cloudinary configuration and utilities

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: 'image' | 'video';
  format: string;
  width: number;
  height: number;
  bytes: number;
}

export interface UploadOptions {
  folder?: string;
  transformation?: string;
  maxFileSize?: number; // in bytes
  allowedFormats?: string[];
}

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const DEFAULT_OPTIONS: UploadOptions = {
  folder: 'hidden-gems',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov', 'webm'],
};

export async function uploadToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  // Validate file size
  if (file.size > mergedOptions.maxFileSize!) {
    throw new Error(
      `File size exceeds ${mergedOptions.maxFileSize! / (1024 * 1024)}MB limit`
    );
  }

  // Validate file format
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (
    fileExtension &&
    !mergedOptions.allowedFormats!.includes(fileExtension)
  ) {
    throw new Error(`File format .${fileExtension} is not allowed`);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET!);
  formData.append('folder', mergedOptions.folder!);

  if (mergedOptions.transformation) {
    formData.append('transformation', mergedOptions.transformation);
  }

  const resourceType = file.type.startsWith('video/') ? 'video' : 'image';

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to upload file');
  }

  const result = await response.json();

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
    resource_type: result.resource_type,
    format: result.format,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
  };
}

export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
): string {
  const { width, height, quality = 80, format = 'auto' } = options;

  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);
  transformations.push('c_fill');

  const transformation = transformations.join(',');

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformation}/${publicId}`;
}

export function getVideoThumbnailUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
  } = {}
): string {
  const { width = 400, height = 300 } = options;

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/w_${width},h_${height},c_fill,so_0/${publicId}.jpg`;
}
