import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Gift, Sparkles, Wallet, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useRandomBackground } from "../hooks/useRandomBackground";
import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/components/seo';

interface RedeemResponse {
  success: boolean;
  error?: string;
  amount?: number;
}

const RedeemPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { t } = useTranslation('dashboard');
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [loading, setLoading] = useState(false);
  const bgClass = useRandomBackground();

  const handleRedeem = async () => {
    if (!code.trim()) {
      toast({
        title: t('redeemPage.error'),
        description: t('redeemPage.pleaseEnterCode'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting to redeem code:', code);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast({
          title: t('redeemPage.error'),
          description: t('redeemPage.loginRequired'),
          variant: 'destructive',
        });
        return;
      }

      console.log('User authenticated, calling redeem function');

      // Call the RPC function to redeem the code
      const { data, error } = await supabase.rpc('redeem_wallet_code', {
        p_code: code.trim()
      });

      console.log('RPC response:', { data, error });

      if (error) {
        console.error('RPC error:', error);
        throw error;
      }

      // Type guard to ensure data is the expected object
      const isRedeemResponse = (data: any): data is RedeemResponse => {
        return data && typeof data === 'object' && 'success' in data;
      };

      if (!isRedeemResponse(data)) {
        console.error('Unexpected response format:', data);
        throw new Error('Invalid response format from server');
      }

      if (data.success) {
        const amount = data.amount || 0;
        toast({
          title: t('redeemPage.success'),
          description: t('redeemPage.codeRedeemed', { amount }),
        });
        setCode('');
        
        // Redirect to dashboard or wallet page
        setTimeout(() => {
          navigate('/student/dashboard');
        }, 2000);
      } else {
        throw new Error(data.error || t('redeemPage.errorRedeeming'));
      }
    } catch (error: any) {
      console.error('Error redeeming code:', error);
      
      let errorMessage = t('redeemPage.errorRedeeming');
      
      if (error.code === 'PGRST116') {
        errorMessage = t('redeemPage.codeAlreadyUsed');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: t('redeemPage.error'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead 
        contentTitle={t('redeemPage.title')}
        contentDescription={t('redeemPage.subtitle')}
      />
      <div className={bgClass + " min-h-screen"}>
        <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/5 flex items-center justify-center p-4">
          <div className="w-full max-w-lg">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-primary to-purple-600 mb-6 shadow-lg">
                <Gift className="w-10 h-10 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
                {t('redeemPage.title')}
              </h1>
              <p className="text-muted-foreground text-lg">
                {t('redeemPage.subtitle')}
              </p>
            </div>

            {/* Main Card */}
            <Card className="border-0 shadow-2xl bg-card/60 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3 text-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                  <CardTitle className="text-2xl font-semibold">
                    {t('redeemPage.walletCreditRedemption')}
                  </CardTitle>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Code Input */}
                <div className="space-y-3">
                  <label htmlFor="code" className="text-sm font-medium text-foreground/80 block">
                    {t('redeemPage.redemptionCode')}
                  </label>
                  <div className="relative">
                    <Input
                      id="code"
                      type="text"
                      placeholder={t('redeemPage.codePlaceholder')}
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="text-center font-mono text-lg tracking-wider h-14 border-2 border-border/50 focus:border-primary transition-colors bg-background/50"
                      disabled={loading}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <Sparkles className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {/* Redeem Button */}
                <Button 
                  onClick={handleRedeem}
                  disabled={loading || !code.trim()}
                  className="w-full h-14 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-semibold"
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      {t('redeemPage.redeeming')}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5" />
                      {t('redeemPage.redeem')}
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </Button>

                {/* Help Section */}
                <div className="pt-4 border-t border-border/30">
                  <div className="text-center space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {t('redeemPage.dontHaveCode')}
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/student/dashboard')}
                        className="flex-1 max-w-40"
                        size="sm"
                      >
                        {t('redeemPage.dashboard')}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/student/store')}
                        className="flex-1 max-w-40"
                        size="sm"
                      >
                        {t('redeemPage.store')}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer Info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                {t('redeemPage.codesInfo')}
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
      </div>
    </>
  );
};

export default RedeemPage;
