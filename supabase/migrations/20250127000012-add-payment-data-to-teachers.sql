-- Add payment_data column to teachers table
-- This column will store payment information for teachers (Vodafone Cash, bank details, etc.)
-- as a JSONB object for flexible payment method configuration

ALTER TABLE public.teachers 
ADD COLUMN payment_data JSONB DEFAULT '{}';

-- Add a comment to explain the column purpose
COMMENT ON COLUMN public.teachers.payment_data IS 'JSONB object containing payment method details for teachers (e.g., Vodafone Cash number, bank account details, etc.)';

-- Create an index for better query performance when filtering by payment_data
CREATE INDEX idx_teachers_payment_data ON public.teachers USING GIN (payment_data);

-- Example of payment_data structure:
-- {
--   "vodafone_cash": {
--     "phone_number": "01226102013",
--     "name": "Teacher Name"
--   },
--   "bank_transfer": {
--     "bank_name": "CIB",
--     "account_number": "1000 1234 5678 9012",
--     "account_name": "Teacher Name"
--   },
--   "fawry": {
--     "merchant_code": "12345",
--     "merchant_name": "Teacher Name"
--   }
-- }
