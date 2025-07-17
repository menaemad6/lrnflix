
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

interface RedemptionResponse {
  success: boolean;
  amount?: number;
  error?: string;
}

export const WalletCard = () => {
  const { toast } = useToast();
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
        title: 'Error',
        description: 'Please enter a redemption code',
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
          title: 'Success!',
          description: `Redeemed ${result.amount} credits successfully!`,
        });
        setRedeemCode('');
        fetchWalletData();
        fetchRecentTransactions();
      } else {
        toast({
          title: 'Error',
          description: result?.error || 'Failed to redeem code',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error redeeming code:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to redeem code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card border-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center animate-glow-pulse shadow-lg shadow-emerald-500/25">
              <Wallet className="h-6 w-6 text-black" />
            </div>
            <div>
              <div className="gradient-text text-xl">My Wallet</div>
              <CardDescription className="text-muted-foreground/80">
                Redeem codes to earn credits
              </CardDescription>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          {/* Wallet Balance */}
          <div className="text-center p-8 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl border border-emerald-500/30 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5" />
            <div className="relative z-10">
              <div className="text-4xl font-bold gradient-text mb-2">{wallet}</div>
              <div className="text-sm text-emerald-400 font-medium flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                Credits Available
              </div>
            </div>
          </div>

          {/* Redemption Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="h-5 w-5 text-emerald-400" />
              <h3 className="text-lg font-semibold gradient-text">Redeem Code</h3>
            </div>
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Enter redemption code"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value)}
                className="glass-input border-emerald-500/30 focus:border-emerald-500/50"
                onKeyPress={(e) => e.key === 'Enter' && redeemWalletCode()}
              />
              <Button 
                onClick={redeemWalletCode} 
                disabled={loading}
                className="btn-primary px-6"
              >
                <Gift className="h-4 w-4 mr-2" />
                Redeem
              </Button>
            </div>
          </div>

          {/* Recent Activity */}
          {recentTransactions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-400" />
                  <h4 className="text-sm font-semibold text-emerald-400">Recent Activity</h4>
                </div>
                <Link to="/student/transactions">
                  <Button variant="ghost" size="sm" className="text-xs hover:text-emerald-400">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-2">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10 hover-glow">
                    <div className="flex-1">
                      <div className="text-sm font-medium truncate">{transaction.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`text-sm font-bold ${transaction.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
