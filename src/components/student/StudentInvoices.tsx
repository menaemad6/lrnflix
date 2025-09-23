import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Gift,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';

interface StudentInvoice {
  id: string;
  user_id: string;
  instructor_id?: string;
  item_id?: string;
  item_type: 'course' | 'chapter' | 'lesson' | 'quiz' | 'credits' | 'ai_minutes';
  total_price: number;
  payment_type: 'vodafone_cash' | 'credit_card' | 'bank_transfer' | 'wallet';
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  invoice_number: string;
  payment_reference?: string;
  notes?: string;
  transferred_from?: string;
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
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
}

interface StudentInvoicesProps {
  userId: string;
}

export const StudentInvoices: React.FC<StudentInvoicesProps> = ({ userId }) => {
  const { toast } = useToast();
  const { t } = useTranslation('dashboard');
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPaymentType, setFilterPaymentType] = useState<string>('all');
  const [filterItemType, setFilterItemType] = useState<string>('all');
  const [filteredInvoices, setFilteredInvoices] = useState<StudentInvoice[]>([]);

  // Fetch student invoices
  const { data: invoices = [], isLoading, error } = useQuery({
    queryKey: ['student-invoices', userId],
    queryFn: async (): Promise<StudentInvoice[]> => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Fetch invoice items for display
  const { data: invoiceItems } = useQuery({
    queryKey: ['student-invoice-items', invoices.map(i => `${i.item_id}-${i.item_type}`)],
    queryFn: async () => {
      const items: Record<string, InvoiceItem> = {};
      
      for (const invoice of invoices) {
        const item = await fetchInvoiceItem(invoice.item_id, invoice.item_type, invoice);
        if (item) {
          items[`${invoice.item_id}-${invoice.item_type}`] = item;
        }
      }
      
      return items;
    },
    enabled: invoices.length > 0,
  });

  // Fetch instructor profiles for display
  const { data: instructorProfiles } = useQuery({
    queryKey: ['instructor-profiles', invoices.map(i => i.instructor_id).filter(Boolean)],
    queryFn: async () => {
      const profiles: Record<string, UserProfile> = {};
      
      for (const invoice of invoices) {
        if (invoice.instructor_id) {
          const { data } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('id', invoice.instructor_id)
            .single();
          
          if (data) {
            profiles[invoice.instructor_id] = data;
          }
        }
      }
      
      return profiles;
    },
    enabled: invoices.length > 0,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: t('studentInvoices.error'),
        description: t('studentInvoices.failedToLoadInvoices'),
        variant: 'destructive',
      });
    }
  }, [error, toast, t]);

  useEffect(() => {
    let filtered = [...invoices];
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === filterStatus);
    }
    
    // Filter by payment type
    if (filterPaymentType !== 'all') {
      filtered = filtered.filter(invoice => invoice.payment_type === filterPaymentType);
    }
    
    // Filter by item type
    if (filterItemType !== 'all') {
      filtered = filtered.filter(invoice => invoice.item_type === filterItemType);
    }
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(invoice =>
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.payment_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredInvoices(filtered);
  }, [searchTerm, invoices, filterStatus, filterPaymentType, filterItemType]);

  const fetchInvoiceItem = async (itemId: string | null, itemType: string, invoice?: StudentInvoice): Promise<InvoiceItem | null> => {
    // Handle system purchases (credits and AI minutes)
    if (itemType === 'credits' || itemType === 'ai_minutes') {
      let amount = 0;
      if (invoice) {
        if (itemType === 'credits' && invoice.credits_amount) {
          amount = invoice.credits_amount;
        } else if (itemType === 'ai_minutes' && invoice.minutes_amount) {
          amount = invoice.minutes_amount;
        }
      }

      return {
        id: itemId || 'system',
        title: itemType === 'credits' ? 'Credits Package' : 'AI Assistant Minutes',
        description: itemType === 'credits' 
          ? `Purchase ${amount} credits for the platform` 
          : `Purchase ${amount} AI assistant minutes`,
      };
    }

    // Handle regular items (courses, chapters, lessons, quizzes)
    if (!itemId || !itemType || itemId.trim() === '' || itemType.trim() === '') {
      return null;
    }

    let query;
    
    try {
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
        default:
          return null;
      }

      const { data, error } = await query;
      if (error) return null;
      
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        thumbnail: data.cover_image_url,
      };
    } catch (error) {
      console.error('Error fetching invoice item:', error);
      return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'refunded':
        return <RotateCcw className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'refunded':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentTypeIcon = (paymentType: string) => {
    switch (paymentType) {
      case 'vodafone_cash':
        return <Smartphone className="h-4 w-4" />;
      case 'credit_card':
        return <CreditCard className="h-4 w-4" />;
      case 'bank_transfer':
        return <Building2 className="h-4 w-4" />;
      case 'wallet':
        return <Wallet className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getItemTypeIcon = (itemType: string) => {
    switch (itemType) {
      case 'course':
        return <TrendingUp className="h-4 w-4" />;
      case 'chapter':
        return <TrendingDown className="h-4 w-4" />;
      case 'lesson':
        return <FileText className="h-4 w-4" />;
      case 'quiz':
        return <FileText className="h-4 w-4" />;
      case 'credits':
        return <ShoppingCart className="h-4 w-4" />;
      case 'ai_minutes':
        return <Gift className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return t('studentInvoices.paid');
      case 'pending':
        return t('studentInvoices.pending');
      case 'cancelled':
        return t('studentInvoices.cancelled');
      case 'refunded':
        return t('studentInvoices.refunded');
      default:
        return status;
    }
  };

  const getPaymentTypeLabel = (paymentType: string) => {
    switch (paymentType) {
      case 'vodafone_cash':
        return t('studentInvoices.vodafoneCash');
      case 'credit_card':
        return t('studentInvoices.creditCard');
      case 'bank_transfer':
        return t('studentInvoices.bankTransfer');
      case 'wallet':
        return t('studentInvoices.wallet');
      default:
        return paymentType;
    }
  };

  const getItemTypeLabel = (itemType: string) => {
    switch (itemType) {
      case 'course':
        return t('studentInvoices.course');
      case 'chapter':
        return t('studentInvoices.chapter');
      case 'lesson':
        return t('studentInvoices.lesson');
      case 'quiz':
        return t('studentInvoices.quiz');
      case 'credits':
        return t('studentInvoices.credits');
      case 'ai_minutes':
        return t('studentInvoices.aiMinutes');
      default:
        return itemType;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-8 bg-muted rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t('studentInvoices.searchInvoices')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status-filter" className="text-sm font-medium">{t('studentInvoices.filterByStatus')}</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder={t('studentInvoices.allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('studentInvoices.allStatuses')}</SelectItem>
                  <SelectItem value="paid">{t('studentInvoices.paid')}</SelectItem>
                  <SelectItem value="pending">{t('studentInvoices.pending')}</SelectItem>
                  <SelectItem value="cancelled">{t('studentInvoices.cancelled')}</SelectItem>
                  <SelectItem value="refunded">{t('studentInvoices.refunded')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-filter" className="text-sm font-medium">{t('studentInvoices.filterByPayment')}</Label>
              <Select value={filterPaymentType} onValueChange={setFilterPaymentType}>
                <SelectTrigger>
                  <SelectValue placeholder={t('studentInvoices.allPaymentTypes')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('studentInvoices.allPaymentTypes')}</SelectItem>
                  <SelectItem value="vodafone_cash">{t('studentInvoices.vodafoneCash')}</SelectItem>
                  <SelectItem value="credit_card">{t('studentInvoices.creditCard')}</SelectItem>
                  <SelectItem value="bank_transfer">{t('studentInvoices.bankTransfer')}</SelectItem>
                  <SelectItem value="wallet">{t('studentInvoices.wallet')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="item-filter" className="text-sm font-medium">{t('studentInvoices.filterByItem')}</Label>
              <Select value={filterItemType} onValueChange={setFilterItemType}>
                <SelectTrigger>
                  <SelectValue placeholder={t('studentInvoices.allItemTypes')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('studentInvoices.allItemTypes')}</SelectItem>
                  <SelectItem value="course">{t('studentInvoices.course')}</SelectItem>
                  <SelectItem value="chapter">{t('studentInvoices.chapter')}</SelectItem>
                  <SelectItem value="lesson">{t('studentInvoices.lesson')}</SelectItem>
                  <SelectItem value="quiz">{t('studentInvoices.quiz')}</SelectItem>
                  <SelectItem value="credits">{t('studentInvoices.credits')}</SelectItem>
                  <SelectItem value="ai_minutes">{t('studentInvoices.aiMinutes')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('studentInvoices.noInvoicesFound')}</h3>
            <p className="text-muted-foreground">
              {t('studentInvoices.tryAdjustingFilters')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => {
            const item = invoiceItems?.[`${invoice.item_id}-${invoice.item_type}`];
            const instructor = invoice.instructor_id ? instructorProfiles?.[invoice.instructor_id] : null;
            
            return (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Left side - Invoice info */}
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        {getItemTypeIcon(invoice.item_type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg truncate">
                            {item?.title || t('studentInvoices.unknownItem')}
                          </h3>
                           <Badge 
                             variant={getStatusVariant(invoice.status)} 
                             className={`flex items-center gap-1 ${getStatusBadgeClasses(invoice.status)}`}
                           >
                             {getStatusIcon(invoice.status)}
                             {getStatusLabel(invoice.status)}
                           </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">#{invoice.invoice_number}</span>
                            <span>•</span>
                            <span>{format(new Date(invoice.created_at), 'MMM dd, yyyy')}</span>
                          </div>
                          
                          
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              {getPaymentTypeIcon(invoice.payment_type)}
                              <span>{getPaymentTypeLabel(invoice.payment_type)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              <span>{getItemTypeLabel(invoice.item_type)}</span>
                            </div>
                            {instructor && (
                              <div className="flex items-center gap-1">
                                <span>by {instructor.full_name}</span>
                              </div>
                            )}
                          </div>
                          
                          {invoice.payment_reference && (
                            <div className="text-xs">
                              <span className="font-medium">{t('studentInvoices.paymentReference')}: </span>
                              <span>{invoice.payment_reference}</span>
                            </div>
                          )}
                          
                          {invoice.transferred_from && (
                            <div className="text-xs">
                              <span className="font-medium">{t('studentInvoices.transferredFrom')}: </span>
                              <span>{invoice.transferred_from}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                     {/* Right side - Price and actions */}
                     <div className="flex flex-col items-end gap-2">
                       <div className="text-right">
                         <div className="text-2xl font-bold">
                           {invoice.total_price} EGP
                         </div>
                         {invoice.paid_at && (
                           <div className="text-xs text-muted-foreground">
                             {t('studentInvoices.paidOn')} {format(new Date(invoice.paid_at), 'MMM dd, yyyy')}
                           </div>
                         )}
                       </div>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => navigate(`/invoices/${invoice.id}`)}
                         className="flex items-center gap-2"
                       >
                         <Eye className="h-4 w-4" />
                         {t('studentInvoices.viewDetails')}
                       </Button>
                     </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
