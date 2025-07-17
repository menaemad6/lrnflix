
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WhatsAppMessage {
  to: string;
  message: string;
}

export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: any;
}

export const useWhatsApp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async ({ to, message }: WhatsAppMessage): Promise<WhatsAppResponse> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
        body: { to, message }
      });

      if (error) {
        console.error('WhatsApp send error:', error);
        toast({
          title: 'Error',
          description: 'Failed to send WhatsApp message',
          variant: 'destructive',
        });
        return { success: false, error: error.message };
      }

      if (data?.success) {
        toast({
          title: 'Success',
          description: 'WhatsApp message sent successfully!',
        });
        return { success: true, messageId: data.messageId };
      } else {
        toast({
          title: 'Error',
          description: data?.error || 'Failed to send WhatsApp message',
          variant: 'destructive',
        });
        return { success: false, error: data?.error, details: data?.details };
      }

    } catch (error: any) {
      console.error('WhatsApp hook error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const sendBulkMessages = async (messages: WhatsAppMessage[]): Promise<WhatsAppResponse[]> => {
    setIsLoading(true);
    const results: WhatsAppResponse[] = [];

    try {
      // Send messages sequentially to avoid rate limiting
      for (const msg of messages) {
        const result = await sendMessage(msg);
        results.push(result);
        
        // Add a small delay between messages to respect rate limits
        if (messages.indexOf(msg) < messages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      toast({
        title: 'Bulk Send Complete',
        description: `${successCount} messages sent successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
        variant: failureCount > 0 ? 'destructive' : 'default',
      });

    } catch (error: any) {
      console.error('Bulk WhatsApp send error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send bulk WhatsApp messages',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }

    return results;
  };

  return {
    sendMessage,
    sendBulkMessages,
    isLoading,
  };
};
