-- Payments table (billing records)
-- Designed to support multiple payment providers (M-Pesa, Paystack, etc.)

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gem_id UUID NOT NULL REFERENCES gems(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Amount and type
  amount INTEGER NOT NULL, -- Amount in smallest unit (e.g., KES cents)
  currency TEXT NOT NULL DEFAULT 'KES',
  type payment_type NOT NULL,
  status payment_status DEFAULT 'pending',

  -- Provider info
  provider TEXT NOT NULL, -- 'mpesa', 'paystack', 'card', etc.
  provider_reference TEXT, -- Receipt number / transaction ID

  -- M-Pesa specific fields (nullable for other providers)
  phone_number TEXT, -- Phone used for payment
  checkout_request_id TEXT, -- M-Pesa STK push checkout request ID
  merchant_request_id TEXT, -- M-Pesa merchant request ID
  mpesa_receipt_number TEXT, -- M-Pesa transaction receipt
  result_code INTEGER, -- M-Pesa result code (0 = success)
  result_description TEXT, -- M-Pesa result message

  -- Generic metadata for any provider-specific data
  metadata JSONB DEFAULT '{}',

  -- Subscription term
  term_start TIMESTAMPTZ NOT NULL,
  term_end TIMESTAMPTZ NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_gem_id ON payments(gem_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_provider ON payments(provider);
CREATE INDEX idx_payments_checkout_request_id ON payments(checkout_request_id);

-- RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
  ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow service role to update payments (for callbacks)
CREATE POLICY "Service can update payments"
  ON payments FOR UPDATE
  USING (true)
  WITH CHECK (true);
