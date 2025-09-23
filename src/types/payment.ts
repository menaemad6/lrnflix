// Payment data types for teacher payment information

export interface VodafoneCashData {
  phone_number: string;
  name?: string;
}

export interface BankTransferData {
  bank_name: string;
  account_number: string;
  account_name?: string;
}

export interface FawryData {
  merchant_code: string;
  merchant_name?: string;
}

export interface CreditCardData {
  processor?: string;
  merchant_id?: string;
}

export interface PaymentData {
  vodafone_cash?: VodafoneCashData;
  bank_transfer?: BankTransferData;
  fawry?: FawryData;
  credit_card?: CreditCardData;
}

export type PaymentMethod = keyof PaymentData;
