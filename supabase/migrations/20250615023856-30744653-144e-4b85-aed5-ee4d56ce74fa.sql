
-- Fix the generate_wallet_code function to avoid column reference ambiguity
CREATE OR REPLACE FUNCTION public.generate_wallet_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    generated_code TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        generated_code := upper(substring(md5(random()::text) from 1 for 12));
        SELECT EXISTS(SELECT 1 FROM public.wallet_codes WHERE wallet_codes.code = generated_code) INTO exists_check;
        IF NOT exists_check THEN
            RETURN generated_code;
        END IF;
    END LOOP;
END;
$$;
