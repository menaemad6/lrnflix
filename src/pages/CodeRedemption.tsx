import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Gift } from 'lucide-react';
import { useRandomBackground } from "../hooks/useRandomBackground";

interface RedemptionResponse {
  success: boolean;
  amount?: number;
  error?: string;
  message?: string;
}

export const CodeRedemption = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [loading, setLoading] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);
  const bgClass = useRandomBackground();

  const redeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('redeem_wallet_code', {
        p_code: code
      });

      if (error) throw error;

      // Properly cast the response through unknown first
      const response = data as unknown as RedemptionResponse;

      if (response.success) {
        setRedeemed(true);
        setAmount(response.amount || 0);
        toast({
          title: 'Success!',
          description: `${response.amount} credits added to your wallet!`,
        });
      } else {
        throw new Error(response.error || 'Failed to redeem code');
      }
    } catch (error: any) {
      console.error('Error redeeming code:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (redeemed) {
    return (
      <div className={bgClass + " min-h-screen flex items-center justify-center p-4"}>
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 text-green-500">
              <Gift size={48} />
            </div>
            <CardTitle>Code Redeemed Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-green-600">
              +{amount} Credits
            </div>
            <p className="text-muted-foreground">
              The credits have been added to your wallet.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/student/dashboard')} className="flex-1">
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={bgClass + " min-h-screen flex items-center justify-center p-4"}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto mb-4 text-blue-500">
            <Wallet size={48} />
          </div>
          <CardTitle>Redeem Wallet Code</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={redeemCode} className="space-y-4">
            <div>
              <Input
                placeholder="Enter wallet code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                className="text-center font-mono"
              />
            </div>
            <Button type="submit" disabled={loading || !code} className="w-full">
              {loading ? 'Redeeming...' : 'Redeem Code'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
