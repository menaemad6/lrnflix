
-- Fix the wallet_transactions check constraint to include 'code_redemption'
ALTER TABLE public.wallet_transactions 
DROP CONSTRAINT IF EXISTS wallet_transactions_transaction_type_check;

ALTER TABLE public.wallet_transactions 
ADD CONSTRAINT wallet_transactions_transaction_type_check 
CHECK (transaction_type IN ('credit', 'debit', 'course_purchase', 'refund', 'code_redemption'));
