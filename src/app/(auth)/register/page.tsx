'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Gem, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';
import { ROUTES, AFRICAN_COUNTRIES } from '@/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      country: 'KE',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            country: data.country,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // Check if we have a session (user is logged in)
      if (authData.session) {
        // Small delay to ensure cookies are set
        await new Promise(resolve => setTimeout(resolve, 100));
        window.location.href = ROUTES.dashboard;
      } else if (authData.user) {
        // User created but no session - likely needs email confirmation
        setError('Please check your email to confirm your account.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${ROUTES.home}`,
        },
      });

      if (authError) {
        setError(authError.message);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Back button for mobile */}
      <Link
        href="/m"
        className="absolute top-4 left-4 z-20 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors md:hidden"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>

      {/* Vertical dashed lines decoration */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Line 1 - far left */}
        <div className="absolute left-[8%] top-0 bottom-0 border-l border-dashed border-gray-200" />
        {/* Line 2 - between col1 and col2 */}
        <div className="absolute left-[25%] top-0 bottom-0 border-l border-dashed border-gray-200" />
        {/* Line 3 - center */}
        <div className="absolute left-[50%] top-0 bottom-0 border-l border-dashed border-gray-200" />
        {/* Line 4 - between col3 and col4 */}
        <div className="absolute left-[75%] top-0 bottom-0 border-l border-dashed border-gray-200" />
        {/* Line 5 - far right */}
        <div className="absolute left-[92%] top-0 bottom-0 border-l border-dashed border-gray-200" />
      </div>

      {/* Diagonal gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-72 overflow-hidden">
        <div
          className="absolute -left-10 -right-10 top-0 bottom-0 transform -skew-y-6 translate-y-24"
          style={{
            background: 'linear-gradient(90deg, #092327 0%, #11292E 25%, #00AA6C 50%, #34E0A1 75%, #00AA6C 100%)',
          }}
        />
      </div>

      {/* Main content - 4 column grid */}
      <div className="relative z-10 min-h-screen grid grid-cols-12 gap-4 px-4">
        {/* Col 1 - empty spacer */}
        <div className="hidden lg:block lg:col-span-2" />

        {/* Col 2 - Marketing content */}
        <div className="hidden lg:flex lg:col-span-4 flex-col pt-8 pb-12">
          {/* Logo - at header position */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#00AA6C] rounded-lg flex items-center justify-center">
              <Gem className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Gems</span>
          </Link>

          {/* Benefits - positioned below with top margin */}
          <div className="space-y-8 mt-32">
            <div className="flex gap-4">
              <div className="w-1 bg-[#00AA6C] rounded-full flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Get discovered by explorers</h3>
                <p className="text-gray-600 text-sm">
                  Thousands of travelers search for unique experiences across Africa every day.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-1 bg-[#00AA6C] rounded-full flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Easy listing management</h3>
                <p className="text-gray-600 text-sm">
                  Simple dashboard to manage your gems, track views, and respond to reviews.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-1 bg-[#00AA6C] rounded-full flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Build trust with verification</h3>
                <p className="text-gray-600 text-sm">
                  Get a verified badge to stand out and build credibility with potential visitors.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Col 3 - Form */}
        <div className="col-span-12 lg:col-span-4 flex items-start justify-center pt-16 lg:pt-24 pb-8">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-100 p-8">
            {/* Mobile logo */}
            <div className="lg:hidden flex justify-center mb-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#00AA6C] rounded-lg flex items-center justify-center">
                  <Gem className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900">Gems</span>
              </Link>
            </div>

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">
                Create your account
              </h1>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full name
                </label>
                <input
                  id="full_name"
                  type="text"
                  autoComplete="name"
                  className={`w-full px-3 py-2.5 rounded-lg border ${
                    errors.full_name ? 'border-red-300' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-[#00AA6C] focus:border-transparent text-gray-900 text-sm`}
                  {...register('full_name')}
                />
                {errors.full_name && (
                  <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`w-full px-3 py-2.5 rounded-lg border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-[#00AA6C] focus:border-transparent text-gray-900 text-sm`}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className={`w-full h-11 px-3 rounded-lg border ${
                        errors.country ? 'border-red-300' : 'border-gray-300'
                      } focus:ring-2 focus:ring-[#00AA6C] bg-white text-sm`}>
                        <SelectValue placeholder="Select country" />
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
                  <p className="mt-1 text-xs text-red-600">{errors.country.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`w-full px-3 py-2.5 pr-10 rounded-lg border ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-[#00AA6C] focus:border-transparent text-gray-900 text-sm`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-lg font-medium text-white bg-[#00AA6C] hover:bg-[#008f5a] focus:outline-none focus:ring-2 focus:ring-[#00AA6C] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white text-gray-500 uppercase">Or</span>
              </div>
            </div>

            {/* Google Sign Up */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isGoogleLoading ? (
                <div className="h-5 w-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              <span>Sign up with Google</span>
            </button>

            {/* Sign in link */}
            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link href={ROUTES.login} className="text-[#00AA6C] hover:text-[#008f5a] font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Col 4 - empty spacer */}
        <div className="hidden lg:block lg:col-span-2" />
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-[25%] z-20 flex items-center gap-6 text-sm text-white">
        <span>&copy; Gems</span>
        <Link href="/privacy" className="hover:text-white/80">Privacy & terms</Link>
      </div>
    </div>
  );
}
