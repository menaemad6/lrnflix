
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectLabel } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TransactionCardSkeleton } from '@/components/student/skeletons/TransactionCardSkeleton';

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
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date_desc');

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchWalletBalance();
    }
  }, [user]);

  useEffect(() => {
    let filtered = [...transactions];
    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.transaction_type === filterType);
    }
    // Filter by date range
    if (filterStartDate) {
      filtered = filtered.filter(t => new Date(t.created_at) >= new Date(filterStartDate));
    }
    if (filterEndDate) {
      filtered = filtered.filter(t => new Date(t.created_at) <= new Date(filterEndDate));
    }
    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(transaction =>
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.transaction_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Sort
    if (sortBy === 'date_desc') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'date_asc') {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortBy === 'amount_desc') {
      filtered.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'amount_asc') {
      filtered.sort((a, b) => a.amount - b.amount);
    }
    setFilteredTransactions(filtered);
  }, [searchTerm, transactions, filterType, filterStartDate, filterEndDate, sortBy]);

  const fetchWalletBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('wallet')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setWallet(data?.wallet || 0);
    } catch (error: unknown) {
      console.error('Error fetching wallet balance:', error instanceof Error ? error.message : error);
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
    } catch (error: unknown) {
      console.error('Error fetching transactions:', error instanceof Error ? error.message : error);
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
      case 'chapter_purchase':
        return 'Chapter Purchase';
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

  // Calculate wallet statistics
  const totalCredited = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalDebited = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const numTransactions = transactions.length;
  const lastTransactionDate = transactions[0]?.created_at ? new Date(transactions[0].created_at).toLocaleString() : 'N/A';

  return (
    <DashboardLayout>
      <DashboardModernHeader
        title="Transaction History"
        subtitle="Track all your wallet transactions"
      />
      <div className="w-full px-2 sm:px-4 py-6 space-y-6">
        {/* Wallet Balance Card - Full Width */}
        <div className="w-full">
          <div className="w-full p-6 bg-gradient-to-br from-emerald-500/30 to-teal-500/30 rounded-2xl border border-emerald-500/40 shadow-lg flex flex-col items-start">
            <div className="text-3xl font-extrabold gradient-text mb-1">{wallet}</div>
            <div className="text-base text-emerald-400 font-medium mb-4">Current Balance</div>
            {/* Statistics Row */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Total Credited</div>
                <div className="font-semibold text-emerald-500">+{totalCredited}</div>
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Total Debited</div>
                <div className="font-semibold text-red-400">-{totalDebited}</div>
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Transactions</div>
                <div className="font-semibold">{numTransactions}</div>
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Last Transaction</div>
                <div className="font-semibold">{lastTransactionDate}</div>
              </div>
            </div>
          </div>
        </div>
        {/* Search Bar - Full Width */}
        <div className="w-full">
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 glass-input border-emerald-500/40 focus:border-emerald-500/70 w-full h-12 rounded-xl text-base"
              />
            </div>
          </div>
        </div>

        {/* Filtering & Sorting Controls */}
        <div className="w-full bg-background/60 glass-card border border-primary/20 rounded-2xl px-2 sm:px-4 py-4 flex flex-col md:flex-row md:items-end gap-4 mb-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3 flex-1 w-full">
            <div className="flex flex-col gap-1">
              <Label htmlFor="type-filter" className="text-xs mb-0.5 ml-1">Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-12 w-full md:w-40 border-primary focus:ring-primary bg-background text-foreground rounded-xl px-4 text-base">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent className="bg-background text-foreground border-primary">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="debit">Debit</SelectItem>
                  <SelectItem value="course_purchase">Course Purchase</SelectItem>
                  <SelectItem value="chapter_purchase">Chapter Purchase</SelectItem>
                  <SelectItem value="code_redemption">Code Redemption</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="start-date" className="text-xs mb-0.5 ml-1">Start Date</Label>
              <input
                id="start-date"
                type="date"
                value={filterStartDate}
                onChange={e => setFilterStartDate(e.target.value)}
                className="h-12 w-full md:w-36 border border-primary rounded-xl px-4 text-base bg-background text-foreground focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="end-date" className="text-xs mb-0.5 ml-1">End Date</Label>
              <input
                id="end-date"
                type="date"
                value={filterEndDate}
                onChange={e => setFilterEndDate(e.target.value)}
                className="h-12 w-full md:w-36 border border-primary rounded-xl px-4 text-base bg-background text-foreground focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="flex flex-col gap-1">
              <Label htmlFor="sort-by" className="text-xs mb-0.5 ml-1">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-12 w-full md:w-44 border-primary focus:ring-primary bg-background text-foreground rounded-xl px-4 text-base">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-background text-foreground border-primary">
                  <SelectItem value="date_desc">Date (Newest)</SelectItem>
                  <SelectItem value="date_asc">Date (Oldest)</SelectItem>
                  <SelectItem value="amount_desc">Amount (High-Low)</SelectItem>
                  <SelectItem value="amount_asc">Amount (Low-High)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Transactions List or Skeletons */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <TransactionCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <Card className="glass-card border-0">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-glow-pulse">
                <History className="h-10 w-10 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 gradient-text">No transactions found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Try adjusting your search criteria or filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card border-0 w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
                  <History className="h-5 w-5 text-emerald-400" />
                </div>
                All Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 w-full">
                {filteredTransactions.map((transaction) => {
                  // Determine color classes
                  let borderColor = '';
                  let bgColor = '';
                  let amountColor = '';
                  const badgeVariant = transaction.transaction_type === 'chapter_purchase' ? 'secondary' : getTransactionVariant(transaction.transaction_type);
                  switch (transaction.transaction_type) {
                    case 'credit':
                      borderColor = 'border-l-emerald-500';
                      bgColor = 'bg-emerald-500/10 hover:bg-emerald-500/20';
                      amountColor = 'text-emerald-500';
                      break;
                    case 'debit':
                      borderColor = 'border-l-red-500';
                      bgColor = 'bg-red-500/10 hover:bg-red-500/20';
                      amountColor = 'text-red-500';
                      break;
                    case 'course_purchase':
                      borderColor = 'border-l-blue-500';
                      bgColor = 'bg-blue-500/10 hover:bg-blue-500/20';
                      amountColor = 'text-blue-500';
                      break;
                    case 'chapter_purchase':
                      borderColor = 'border-l-teal-500';
                      bgColor = 'bg-teal-500/10 hover:bg-teal-500/20';
                      amountColor = 'text-teal-500';
                      break;
                    case 'code_redemption':
                      borderColor = 'border-l-purple-500';
                      bgColor = 'bg-purple-500/10 hover:bg-purple-500/20';
                      amountColor = 'text-purple-500';
                      break;
                    case 'refund':
                      borderColor = 'border-l-orange-500';
                      bgColor = 'bg-orange-500/10 hover:bg-orange-500/20';
                      amountColor = 'text-orange-500';
                      break;
                    default:
                      borderColor = 'border-l-gray-500';
                      bgColor = 'bg-gray-500/10 hover:bg-gray-500/20';
                      amountColor = 'text-gray-500';
                  }
                  return (
                    <div
                      key={transaction.id}
                      className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl border-l-8 ${borderColor} ${bgColor} border-white/10 transition-all duration-200 group w-full`}
                    >
                      {/* Icon + Title (row on sm+, col on mobile) */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto flex-1 min-w-0">
                        <div className="w-14 h-14 bg-background rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                          {getTransactionIcon(transaction.transaction_type)}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="font-semibold text-base break-words whitespace-normal mb-1 sm:mb-0" title={transaction.description}>{transaction.description}</div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <Badge variant={badgeVariant} className={`text-xs ${transaction.transaction_type === 'chapter_purchase' ? 'bg-teal-500 text-white' : ''}`}>
                              {getTransactionTypeLabel(transaction.transaction_type)}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span className="truncate max-w-[120px] sm:max-w-none">{new Date(transaction.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Amount */}
                      <div className={`text-2xl font-extrabold ml-0 sm:ml-4 mt-2 sm:mt-0 ${amountColor} flex-shrink-0`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </div>
                    </div>
                  );
                })}
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
