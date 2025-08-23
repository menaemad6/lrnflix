
-- Create enum for invoice status
CREATE TYPE public.invoice_status AS ENUM ('pending', 'paid', 'cancelled', 'refunded');

-- Create enum for payment type
CREATE TYPE public.payment_type AS ENUM ('vodafone_cash', 'credit_card', 'bank_transfer', 'wallet');

-- Create enum for item type
CREATE TYPE public.item_type AS ENUM ('course', 'chapter', 'lesson', 'quiz');

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  item_type public.item_type NOT NULL,
  total_price INTEGER NOT NULL,
  payment_type public.payment_type NOT NULL DEFAULT 'vodafone_cash',
  status public.invoice_status NOT NULL DEFAULT 'pending',
  invoice_number TEXT NOT NULL UNIQUE,
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Generate unique invoice number function
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    invoice_num TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        invoice_num := 'INV-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(md5(random()::text) from 1 for 6));
        SELECT EXISTS(SELECT 1 FROM public.invoices WHERE invoice_number = invoice_num) INTO exists_check;
        IF NOT exists_check THEN
            RETURN invoice_num;
        END IF;
    END LOOP;
END;
$$;

-- Set invoice number trigger
CREATE OR REPLACE FUNCTION public.set_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        NEW.invoice_number := generate_invoice_number();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_invoice_number_trigger
    BEFORE INSERT ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.set_invoice_number();

-- Add updated_at trigger
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Students can view and create their own invoices
CREATE POLICY "Students can view their own invoices"
    ON public.invoices
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Students can create their own invoices"
    ON public.invoices
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Instructors can view, create, update, and delete invoices for their items
CREATE POLICY "Instructors can view invoices for their items"
    ON public.invoices
    FOR SELECT
    USING (auth.uid() = instructor_id);

CREATE POLICY "Instructors can create invoices for their items"
    ON public.invoices
    FOR INSERT
    WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Instructors can update invoices for their items"
    ON public.invoices
    FOR UPDATE
    USING (auth.uid() = instructor_id);

CREATE POLICY "Instructors can delete invoices for their items"
    ON public.invoices
    FOR DELETE
    USING (auth.uid() = instructor_id);

-- Create indexes for better performance
CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_invoices_instructor_id ON public.invoices(instructor_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_item_id_type ON public.invoices(item_id, item_type);
