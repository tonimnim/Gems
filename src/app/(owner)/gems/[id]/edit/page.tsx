'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPicker } from '@/components/ui/map-picker';
import { ImageUploader } from '@/components/ui/image-uploader';
import { useAuth } from '@/context/auth-context';
import { GEM_CATEGORIES, ROUTES } from '@/constants';
import { createClient } from '@/lib/supabase/client';
import type { GemCategory } from '@/types';

interface UploadedImage {
  id: string;
  publicId: string;
  url: string;
  isCover: boolean;
}

const AFRICAN_COUNTRIES = [
  { code: 'DZ', name: 'Algeria' },
  { code: 'AO', name: 'Angola' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' },
  { code: 'CV', name: 'Cabo Verde' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' },
  { code: 'KM', name: 'Comoros' },
  { code: 'CG', name: 'Congo' },
  { code: 'CD', name: 'Congo (DRC)' },
  { code: 'CI', name: "Côte d'Ivoire" },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'EG', name: 'Egypt' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'SZ', name: 'Eswatini' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'KE', name: 'Kenya' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'LR', name: 'Liberia' },
  { code: 'LY', name: 'Libya' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MW', name: 'Malawi' },
  { code: 'ML', name: 'Mali' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'NA', name: 'Namibia' },
  { code: 'NE', name: 'Niger' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'ST', name: 'São Tomé and Príncipe' },
  { code: 'SN', name: 'Senegal' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SO', name: 'Somalia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'SD', name: 'Sudan' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'TG', name: 'Togo' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'UG', name: 'Uganda' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' },
];

interface FormData {
  name: string;
  description: string;
  categories: GemCategory[];
  country: string;
  city: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  email: string;
  website: string;
}

export default function EditGemPage() {
  const router = useRouter();
  const params = useParams();
  const gemId = params.id as string;
  const { user, isLoading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    categories: [],
    country: '',
    city: '',
    address: '',
    latitude: null,
    longitude: null,
    phone: '',
    email: '',
    website: '',
  });

  // Fetch existing gem data
  useEffect(() => {
    const fetchGem = async () => {
      try {
        const supabase = createClient();

        const { data: gem, error: gemError } = await supabase
          .from('gems')
          .select(`
            *,
            media:gem_media(id, url, is_cover, type, sort_order)
          `)
          .eq('id', gemId)
          .single();

        if (gemError) {
          console.error('Error fetching gem:', gemError);
          setError(`Failed to load gem: ${gemError.message}`);
          return;
        }

        if (!gem) {
          setError('Gem not found');
          return;
        }

        // Check ownership
        if (gem.owner_id !== user?.id) {
          console.error('Ownership mismatch:', { gemOwnerId: gem.owner_id, userId: user?.id });
          setError('You do not have permission to edit this gem');
          return;
        }

        setFormData({
          name: gem.name || '',
          description: gem.description || '',
          categories: gem.categories || (gem.category ? [gem.category] : []),
          country: gem.country || '',
          city: gem.city || '',
          address: gem.address || '',
          latitude: gem.latitude || null,
          longitude: gem.longitude || null,
          phone: gem.phone || '',
          email: gem.email || '',
          website: gem.website || '',
        });

        // Convert existing media to UploadedImage format, sorted by sort_order
        console.log('Gem media from DB:', gem.media);
        const sortedMedia = [...(gem.media || [])].sort(
          (a: { sort_order?: number }, b: { sort_order?: number }) =>
            (a.sort_order ?? 0) - (b.sort_order ?? 0)
        );
        const existingMedia = sortedMedia.map((m: { id: string; url: string; is_cover?: boolean }, idx: number) => ({
          id: m.id,
          publicId: m.id,
          url: m.url,
          isCover: m.is_cover ?? idx === 0,
        }));
        console.log('Converted media:', existingMedia);
        setImages(existingMedia);
      } catch (err) {
        console.error('Error fetching gem:', err);
        setError('Failed to load gem data');
      } finally {
        setIsLoading(false);
      }
    };

    // Wait for auth to finish loading before fetching
    if (authLoading) return;

    if (user?.id && gemId) {
      fetchGem();
    } else if (!authLoading && !user) {
      setError('Please log in to edit this gem');
      setIsLoading(false);
    }
  }, [gemId, user?.id, authLoading]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (lat: number, lng: number, address?: string) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: address || prev.address,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name || !formData.description || formData.categories.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.categories.length > 3) {
      setError('Maximum 3 categories allowed');
      return;
    }

    if (!formData.country || !formData.city) {
      setError('Please select a country and enter a city');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      setError('Please select a location on the map');
      return;
    }

    if (images.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Update the gem
      const { error: updateError } = await supabase
        .from('gems')
        .update({
          name: formData.name,
          slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          description: formData.description,
          category: formData.categories[0], // Primary category
          categories: formData.categories,
          country: formData.country,
          city: formData.city,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
          phone: formData.phone || null,
          email: formData.email || null,
          website: formData.website || null,
          status: 'pending', // Reset to pending for re-review
        })
        .eq('id', gemId);

      if (updateError) throw updateError;

      // Delete existing media records and re-insert with new order
      await supabase.from('gem_media').delete().eq('gem_id', gemId);

      // Insert all media records with correct order
      if (images.length > 0) {
        const mediaInserts = images.map((img, index) => ({
          gem_id: gemId,
          url: img.url,
          type: 'image',
          is_cover: img.isCover,
          sort_order: index,
        }));

        await supabase.from('gem_media').insert(mediaInserts);
      }

      // Clear dashboard cache to force refresh
      if (typeof window !== 'undefined') {
        (window as unknown as { dashboardCache?: null }).dashboardCache = null;
      }

      router.push(ROUTES.dashboard);
    } catch (err) {
      console.error('Error updating gem:', err);
      setError('Failed to update gem. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#00AA6C]" />
      </div>
    );
  }

  if (error && !formData.name) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
        <Link href={ROUTES.dashboard} className="mt-4 inline-block">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href={ROUTES.dashboard}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#092327]">Edit Gem</h1>
          <p className="text-gray-500">Update your gem information</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-[#092327]">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gem Name *
            </label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., The Secret Garden Restaurant"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categories *
            </label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Object.entries(GEM_CATEGORIES).map(([key, cat]) => {
                const isSelected = formData.categories.includes(key as GemCategory);
                const isDisabled = !isSelected && formData.categories.length >= 3;
                return (
                  <label
                    key={key}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-[#00AA6C] bg-[#00AA6C]/5'
                        : isDisabled
                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData((prev) => ({
                            ...prev,
                            categories: [...prev.categories, key as GemCategory],
                          }));
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            categories: prev.categories.filter((c) => c !== key),
                          }));
                        }
                      }}
                      className="h-4 w-4 text-[#00AA6C] border-gray-300 rounded focus:ring-[#00AA6C]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{cat.label}</p>
                      <p className="text-xs text-gray-500 truncate">{cat.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            {formData.categories.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {formData.categories.length}/3 selected
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="What makes this place special? Describe the experience..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00AA6C] focus:border-transparent resize-none"
              required
            />
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-[#092327]">Location</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00AA6C] focus:border-transparent"
                required
              >
                <option value="">Select country</option>
                {AFRICAN_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <Input
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="e.g., Nairobi"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pin Location on Map *
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Search for an address or click on the map to set the exact location
            </p>
            <MapPicker
              latitude={formData.latitude || undefined}
              longitude={formData.longitude || undefined}
              onLocationChange={handleLocationChange}
            />
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-[#092327]">Photos *</h2>
          <ImageUploader
            images={images}
            onChange={setImages}
            maxImages={7}
            folder="gems"
          />
        </div>

        {/* Contact Info (Optional) */}
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-[#092327]">Contact Information (Optional)</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+254 700 000 000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="contact@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <Input
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://example.com"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-[#00AA6C] hover:bg-[#008855]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>

        <p className="text-center text-sm text-gray-500">
          Changes will be reviewed by our team before being published.
        </p>
      </form>
    </div>
  );
}
