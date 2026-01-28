'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Gem, MapPin, Phone } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AFRICAN_COUNTRIES, ROUTES } from '@/constants';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const completeProfileSchema = z.object({
  country: z.string().min(1, 'Please select your country'),
  phone: z.string().optional(),
});

type CompleteProfileInput = z.infer<typeof completeProfileSchema>;

export default function CompleteProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CompleteProfileInput>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      country: '',
      phone: '',
    },
  });

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push(ROUTES.login);
        return;
      }

      // Check if profile already complete (has country and is owner)
      const { data: profile } = await supabase
        .from('profiles')
        .select('country, role, full_name')
        .eq('id', user.id)
        .single();

      if (profile?.country && profile?.role === 'owner') {
        // Already complete, redirect to add gem
        router.push(ROUTES.newGem);
        return;
      }

      setUserName(profile?.full_name || user.email?.split('@')[0] || 'there');
      setIsCheckingAuth(false);
    }

    checkAuth();
  }, [router]);

  const onSubmit = async (data: CompleteProfileInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Session expired. Please sign in again.');
        router.push(ROUTES.login);
        return;
      }

      // Update profile with country and upgrade to owner
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          country: data.country,
          role: 'owner',
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      // Redirect to add gem page
      router.push(ROUTES.newGem);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#092327] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#092327] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#00AA6C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gem className="h-8 w-8 text-[#00AA6C]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Almost there, {userName}!
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              Tell us a bit more so you can list your hidden gem
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  Where are you based?
                </div>
              </label>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger
                      className={`w-full h-12 px-4 rounded-lg border ${
                        errors.country ? 'border-red-300' : 'border-gray-300'
                      } focus:ring-2 focus:ring-[#00AA6C] bg-white`}
                    >
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {AFRICAN_COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          <span className="flex items-center gap-2">
                            <span>{country.flag}</span>
                            <span>{country.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.country && (
                <p className="mt-1.5 text-sm text-red-600">{errors.country.message}</p>
              )}
            </div>

            {/* Phone (optional) */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  Phone number
                  <span className="text-gray-400 font-normal">(optional)</span>
                </div>
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+254 7XX XXX XXX"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00AA6C] focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
                {...register('phone')}
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-[#00AA6C] hover:bg-[#008f5a] focus:ring-2 focus:ring-[#00AA6C] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                'Continue to add your gem'
              )}
            </button>
          </form>

          {/* Skip for now */}
          <p className="mt-4 text-center text-sm text-gray-500">
            <button
              type="button"
              onClick={() => router.push(ROUTES.home)}
              className="text-[#00AA6C] hover:text-[#008f5a] font-medium"
            >
              I just want to explore for now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
