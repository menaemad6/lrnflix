// Example payment data structures for teachers
import { PaymentData } from '@/types/payment';

export const examplePaymentData: PaymentData = {
  vodafone_cash: {
    phone_number: "01226102013",
    name: "Teacher Name"
  },
  bank_transfer: {
    bank_name: "CIB",
    account_number: "1000 1234 5678 9012",
    account_name: "Teacher Name"
  },
  fawry: {
    merchant_code: "12345",
    merchant_name: "Teacher Name"
  },
  credit_card: {
    processor: "stripe",
    merchant_id: "acct_1234567890"
  }
};

// Helper function to create payment data for a teacher
export const createPaymentData = (
  vodafoneNumber?: string,
  bankDetails?: { bankName: string; accountNumber: string; accountName?: string },
  fawryCode?: string,
  creditCardDetails?: { processor?: string; merchantId?: string }
): PaymentData => {
  const paymentData: PaymentData = {};

  if (vodafoneNumber) {
    paymentData.vodafone_cash = {
      phone_number: vodafoneNumber,
      name: bankDetails?.accountName
    };
  }

  if (bankDetails) {
    paymentData.bank_transfer = {
      bank_name: bankDetails.bankName,
      account_number: bankDetails.accountNumber,
      account_name: bankDetails.accountName
    };
  }

  if (fawryCode) {
    paymentData.fawry = {
      merchant_code: fawryCode,
      merchant_name: bankDetails?.accountName
    };
  }

  if (creditCardDetails) {
    paymentData.credit_card = {
      processor: creditCardDetails.processor,
      merchant_id: creditCardDetails.merchantId
    };
  }

  return paymentData;
};
