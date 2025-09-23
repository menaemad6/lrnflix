-- Allow students to update their own invoices
-- This policy allows students to update their own invoices (including transferred_from field)
-- while maintaining security by ensuring they can only update their own invoices

CREATE POLICY "Students can update their own invoices"
    ON public.invoices
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
