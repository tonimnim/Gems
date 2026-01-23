/**
 * M-Pesa Daraja API Integration
 * Supports STK Push (Lipa Na M-Pesa Online)
 */

import type {
  MpesaAuthResponse,
  MpesaSTKPushRequest,
  MpesaSTKPushResponse,
  MpesaCallbackBody,
  MpesaCallbackData,
} from './types';

// Environment configuration
const MPESA_CONFIG = {
  consumerKey: process.env.MPESA_CONSUMER_KEY!,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
  shortcode: process.env.MPESA_SHORTCODE!,
  passkey: process.env.MPESA_PASSKEY!,
  callbackUrl: process.env.MPESA_CALLBACK_URL!,
  env: process.env.MPESA_ENV || 'sandbox',
};

// API URLs
const getBaseUrl = () =>
  MPESA_CONFIG.env === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

const ENDPOINTS = {
  auth: '/oauth/v1/generate?grant_type=client_credentials',
  stkPush: '/mpesa/stkpush/v1/processrequest',
  stkQuery: '/mpesa/stkpushquery/v1/query',
};

// Token cache
let accessToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get M-Pesa access token (with caching)
 */
export async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const credentials = Buffer.from(
    `${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`
  ).toString('base64');

  const response = await fetch(`${getBaseUrl()}${ENDPOINTS.auth}`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get M-Pesa access token: ${error}`);
  }

  const data: MpesaAuthResponse = await response.json();
  accessToken = data.access_token;
  // Set expiry 1 minute before actual expiry for safety
  tokenExpiry = Date.now() + (parseInt(data.expires_in) - 60) * 1000;

  return accessToken;
}

/**
 * Generate M-Pesa password for STK Push
 */
function generatePassword(): { password: string; timestamp: string } {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T.Z]/g, '')
    .slice(0, 14);

  const password = Buffer.from(
    `${MPESA_CONFIG.shortcode}${MPESA_CONFIG.passkey}${timestamp}`
  ).toString('base64');

  return { password, timestamp };
}

/**
 * Format phone number to M-Pesa format (254XXXXXXXXX)
 */
export function formatPhoneNumber(phone: string): string {
  // Remove any spaces, dashes, or special characters
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Handle different formats
  if (cleaned.startsWith('+254')) {
    cleaned = cleaned.slice(1); // Remove +
  } else if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.slice(1); // Replace leading 0 with 254
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    cleaned = '254' + cleaned; // Add 254 prefix
  }

  return cleaned;
}

/**
 * Initiate STK Push (Lipa Na M-Pesa Online)
 */
export async function initiateSTKPush(params: {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}): Promise<MpesaSTKPushResponse> {
  const token = await getAccessToken();
  const { password, timestamp } = generatePassword();
  const formattedPhone = formatPhoneNumber(params.phoneNumber);

  const requestBody: MpesaSTKPushRequest = {
    BusinessShortCode: MPESA_CONFIG.shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(params.amount), // M-Pesa requires whole numbers
    PartyA: formattedPhone,
    PartyB: MPESA_CONFIG.shortcode,
    PhoneNumber: formattedPhone,
    CallBackURL: MPESA_CONFIG.callbackUrl,
    AccountReference: params.accountReference,
    TransactionDesc: params.transactionDesc,
  };

  const response = await fetch(`${getBaseUrl()}${ENDPOINTS.stkPush}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`STK Push failed: ${error}`);
  }

  const data: MpesaSTKPushResponse = await response.json();

  if (data.ResponseCode !== '0') {
    throw new Error(`STK Push error: ${data.ResponseDescription}`);
  }

  return data;
}

/**
 * Query STK Push transaction status
 */
export async function querySTKPushStatus(checkoutRequestId: string): Promise<{
  resultCode: number;
  resultDesc: string;
}> {
  const token = await getAccessToken();
  const { password, timestamp } = generatePassword();

  const response = await fetch(`${getBaseUrl()}${ENDPOINTS.stkQuery}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: MPESA_CONFIG.shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`STK Query failed: ${error}`);
  }

  const data = await response.json();

  return {
    resultCode: parseInt(data.ResultCode),
    resultDesc: data.ResultDesc,
  };
}

/**
 * Parse M-Pesa callback data
 */
export function parseCallback(body: MpesaCallbackBody): MpesaCallbackData {
  const callback = body.Body.stkCallback;

  const result: MpesaCallbackData = {
    merchantRequestId: callback.MerchantRequestID,
    checkoutRequestId: callback.CheckoutRequestID,
    resultCode: callback.ResultCode,
    resultDesc: callback.ResultDesc,
  };

  // Extract callback metadata if payment was successful
  if (callback.ResultCode === 0 && callback.CallbackMetadata?.Item) {
    for (const item of callback.CallbackMetadata.Item) {
      switch (item.Name) {
        case 'Amount':
          result.amount = item.Value as number;
          break;
        case 'MpesaReceiptNumber':
          result.mpesaReceiptNumber = item.Value as string;
          break;
        case 'TransactionDate':
          result.transactionDate = String(item.Value);
          break;
        case 'PhoneNumber':
          result.phoneNumber = String(item.Value);
          break;
      }
    }
  }

  return result;
}

/**
 * Validate M-Pesa callback (basic validation)
 */
export function validateCallback(body: unknown): body is MpesaCallbackBody {
  if (!body || typeof body !== 'object') return false;

  const b = body as Record<string, unknown>;
  if (!b.Body || typeof b.Body !== 'object') return false;

  const bodyObj = b.Body as Record<string, unknown>;
  if (!bodyObj.stkCallback || typeof bodyObj.stkCallback !== 'object') return false;

  const callback = bodyObj.stkCallback as Record<string, unknown>;
  return (
    typeof callback.MerchantRequestID === 'string' &&
    typeof callback.CheckoutRequestID === 'string' &&
    typeof callback.ResultCode === 'number'
  );
}
