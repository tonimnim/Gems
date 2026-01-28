'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';
import { PRICING, ROUTES } from '@/constants';
import { createClient } from '@/lib/supabase/client';
import type { Gem } from '@/types';

type PlanType = 'standard' | 'featured';
type TermType = 'term' | 'year';
type PaymentStatus = 'idle' | 'processing' | 'waiting' | 'success' | 'failed';

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const gemId = params.id as string;
  const { user } = useAuth();

  const [gem, setGem] = useState<Gem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPlan, setSelectedPlan] = useState<PlanType>('standard');
  const [selectedTerm, setSelectedTerm] = useState<TermType>('term');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchGem = async () => {
      try {
        const supabase = createClient();
        const { data, error: gemError } = await supabase
          .from('gems')
          .select('*')
          .eq('id', gemId)
          .single();

        if (gemError || !data) {
          setError('Gem not found');
          return;
        }

        if (data.owner_id !== user?.id) {
          setError('You do not have permission to pay for this gem');
          return;
        }

        if (data.status !== 'approved') {
          setError('This gem has not been approved yet');
          return;
        }

        if (data.current_term_end && new Date(data.current_term_end) > new Date()) {
          setError('This gem already has an active subscription');
          return;
        }

        setGem(data);
        setSelectedPlan(data.tier || 'standard');
      } catch (err) {
        console.error('Error fetching gem:', err);
        setError('Failed to load gem data');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id && gemId) {
      fetchGem();
    }
  }, [gemId, user?.id]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const getPrice = () => {
    const pricing = selectedPlan === 'featured' ? PRICING.featured : PRICING.standard;
    return selectedTerm === 'year' ? pricing.per_year : pricing.per_term;
  };

  const getTermMonths = () => {
    return selectedTerm === 'year' ? 12 : PRICING.term_months;
  };

  const checkPaymentStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/payments/${id}/status`);
      const result = await response.json();

      if (result.status === 'completed') {
        setPaymentStatus('success');
        if (pollingRef.current) clearInterval(pollingRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
        // Redirect after 2 seconds
        setTimeout(() => router.push(ROUTES.dashboard), 2000);
      } else if (result.status === 'failed') {
        setPaymentStatus('failed');
        if (pollingRef.current) clearInterval(pollingRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    }
  };

  const handlePayment = async () => {
    if (!phoneNumber) {
      setError('Please enter your M-Pesa phone number');
      return;
    }

    const cleanPhone = phoneNumber.replace(/\s/g, '');
    if (!/^(?:\+?254|0)?[17]\d{8}$/.test(cleanPhone)) {
      setError('Please enter a valid Kenyan phone number');
      return;
    }

    setPaymentStatus('processing');
    setError(null);

    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gemId,
          tier: selectedPlan,
          type: 'new_listing',
          phoneNumber: cleanPhone,
          termMonths: getTermMonths(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Payment initiation failed');
      }

      setPaymentId(result.paymentId);
      setPaymentStatus('waiting');
      setCountdown(60);

      // Start polling every 3 seconds
      pollingRef.current = setInterval(() => {
        checkPaymentStatus(result.paymentId);
      }, 3000);

      // Start countdown
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Timeout - stop polling
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
            setPaymentStatus('failed');
            setError('Payment timed out. Please try again.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
      setPaymentStatus('idle');
    }
  };

  const handleRetry = () => {
    setPaymentStatus('idle');
    setPaymentId(null);
    setError(null);
    setCountdown(60);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-[#00AA6C]" />
      </div>
    );
  }

  if (error && !gem) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Link href={ROUTES.dashboard} className="text-[#00AA6C] hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Waiting for M-Pesa confirmation
  if (paymentStatus === 'waiting') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 border-4 border-[#00AA6C] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Waiting for payment
        </h1>
        <p className="text-gray-500 mb-1">
          Enter your M-Pesa PIN on your phone
        </p>
        <p className="text-sm text-gray-400 mb-8">
          {countdown}s remaining
        </p>
        <Button variant="outline" onClick={handleRetry}>
          Cancel
        </Button>
      </div>
    );
  }

  // Payment successful
  if (paymentStatus === 'success') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 bg-[#00AA6C] rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Payment successful
        </h1>
        <p className="text-gray-500 mb-8">
          Your gem is now live!
        </p>
        <p className="text-sm text-gray-400">Redirecting to dashboard...</p>
      </div>
    );
  }

  // Payment failed
  if (paymentStatus === 'failed') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Payment failed
        </h1>
        <p className="text-gray-500 mb-8">
          {error || 'The payment was not completed. Please try again.'}
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => router.push(ROUTES.dashboard)}>
            Back to Dashboard
          </Button>
          <Button onClick={handleRetry} className="bg-[#00AA6C] hover:bg-[#008855]">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={ROUTES.dashboard}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Activate listing</h1>
        <p className="text-gray-500 mt-1">{gem?.name}</p>
      </div>

      {/* Plan */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-gray-900 mb-3">Plan</h2>
        <div className="flex gap-3">
          <label className={`flex-1 p-3 rounded-lg border cursor-pointer text-center transition-colors ${
            selectedPlan === 'standard' ? 'border-[#00AA6C] bg-[#00AA6C]/5' : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              name="plan"
              checked={selectedPlan === 'standard'}
              onChange={() => setSelectedPlan('standard')}
              className="sr-only"
            />
            <p className="font-medium text-gray-900">Standard</p>
            <p className="text-sm text-gray-500 mt-0.5">
              KES {PRICING.standard.per_term}
            </p>
          </label>

          <label className={`flex-1 p-3 rounded-lg border cursor-pointer text-center transition-colors relative ${
            selectedPlan === 'featured' ? 'border-[#00AA6C] bg-[#00AA6C]/5' : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              name="plan"
              checked={selectedPlan === 'featured'}
              onChange={() => setSelectedPlan('featured')}
              className="sr-only"
            />
            <span className="absolute -top-2 right-2 text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded font-medium">
              Popular
            </span>
            <p className="font-medium text-gray-900">Featured</p>
            <p className="text-sm text-gray-500 mt-0.5">
              KES {PRICING.featured.per_term}
            </p>
          </label>
        </div>
      </div>

      <div className="border-t border-gray-100 my-6" />

      {/* Duration */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-gray-900 mb-3">Duration</h2>
        <div className="flex gap-3">
          <label className={`flex-1 p-3 rounded-lg border cursor-pointer text-center transition-colors ${
            selectedTerm === 'term' ? 'border-[#00AA6C] bg-[#00AA6C]/5' : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              name="term"
              checked={selectedTerm === 'term'}
              onChange={() => setSelectedTerm('term')}
              className="sr-only"
            />
            <p className="font-medium text-gray-900">6 months</p>
            <p className="text-sm text-gray-500 mt-0.5">
              KES {selectedPlan === 'featured' ? PRICING.featured.per_term : PRICING.standard.per_term}
            </p>
          </label>

          <label className={`flex-1 p-3 rounded-lg border cursor-pointer text-center transition-colors relative ${
            selectedTerm === 'year' ? 'border-[#00AA6C] bg-[#00AA6C]/5' : 'border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              name="term"
              checked={selectedTerm === 'year'}
              onChange={() => setSelectedTerm('year')}
              className="sr-only"
            />
            <span className="absolute -top-2 right-2 text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded font-medium">
              Save 17%
            </span>
            <p className="font-medium text-gray-900">1 year</p>
            <p className="text-sm text-gray-500 mt-0.5">
              KES {selectedPlan === 'featured' ? PRICING.featured.per_year : PRICING.standard.per_year}
            </p>
          </label>
        </div>
      </div>

      <div className="border-t border-gray-100 my-6" />

      {/* Phone Number */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-gray-900 mb-3">M-Pesa number</h2>
        <Input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="0712 345 678"
          className="h-11"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 mb-4">{error}</p>
      )}

      {/* Total & Pay */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600">Total</span>
          <span className="text-2xl font-semibold text-gray-900">
            KES {getPrice().toLocaleString()}
          </span>
        </div>

        <Button
          onClick={handlePayment}
          disabled={paymentStatus === 'processing' || !phoneNumber}
          className="w-full bg-[#00AA6C] hover:bg-[#008855] h-11"
        >
          {paymentStatus === 'processing' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            `Pay KES ${getPrice().toLocaleString()}`
          )}
        </Button>

        <p className="text-xs text-gray-400 text-center mt-4">
          Secure payment via Safaricom M-Pesa
        </p>
      </div>
    </div>
  );
}
