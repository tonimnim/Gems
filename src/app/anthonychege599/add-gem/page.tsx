'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Plus, Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPicker } from '@/components/ui/map-picker';
import { ImageUploader } from '@/components/ui/image-uploader';
import { GEM_CATEGORIES } from '@/constants';
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

const PRICE_RANGES = [
  { value: '$', label: '$ - Budget Friendly' },
  { value: '$$', label: '$$ - Moderate' },
  { value: '$$$', label: '$$$ - Upscale' },
  { value: '$$$$', label: '$$$$ - Luxury' },
];

interface FormData {
  // Owner Details (Simulated)
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  // Business Details
  name: string;
  description: string;
  categories: GemCategory[];
  // Location
  country: string;
  city: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  // Contact & Social
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  instagram: string;
  facebook: string;
  twitter: string;
  // Operations
  openingHours: string;
  priceRange: string;
  // Admin Controls
  isVerified: boolean;
  isFeatured: boolean;
}

export default function AddGemPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [gemsAdded, setGemsAdded] = useState(0);

  const [formData, setFormData] = useState<FormData>({
    // Owner Details
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    // Business Details
    name: '',
    description: '',
    categories: [],
    // Location
    country: 'KE',
    city: '',
    address: '',
    latitude: null,
    longitude: null,
    // Contact & Social
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    instagram: '',
    facebook: '',
    twitter: '',
    // Operations
    openingHours: '',
    priceRange: '',
    // Admin Controls
    isVerified: true,
    isFeatured: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLocationChange = (lat: number, lng: number, address?: string) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: address || prev.address,
    }));
  };

  const generateSlug = (name: string) => {
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const timestamp = Date.now().toString(36);
    return `${baseSlug}-${timestamp}`;
  };

  const resetForm = () => {
    setFormData({
      ownerName: '',
      ownerPhone: '',
      ownerEmail: '',
      name: '',
      description: '',
      categories: [],
      country: formData.country, // Keep country for batch adding
      city: formData.city, // Keep city for batch adding
      address: '',
      latitude: null,
      longitude: null,
      phone: '',
      whatsapp: '',
      email: '',
      website: '',
      instagram: '',
      facebook: '',
      twitter: '',
      openingHours: '',
      priceRange: '',
      isVerified: true,
      isFeatured: false,
    });
    setImages([]);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.ownerName) {
      setError('Please enter the owner name');
      return;
    }

    if (!formData.name || !formData.description || formData.categories.length === 0) {
      setError('Please fill in all required business fields');
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

      // Get admin user ID to use as owner_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Build description with owner info embedded
      const fullDescription = `${formData.description}

---
Owner: ${formData.ownerName}${formData.ownerPhone ? ` | Phone: ${formData.ownerPhone}` : ''}${formData.ownerEmail ? ` | Email: ${formData.ownerEmail}` : ''}`;

      // Create the gem
      const { data: gem, error: gemError } = await supabase
        .from('gems')
        .insert({
          owner_id: user.id,
          name: formData.name,
          slug: generateSlug(formData.name),
          description: fullDescription,
          category: formData.categories[0],
          categories: formData.categories,
          country: formData.country,
          city: formData.city,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
          phone: formData.phone || formData.whatsapp || null,
          email: formData.email || null,
          website: formData.website || null,
          opening_hours: formData.openingHours || null,
          price_range: formData.priceRange || null,
          status: formData.isVerified ? 'approved' : 'pending',
          tier: formData.isFeatured ? 'featured' : 'standard',
        })
        .select()
        .single();

      if (gemError) throw gemError;

      // Add media records
      if (images.length > 0) {
        const mediaInserts = images.map((img, index) => ({
          gem_id: gem.id,
          url: img.url,
          type: 'image',
          is_cover: index === 0,
        }));

        await supabase.from('gem_media').insert(mediaInserts);
      }

      setGemsAdded((prev) => prev + 1);
      setSuccess(`Gem "${formData.name}" added successfully! (Total: ${gemsAdded + 1})`);
      resetForm();

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error creating gem:', err);
      setError('Failed to create gem. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/anthonychege599/gems">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#092327]">Add Gem (Admin Seeding)</h1>
            <p className="text-gray-500">Add gems on behalf of business owners</p>
          </div>
        </div>
        {gemsAdded > 0 && (
          <div className="bg-[#00AA6C]/10 text-[#00AA6C] px-4 py-2 rounded-lg font-medium">
            {gemsAdded} gems added
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
            <Check className="h-5 w-5" />
            {success}
          </div>
        )}

        {/* Admin Controls - Top for visibility */}
        <div className="bg-[#092327] rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-white">Admin Controls</h2>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isVerified"
                checked={formData.isVerified}
                onChange={handleInputChange}
                className="h-5 w-5 text-[#00AA6C] border-gray-300 rounded focus:ring-[#00AA6C]"
              />
              <div>
                <p className="text-white font-medium">Verified</p>
                <p className="text-white/60 text-sm">Gem goes live immediately</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
                className="h-5 w-5 text-[#00AA6C] border-gray-300 rounded focus:ring-[#00AA6C]"
              />
              <div>
                <p className="text-white font-medium">Featured</p>
                <p className="text-white/60 text-sm">Highlight in search results</p>
              </div>
            </label>
          </div>
        </div>

        {/* Owner Details (Simulated) */}
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-[#092327]">Owner Details (Simulated)</h2>
          <p className="text-sm text-gray-500">Enter the business owner&apos;s information as it should appear</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner Name *
              </label>
              <Input
                name="ownerName"
                value={formData.ownerName}
                onChange={handleInputChange}
                placeholder="e.g., John Kamau"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner Phone
              </label>
              <Input
                name="ownerPhone"
                value={formData.ownerPhone}
                onChange={handleInputChange}
                placeholder="+254 700 000 000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner Email
              </label>
              <Input
                name="ownerEmail"
                type="email"
                value={formData.ownerEmail}
                onChange={handleInputChange}
                placeholder="owner@example.com"
              />
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-[#092327]">Business Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name *
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
              Categories * (Select up to 3)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
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
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="What makes this place special? Describe the experience, atmosphere, signature offerings..."
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

        {/* Photos */}
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-[#092327]">Photos *</h2>
          <p className="text-sm text-gray-500">Upload real photos of the business. First image will be the cover.</p>
          <ImageUploader
            images={images}
            onChange={setImages}
            maxImages={10}
            folder="gems"
          />
        </div>

        {/* Contact & Social */}
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-[#092327]">Contact & Social Media</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Phone
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
                WhatsApp
              </label>
              <Input
                name="whatsapp"
                value={formData.whatsapp}
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
                placeholder="contact@business.com"
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

          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Social Media Links</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Instagram</label>
                <Input
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  placeholder="@username or URL"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Facebook</label>
                <Input
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleInputChange}
                  placeholder="Page name or URL"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Twitter/X</label>
                <Input
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  placeholder="@username or URL"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Operations */}
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-[#092327]">Operations</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opening Hours
              </label>
              <Input
                name="openingHours"
                value={formData.openingHours}
                onChange={handleInputChange}
                placeholder="e.g., Mon-Fri 9am-6pm, Sat 10am-4pm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range
              </label>
              <select
                name="priceRange"
                value={formData.priceRange}
                onChange={handleInputChange}
                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00AA6C] focus:border-transparent"
              >
                <option value="">Select price range</option>
                {PRICE_RANGES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={resetForm}
            disabled={isSubmitting}
          >
            Clear Form
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-[#00AA6C] hover:bg-[#008855]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding Gem...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Gem
              </>
            )}
          </Button>
        </div>

        <p className="text-center text-sm text-gray-500">
          Gem will be {formData.isVerified ? 'published immediately' : 'saved as pending'}
        </p>
      </form>
    </div>
  );
}
