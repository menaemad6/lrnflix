
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { History, Search, TrendingUp, TrendingDown, CreditCard, Gift, ShoppingCart, RotateCcw, Calendar } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import DashboardModernHeader from '@/components/ui/DashboardModernHeader';

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  course_id?: string;
  created_at: string;
}

export const StudentTransactions = () => {
  const { toast } = useToast();
  const user = useSelector((state: RootState) => state.auth.user);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [wallet, setWallet] = useState(0);

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchWalletBalance();
    }
  }, [user]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTransactions(transactions);
    } else {
      const filtered = transactions.filter(transaction =>
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.transaction_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTransactions(filtered);
    }
  }, [searchTerm, transactions]);

  const fetchWalletBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('wallet')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setWallet(data?.wallet || 0);
    } catch (error: any) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      console.log('Fetching transactions for user:', user?.id);

      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Transactions data:', data);
      setTransactions(data || []);
      setFilteredTransactions(data || []);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transactions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <TrendingUp className="h-5 w-5 text-emerald-400" />;
      case 'debit':
        return <TrendingDown className="h-5 w-5 text-red-400" />;
      case 'course_purchase':
        return <ShoppingCart className="h-5 w-5 text-blue-400" />;
      case 'code_redemption':
        return <Gift className="h-5 w-5 text-purple-400" />;
      case 'refund':
        return <RotateCcw className="h-5 w-5 text-orange-400" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'credit':
        return 'Credit';
      case 'debit':
        return 'Debit';
      case 'course_purchase':
        return 'Course Purchase';
      case 'code_redemption':
        return 'Code Redemption';
      case 'refund':
        return 'Refund';
      default:
        return type;
    }
  };

  const getTransactionVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'credit':
      case 'code_redemption':
      case 'refund':
        return 'default';
      case 'course_purchase':
      case 'debit':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardModernHeader
        title="Transaction History"
        subtitle="Track all your wallet transactions"
      />
      <div className="container mx-auto p-6 space-y-6">
        {/* Wallet Balance Card */}
        <div className="flex items-center justify-between">
          <div></div>
          <div className="text-center p-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl border border-emerald-500/30">
            <div className="text-2xl font-bold gradient-text">{wallet}</div>
            <div className="text-sm text-emerald-400">Current Balance</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 glass-input border-emerald-500/30 focus:border-emerald-500/50"
          />
        </div>

        {/* Transactions */}
        {filteredTransactions.length === 0 ? (
          <Card className="glass-card border-0">
            <CardContent className="text-center py-12">
              <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? 'No matching transactions found' : 'No transactions yet'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Your transaction history will appear here once you start using your wallet'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
                  <History className="h-5 w-5 text-emerald-400" />
                </div>
                All Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover-glow transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
                        {getTransactionIcon(transaction.transaction_type)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm mb-1">{transaction.description}</div>
                        <div className="flex items-center gap-3">
                          <Badge variant={getTransactionVariant(transaction.transaction_type)} className="text-xs">
                            {getTransactionTypeLabel(transaction.transaction_type)}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(transaction.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${transaction.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {searchTerm && filteredTransactions.length > 0 && (
          <div className="text-center">
            <p className="text-muted-foreground">
              Found {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} matching "{searchTerm}"
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
