import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TeacherPageHeader } from '@/components/teacher/TeacherPageHeader';
import { CreateInvoiceModal } from '@/components/invoices/CreateInvoiceModal';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/hooks/useI18n';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Check, X, DollarSign, Calendar, User, FileText, Phone, TrendingUp, Clock, CheckCircle, Search, Filter, X as XIcon } from 'lucide-react';
import { format } from 'date-fns';
import { enrollStudentFromInvoice } from '@/utils/enrollmentUtils';
import { TeacherInvoicesSkeleton } from '@/components/ui/skeletons';

interface Invoice {
  id: string;
  user_id: string;
  instructor_id: string;
  item_id: string;
  item_type: 'course' | 'chapter' | 'lesson' | 'quiz' | 'credits' | 'ai_minutes';
  total_price: number;
  payment_type: 'vodafone_cash' | 'credit_card' | 'bank_transfer' | 'wallet';
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  invoice_number: string;
  payment_reference?: string;
  notes?: string;
  transferred_from?: string; // Phone number or account number that the student transferred money from
  created_at: string;
  paid_at?: string;
  updated_at: string;
  credits_amount?: number;
  minutes_amount?: number;
}

interface InvoiceItem {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  instructor?: {
    id: string;
    full_name: string;
  };
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
}

export const TeacherInvoicesPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { toast } = useToast();
  const { t } = useI18n('teacher');
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemType, setSelectedItemType] = useState<string>('all');
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch invoices for the current teacher
  const { data: invoices = [], isLoading, refetch } = useQuery({
    queryKey: ['teacher-invoices', user?.id],
    queryFn: async (): Promise<Invoice[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch invoice items for display
  const { data: invoiceItems } = useQuery({
    queryKey: ['invoice-items', invoices.map(i => `${i.item_id}-${i.item_type}`)],
    queryFn: async () => {
      const items: Record<string, InvoiceItem> = {};
      
      for (const invoice of invoices) {
        const item = await fetchInvoiceItem(invoice.item_id, invoice.item_type);
        if (item) {
          items[`${invoice.item_id}-${invoice.item_type}`] = item;
        }
      }
      
      return items;
    },
    enabled: invoices.length > 0,
  });

  // Fetch user profiles for display
  const { data: userProfiles } = useQuery({
    queryKey: ['user-profiles', invoices.map(i => i.user_id)],
    queryFn: async () => {
      const profiles: Record<string, UserProfile> = {};
      
      for (const invoice of invoices) {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('id', invoice.user_id)
          .single();
        
        if (data) {
          profiles[invoice.user_id] = data;
        }
      }
      
      return profiles;
    },
    enabled: invoices.length > 0,
  });

  const fetchInvoiceItem = async (itemId: string, itemType: string): Promise<InvoiceItem | null> => {
    try {
      let query;
      
      switch (itemType) {
        case 'course':
          query = supabase
            .from('courses')
            .select('id, title, description, cover_image_url')
            .eq('id', itemId)
            .single();
          break;
        case 'chapter':
          query = supabase
            .from('chapters')
            .select('id, title, description, cover_image_url')
            .eq('id', itemId)
            .single();
          break;
        case 'lesson':
          query = supabase
            .from('lessons')
            .select('id, title, description')
            .eq('id', itemId)
            .single();
          break;
        case 'quiz':
          query = supabase
            .from('quizzes')
            .select('id, title, description')
            .eq('id', itemId)
            .single();
          break;
        case 'credits':
        case 'ai_minutes':
          // For system purchases, return a generic item
          return {
            id: itemId,
            title: itemType === 'credits' ? 'Credits Package' : 'AI Assistant Minutes',
            description: `System purchase of ${itemType}`,
            thumbnail: null,
          };
        default:
          return null;
      }

      const { data, error } = await query;
      if (error) return null;
      
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        thumbnail: data.cover_image_url || null,
      };
    } catch (error) {
      console.error('Error fetching invoice item:', error);
      return null;
    }
  };

  // Update invoice status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ invoiceId, status, invoice }: { invoiceId: string; status: Invoice['status']; invoice: Invoice }) => {
      const updateData: { 
        status: Invoice['status'];
        paid_at?: string;
      } = { 
        status,
        ...(status === 'paid' && { paid_at: new Date().toISOString() })
      };

      const { data, error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId)
        .select()
        .single();

      if (error) throw error;

      // If status is being changed to 'paid', automatically enroll the student (only for course items)
      if (status === 'paid' && ['course', 'chapter', 'lesson', 'quiz'].includes(invoice.item_type)) {
        try {
          console.log('Attempting to enroll student:', {
            studentId: invoice.user_id,
            itemId: invoice.item_id,
            itemType: invoice.item_type
          });

          const enrollmentResult = await enrollStudentFromInvoice(
            invoice.user_id,
            invoice.item_id,
            invoice.item_type as 'course' | 'chapter' | 'lesson' | 'quiz'
          );

          console.log('Enrollment result:', enrollmentResult);

          if (!enrollmentResult.success) {
            console.warn('Enrollment failed:', enrollmentResult.message, enrollmentResult.error);
            // Show a warning toast to the user
            toast({
              title: "Enrollment Warning",
              description: `Invoice confirmed but enrollment failed: ${enrollmentResult.message}. Please check the system logs for details.`,
              variant: "destructive",
            });
          } else {
            // Show success message for enrollment
            toast({
              title: "Enrollment Success",
              description: "Student successfully enrolled in the item",
            });
          }
        } catch (enrollmentError) {
          console.error('Error during automatic enrollment:', enrollmentError);
          // Show an error toast to the user
          toast({
            title: "Enrollment Error",
            description: `Invoice confirmed but enrollment failed with error: ${enrollmentError instanceof Error ? enrollmentError.message : 'Unknown error'}`,
            variant: "destructive",
          });
        }
      } else if (status === 'paid' && ['credits', 'ai_minutes'].includes(invoice.item_type)) {
        // For system purchases, just show success message
        console.log('System purchase confirmed:', {
          studentId: invoice.user_id,
          itemType: invoice.item_type,
          amount: invoice.item_type === 'credits' ? invoice.credits_amount : invoice.minutes_amount
        });
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-invoices', user?.id] });
      
      if (variables.status === 'paid') {
        // Check if enrollment was successful by looking at the data
        // If enrollment failed, the success message will be different
        toast({
          title: "Success",
          description: "Invoice confirmed successfully",
        });
      } else {
        toast({
          title: "Success",
          description: "Invoice status updated successfully",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update invoice status",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (invoiceId: string, newStatus: Invoice['status']) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      updateStatusMutation.mutate({ invoiceId, status: newStatus, invoice });
    }
  };

  const handleInvoiceCreated = () => {
    refetch();
  };

  // Calculate stats
  const stats = React.useMemo(() => {
    const totalInvoices = invoices.length;
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const totalRevenue = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total_price, 0);
    
    // Calculate this month's revenue
    const thisMonth = new Date();
    const thisMonthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
    const thisMonthRevenue = invoices
      .filter(inv => inv.status === 'paid' && new Date(inv.paid_at || inv.created_at) >= thisMonthStart)
      .reduce((sum, inv) => sum + inv.total_price, 0);
    
    // Calculate last month's revenue
    const lastMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1, 1);
    const lastMonthEnd = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 0);
    const lastMonthRevenue = invoices
      .filter(inv => inv.status === 'paid' && 
        new Date(inv.paid_at || inv.created_at) >= lastMonth && 
        new Date(inv.paid_at || inv.created_at) <= lastMonthEnd)
      .reduce((sum, inv) => sum + inv.total_price, 0);
    
    const averageInvoice = paidInvoices > 0 ? totalRevenue / paidInvoices : 0;
    
    return {
      totalInvoices,
      pendingInvoices,
      paidInvoices,
      totalRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      averageInvoice
    };
  }, [invoices]);

  // Filter and search invoices
  const filteredInvoices = React.useMemo(() => {
    let filtered = [...invoices];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(invoice => {
        const userProfile = userProfiles?.[invoice.user_id];
        const studentName = userProfile?.full_name?.toLowerCase() || userProfile?.email?.toLowerCase() || '';
        const transferredFrom = invoice.transferred_from?.toLowerCase() || '';
        
        return studentName.includes(query) || transferredFrom.includes(query);
      });
    }

    // Apply item type filter
    if (selectedItemType !== 'all') {
      filtered = filtered.filter(invoice => invoice.item_type === selectedItemType);
    }

    // Apply payment type filter
    if (selectedPaymentType !== 'all') {
      filtered = filtered.filter(invoice => invoice.payment_type === selectedPaymentType);
    }

    return filtered;
  }, [invoices, searchQuery, selectedItemType, selectedPaymentType, userProfiles]);

  // Sort invoices: pending first, then by creation date
  const sortedInvoices = filteredInvoices.sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentTypeIcon = (paymentType: Invoice['payment_type']) => {
    switch (paymentType) {
      case 'vodafone_cash':
        return '💳';
      case 'credit_card':
        return '💳';
      case 'bank_transfer':
        return '🏦';
      case 'wallet':
        return '💰';
      default:
        return '💳';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <TeacherInvoicesSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          <TeacherPageHeader
            title={t('invoices.page.title')}
            subtitle={t('invoices.page.subtitle')}
            actionLabel={t('invoices.page.createInvoice')}
            onAction={() => setIsCreateModalOpen(true)}
            actionIcon={<Plus className="h-4 w-4 mr-2" />}
            actionButtonProps={{ className: 'btn-primary' }}
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Invoices */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('invoices.stats.totalInvoices')}
                    </p>
                    <p className="text-2xl font-bold">{stats.totalInvoices}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Invoices */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('invoices.stats.pendingInvoices')}
                    </p>
                    <p className="text-2xl font-bold text-amber-600">{stats.pendingInvoices}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Paid Invoices */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('invoices.stats.paidInvoices')}
                    </p>
                    <p className="text-2xl font-bold text-green-600">{stats.paidInvoices}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Revenue */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('invoices.stats.totalRevenue')}
                    </p>
                    <p className="text-2xl font-bold text-emerald-600">
                      ${stats.totalRevenue.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('invoices.stats.thisMonth')}: ${stats.thisMonthRevenue.toFixed(2)}
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder={t('invoices.search.placeholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    {t('invoices.filters.title')}
                  </Button>
                </div>

                {/* Filters */}
                {showFilters && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                    {/* Item Type Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('invoices.filters.itemType')}</label>
                      <Select value={selectedItemType} onValueChange={setSelectedItemType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('invoices.filters.allItems')}</SelectItem>
                          <SelectItem value="course">{t('invoices.filters.courses')}</SelectItem>
                          <SelectItem value="chapter">{t('invoices.filters.chapters')}</SelectItem>
                          <SelectItem value="lesson">{t('invoices.filters.lessons')}</SelectItem>
                          <SelectItem value="quiz">{t('invoices.filters.quizzes')}</SelectItem>
                          <SelectItem value="credits">{t('invoices.filters.credits')}</SelectItem>
                          <SelectItem value="ai_minutes">{t('invoices.filters.aiMinutes')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Payment Type Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('invoices.filters.paymentType')}</label>
                      <Select value={selectedPaymentType} onValueChange={setSelectedPaymentType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('invoices.filters.allPayments')}</SelectItem>
                          <SelectItem value="vodafone_cash">{t('invoices.filters.vodafoneCash')}</SelectItem>
                          <SelectItem value="credit_card">{t('invoices.filters.creditCard')}</SelectItem>
                          <SelectItem value="bank_transfer">{t('invoices.filters.bankTransfer')}</SelectItem>
                          <SelectItem value="wallet">{t('invoices.filters.wallet')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Clear Filters */}
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedItemType('all');
                          setSelectedPaymentType('all');
                        }}
                        className="w-full"
                      >
                        <XIcon className="h-4 w-4 mr-2" />
                        {t('invoices.filters.clearAll')}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Results Summary */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {sortedInvoices.length === invoices.length 
                      ? t('invoices.results.showingAll', { count: invoices.length })
                      : t('invoices.results.showingFiltered', { filtered: sortedInvoices.length, total: invoices.length })
                    }
                  </span>
                  {(searchQuery || selectedItemType !== 'all' || selectedPaymentType !== 'all') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedItemType('all');
                        setSelectedPaymentType('all');
                      }}
                      className="text-xs"
                    >
                      {t('invoices.results.clearFilters')}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                {t('invoices.page.invoices')} ({sortedInvoices.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {sortedInvoices.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-muted-foreground">
                  <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                  <p className="text-sm sm:text-base">{t('invoices.page.noInvoicesFound')}</p>
                  <p className="text-xs sm:text-sm">{t('invoices.page.createFirstInvoice')}</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {sortedInvoices.map((invoice) => {
                    const item = invoiceItems?.[`${invoice.item_id}-${invoice.item_type}`];
                    const userProfile = userProfiles?.[invoice.user_id];
                    
                    return (
                      <div key={invoice.id} className="border rounded-lg p-3 sm:p-4 space-y-3">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                              <Badge variant="outline" className={`${getStatusColor(invoice.status)} text-xs sm:text-sm`}>
                                {t(`invoices.status.${invoice.status}`)}
                              </Badge>
                              <span className="text-xs sm:text-sm text-muted-foreground">
                                #{invoice.invoice_number}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-xs sm:text-sm truncate">
                                  {userProfile?.full_name || userProfile?.email || 'Unknown User'}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-xs sm:text-sm truncate">
                                  {item?.title || 'Unknown Item'} ({invoice.item_type})
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-xs sm:text-sm font-medium">
                                  ${invoice.total_price.toFixed(2)}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-xs sm:text-sm">
                                  {format(new Date(invoice.created_at), 'MMM dd, yyyy')}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs sm:text-sm text-muted-foreground">Payment:</span>
                              <span className="text-xs sm:text-sm">
                                {getPaymentTypeIcon(invoice.payment_type)} {invoice.payment_type.replace('_', ' ')}
                              </span>
                            </div>
                            
                            {invoice.transferred_from && (
                              <div className="flex items-center gap-2 mt-1">
                                <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-xs sm:text-sm text-muted-foreground">From:</span>
                                <span className="text-sm sm:text-md md:text-lg lg:text-xl font-mono bg-muted/50 px-2 py-1 rounded">
                                  {invoice.transferred_from}
                                </span>
                              </div>
                            )}
                            
                            {invoice.notes && (
                              <div className="mt-2">
                                <span className="text-xs sm:text-sm text-muted-foreground">Notes: </span>
                                <span className="text-xs sm:text-sm break-words">{invoice.notes}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <Select
                              value={invoice.status}
                              onValueChange={(value: Invoice['status']) => 
                                handleStatusChange(invoice.id, value)
                              }
                            >
                              <SelectTrigger className="w-full sm:w-32 text-xs sm:text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">{t('invoices.status.pending')}</SelectItem>
                                <SelectItem value="paid">{t('invoices.status.paid')}</SelectItem>
                                <SelectItem value="cancelled">{t('invoices.status.cancelled')}</SelectItem>
                                <SelectItem value="refunded">{t('invoices.status.refunded')}</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            {invoice.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleStatusChange(invoice.id, 'paid')}
                                  className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  {t('invoices.actions.confirm')}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleStatusChange(invoice.id, 'cancelled')}
                                  className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  {t('invoices.actions.decline')}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>

      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onInvoiceCreated={handleInvoiceCreated}
      />
    </>
  );
};
