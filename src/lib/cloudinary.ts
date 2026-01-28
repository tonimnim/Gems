/**
 * Cloudinary Configuration and Utilities
 *
 * Setup:
 * 1. Create a Cloudinary account at https://cloudinary.com
 * 2. Get your credentials from Dashboard > Settings > Access Keys
 * 3. Add to .env.local:
 *    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
 *    CLOUDINARY_API_KEY=your_api_key
 *    CLOUDINARY_API_SECRET=your_api_secret
 *    CLOUDINARY_UPLOAD_PRESET=gems_uploads (create unsigned preset in Settings > Upload)
 */

// Cloud name for client-side operations
export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
export const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'gems_uploads';

// Cloudinary base URL
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}`;

/**
 * Image transformation options
 */
export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'crop';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  blur?: number;
}

/**
 * Generate a Cloudinary URL with transformations
 * @param publicId - The public ID of the image in Cloudinary
 * @param options - Transformation options
 * @returns Optimized Cloudinary URL
 */
export function getCloudinaryUrl(
  publicId: string,
  options: CloudinaryTransformOptions = {}
): string {
  const {
    width,
    height,
    crop = 'fill',
    gravity = 'auto',
    quality = 'auto',
    format = 'auto',
    blur,
  } = options;

  // Build transformation string
  const transforms: string[] = [];

  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) {
    transforms.push(`c_${crop}`);
    transforms.push(`g_${gravity}`);
  }
  transforms.push(`q_${quality}`);
  transforms.push(`f_${format}`);
  if (blur) transforms.push(`e_blur:${blur}`);

  const transformString = transforms.join(',');

  return `${CLOUDINARY_BASE_URL}/image/upload/${transformString}/${publicId}`;
}

/**
 * Generate responsive image srcset for Cloudinary images
 */
export function getCloudinarySrcSet(
  publicId: string,
  widths: number[] = [400, 800, 1200, 1600],
  options: Omit<CloudinaryTransformOptions, 'width'> = {}
): string {
  return widths
    .map((width) => {
      const url = getCloudinaryUrl(publicId, { ...options, width });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Common image size presets
 */
export const IMAGE_PRESETS = {
  thumbnail: { width: 150, height: 150, crop: 'thumb' as const },
  card: { width: 400, height: 300, crop: 'fill' as const },
  cardLarge: { width: 800, height: 600, crop: 'fill' as const },
  hero: { width: 1200, height: 600, crop: 'fill' as const },
  gallery: { width: 1200, height: 800, crop: 'fill' as const },
  avatar: { width: 100, height: 100, crop: 'thumb' as const, gravity: 'face' as const },
  cover: { width: 1600, height: 900, crop: 'fill' as const },
};

/**
 * Get optimized URL for a preset
 */
export function getPresetUrl(publicId: string, preset: keyof typeof IMAGE_PRESETS): string {
  return getCloudinaryUrl(publicId, IMAGE_PRESETS[preset]);
}

/**
 * Extract public ID from a full Cloudinary URL
 */
export function extractPublicId(cloudinaryUrl: string): string | null {
  const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/i;
  const match = cloudinaryUrl.match(regex);
  return match ? match[1] : null;
}

/**
 * Check if a URL is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com') || url.includes('cloudinary.com');
}

/**
 * Get blur placeholder URL (tiny, blurred version for loading)
 */
export function getBlurPlaceholder(publicId: string): string {
  return getCloudinaryUrl(publicId, {
    width: 20,
    quality: 30,
    blur: 1000,
    format: 'webp',
  });
}
