
-- Create table to store WhatsApp message delivery statuses
CREATE TABLE public.whatsapp_message_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  webhook_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_whatsapp_message_status_message_id ON public.whatsapp_message_status(message_id);
CREATE INDEX idx_whatsapp_message_status_recipient_id ON public.whatsapp_message_status(recipient_id);
CREATE INDEX idx_whatsapp_message_status_status ON public.whatsapp_message_status(status);
CREATE INDEX idx_whatsapp_message_status_timestamp ON public.whatsapp_message_status(timestamp);

-- Add RLS policies (optional, since this is mainly for system use)
ALTER TABLE public.whatsapp_message_status ENABLE ROW LEVEL SECURITY;

-- Policy to allow service role to manage all records
CREATE POLICY "Service role can manage all whatsapp message statuses"
  ON public.whatsapp_message_status
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Policy to allow users to view their own message statuses (optional)
CREATE POLICY "Users can view message statuses for their messages"
  ON public.whatsapp_message_status
  FOR SELECT
  USING (true); -- You can make this more restrictive if needed

-- Add trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_whatsapp_message_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_whatsapp_message_status_updated_at
  BEFORE UPDATE ON public.whatsapp_message_status
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_message_status_updated_at();
