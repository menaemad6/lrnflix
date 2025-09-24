
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { MessageSquare, Send } from 'lucide-react';

export const WhatsAppTester = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const { sendMessage, isLoading } = useWhatsApp();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !message) {
      return;
    }

    await sendMessage({
      to: phoneNumber,
      message: message,
    });

    // Clear form on success
    setPhoneNumber('');
    setMessage('');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          WhatsApp Tester
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Include country code (e.g., +1 for US). Note: In development mode, only phone numbers added to your WhatsApp Business API allowed recipients list can receive messages.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || !phoneNumber || !message}
            className="w-full"
          >
            {isLoading ? (
              'Sending...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send WhatsApp Message
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
