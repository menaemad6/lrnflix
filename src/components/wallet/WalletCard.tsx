
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Gift, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface RedemptionResponse {
  success: boolean;
  amount?: number;
  error?: string;
}

export const WalletCard = () => {
  const { toast } = useToast();
  const { t } = useTranslation('dashboard');
  const user = useSelector((state: RootState) => state.auth.user);
  const [wallet, setWallet] = useState(0);
  const [redeemCode, setRedeemCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchWalletData();
      fetchRecentTransactions();
    }
  }, [user]);

  const fetchWalletData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('wallet')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setWallet(data?.wallet || 0);
    } catch (error: any) {
      console.error('Error fetching wallet:', error);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentTransactions(data || []);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
    }
  };

  const redeemWalletCode = async () => {
    if (!redeemCode.trim()) {
      toast({
        title: t('wallet.error'),
        description: t('wallet.pleaseEnterCode'),
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('redeem_wallet_code', {
        p_code: redeemCode.trim()
      });

      if (error) throw error;

      // Properly handle the response type
      const result = data as unknown as RedemptionResponse;

      if (result && result.success) {
        toast({
          title: t('wallet.success'),
          description: t('wallet.redeemedSuccessfully', { amount: result.amount }),
        });
        setRedeemCode('');
        fetchWalletData();
        fetchRecentTransactions();
      } else {
        toast({
          title: t('wallet.error'),
          description: result?.error || t('wallet.failedToRedeem'),
          variant: 'destructive',
        });
      }
    } catch (error: unknown) {
      console.error('Error redeeming code:', error);
      toast({
        title: t('wallet.error'),
        description: error instanceof Error ? error.message : t('wallet.errorRedeemingCode'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card border-0">
      <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-secondary rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
            <Wallet className="h-4 w-4 sm:h-6 sm:w-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="gradient-text text-base sm:text-xl">{t('wallet.title')}</CardTitle>
            <CardDescription className="text-muted-foreground/80 text-xs sm:text-sm">{t('wallet.subtitle')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6 space-y-4 sm:space-y-6">
          {/* Wallet Balance */}
          <div className="text-center p-4 sm:p-8 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl sm:rounded-2xl border border-primary-500/30 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5" />
            <div className="relative z-10">
              <div className="text-2xl sm:text-4xl font-bold gradient-text mb-2">{wallet}</div>
              <div className="text-xs sm:text-sm text-primary-400 font-medium flex items-center justify-center gap-1 sm:gap-2">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                {t('wallet.creditsAvailable')}
              </div>
            </div>
          </div>

          {/* Redemption Section */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400" />
              <h3 className="text-base sm:text-lg font-semibold gradient-text">{t('wallet.redeemCode')}</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Input
                type="text"
                placeholder={t('wallet.enterRedemptionCode')}
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value)}
                className="glass-input border-primary-500/30 focus:border-primary-500/50 text-sm sm:text-base"
                onKeyPress={(e) => e.key === 'Enter' && redeemWalletCode()}
              />
              <Button 
                onClick={redeemWalletCode} 
                disabled={loading}
                className="btn-primary px-4 sm:px-6 py-2 text-sm sm:text-base"
              >
                <Gift className="h-4 w-4 mr-1 sm:mr-2" />
                {t('wallet.redeem')}
              </Button>
            </div>
          </div>

          {/* Recent Activity */}
          {recentTransactions.length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary-400" />
                  <h4 className="text-xs sm:text-sm font-semibold text-primary-400">{t('wallet.recentActivity')}</h4>
                </div>
                <Link to="/student/transactions">
                  <Button variant="ghost" size="sm" className="text-xs hover:text-primary-400 px-2 sm:px-3">
                    {t('wallet.viewAll')}
                  </Button>
                </Link>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 hover-glow">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="text-xs sm:text-sm font-medium truncate">{transaction.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`text-xs sm:text-sm font-bold flex-shrink-0 ${transaction.amount > 0 ? 'text-primary-400' : 'text-red-400'}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
    </Card>
  );
};
