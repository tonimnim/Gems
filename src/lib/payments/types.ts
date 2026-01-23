// Payment provider types

export type PaymentProvider = 'mpesa' | 'paystack' | 'card';

export interface PaymentInitRequest {
  gemId: string;
  userId: string;
  amount: number;
  currency: string;
  type: 'new_listing' | 'renewal' | 'upgrade';
  provider: PaymentProvider;
  phoneNumber?: string; // Required for M-Pesa
  termMonths: number;
}

export interface PaymentInitResponse {
  success: boolean;
  paymentId: string;
  checkoutRequestId?: string; // M-Pesa
  merchantRequestId?: string; // M-Pesa
  message: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  message: string;
  receiptNumber?: string;
}

// M-Pesa specific types
export interface MpesaAuthResponse {
  access_token: string;
  expires_in: string;
}

export interface MpesaSTKPushRequest {
  BusinessShortCode: string;
  Password: string;
  Timestamp: string;
  TransactionType: 'CustomerPayBillOnline' | 'CustomerBuyGoodsOnline';
  Amount: number;
  PartyA: string; // Phone number
  PartyB: string; // Shortcode
  PhoneNumber: string;
  CallBackURL: string;
  AccountReference: string;
  TransactionDesc: string;
}

export interface MpesaSTKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface MpesaCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value?: string | number;
        }>;
      };
    };
  };
}

export interface MpesaCallbackData {
  merchantRequestId: string;
  checkoutRequestId: string;
  resultCode: number;
  resultDesc: string;
  amount?: number;
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  phoneNumber?: string;
}
