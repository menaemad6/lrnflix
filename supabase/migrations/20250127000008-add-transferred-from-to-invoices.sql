-- Add transferred_from column to invoices table
-- This column will store the phone number or account number that the student transferred money from
-- It's kept generic to support different payment methods (Vodafone Cash, bank transfers, etc.)

ALTER TABLE public.invoices 
ADD COLUMN transferred_from TEXT;

-- Add a comment to explain the column purpose
COMMENT ON COLUMN public.invoices.transferred_from IS 'The phone number or account number that the student transferred money from (e.g., Vodafone Cash number, bank account)';

-- Create an index for better query performance when filtering by transferred_from
CREATE INDEX idx_invoices_transferred_from ON public.invoices(transferred_from);
