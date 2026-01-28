'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Building2, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';
import { createClient } from '@/lib/supabase/client';

interface BecomeOwnerModalProps {
  open: boolean;
  onClose: () => void;
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

export function BecomeOwnerModal({ open, onClose }: BecomeOwnerModalProps) {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState<'info' | 'form' | 'success'>('info');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!country) {
      setError('Please select your country');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Update user profile to owner role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'owner',
          country: country,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (updateError) {
        throw updateError;
      }

      // Refresh user data in context
      await refreshUser?.();

      setStep('success');
    } catch (err) {
      console.error('Error upgrading to owner:', err);
      setError('Failed to upgrade account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    onClose();
    router.push('/dashboard');
  };

  const handleClose = () => {
    setStep('info');
    setCountry('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Info Step */}
        {step === 'info' && (
          <div className="p-6">
            <div className="w-16 h-16 bg-[#00AA6C]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Building2 className="h-8 w-8 text-[#00AA6C]" />
            </div>

            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Become a Gem Owner
            </h2>
            <p className="text-gray-600 text-center mb-6">
              List your business, attraction, or hidden gem and reach thousands of travelers across Africa.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-[#00AA6C] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Reach More Customers</p>
                  <p className="text-sm text-gray-500">Get discovered by travelers looking for unique experiences</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-[#00AA6C] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Easy Management</p>
                  <p className="text-sm text-gray-500">Update your listing, respond to reviews, and track views</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-[#00AA6C] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Affordable Pricing</p>
                  <p className="text-sm text-gray-500">Simple 6-month terms with optional featured listings</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setStep('form')}
              className="w-full bg-[#00AA6C] hover:bg-[#008855]"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Form Step */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Complete Your Profile
            </h2>
            <p className="text-gray-600 mb-6">
              Tell us where your gem is located.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00AA6C] focus:border-transparent"
                  required
                >
                  <option value="">Select your country</option>
                  {AFRICAN_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('info')}
                className="flex-1"
                disabled={loading}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#00AA6C] hover:bg-[#008855]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Upgrading...
                  </>
                ) : (
                  'Become an Owner'
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome, Owner!
            </h2>
            <p className="text-gray-600 mb-6">
              Your account has been upgraded. You can now list your gems and start reaching customers.
            </p>

            <Button
              onClick={handleGoToDashboard}
              className="w-full bg-[#00AA6C] hover:bg-[#008855]"
            >
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
