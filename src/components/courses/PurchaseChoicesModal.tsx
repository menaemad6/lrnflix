import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useInvoices } from '@/hooks/useInvoices';
import { supabase } from '@/integrations/supabase/client';
import { HiddenScrollbar } from '@/components/ui/hidden-scrollbar';
import { 
  Wallet, 
  CreditCard, 
  Phone, 
  Banknote, 
  ArrowRight,
  Receipt,
  CheckCircle,
  Clock,
  User,
  BookOpen,
  Zap,
  MessageSquare
} from 'lucide-react';

interface PurchaseChoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id?: string; // Optional for system purchases
    title: string;
    price: number;
    instructor_id?: string; // Optional for system purchases
    type?: 'course' | 'chapter' | 'lesson' | 'quiz' | 'credits' | 'ai_minutes';
    credits_amount?: number; // For credits packages
    minutes_amount?: number; // For AI minutes packages
  };
  onWalletSelected?: () => void; // Optional callback for wallet payment
  showWalletPayment?: boolean; // Control whether wallet payment is shown
}

export const PurchaseChoicesModal = ({ 
  isOpen, 
  onClose, 
  item, 
  onWalletSelected,
  showWalletPayment = true
}: PurchaseChoicesModalProps) => {
  const { toast } = useToast();
  const { t } = useTranslation('other');
  const navigate = useNavigate();
  const { useCreateInvoice } = useInvoices();
  const createInvoiceMutation = useCreateInvoice();
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    ...(showWalletPayment ? [{
      id: 'wallet',
      name: t('invoices.paymentMethods.wallet.name'),
      description: t('invoices.paymentMethods.wallet.description'),
      icon: Wallet,
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-50',
      darkBgColor: 'dark:bg-blue-900/20'
    }] : []),
    {
      id: 'vodafone_cash',
      name: t('invoices.paymentMethods.vodafoneCash.name'),
      description: t('invoices.paymentMethods.vodafoneCash.description'),
      icon: Phone,
      color: 'bg-red-500',
      textColor: 'text-red-500',
      borderColor: 'border-red-500',
      bgColor: 'bg-red-50',
      darkBgColor: 'dark:bg-red-900/20'
    },
    {
      id: 'credit_card',
      name: t('invoices.paymentMethods.creditCard.name'),
      description: t('invoices.paymentMethods.creditCard.description'),
      icon: CreditCard,
      color: 'bg-green-500',
      textColor: 'text-green-500',
      borderColor: 'border-green-500',
      bgColor: 'bg-green-50',
      darkBgColor: 'dark:bg-green-900/20'
    },
    {
      id: 'bank_transfer',
      name: t('invoices.paymentMethods.bankTransfer.name'),
      description: t('invoices.paymentMethods.bankTransfer.description'),
      icon: Banknote,
      color: 'bg-purple-500',
      textColor: 'text-purple-500',
      borderColor: 'border-purple-500',
      bgColor: 'bg-purple-50',
      darkBgColor: 'dark:bg-purple-900/20'
    }
  ];

  const handlePaymentMethodSelect = async (methodId: string) => {
    if (methodId === 'wallet' && onWalletSelected) {
      // Open the current PurchaseModal for wallet payment
      onWalletSelected();
      onClose();
      return;
    }

    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('invoices.notifications.authenticationRequired'),
          description: t('invoices.notifications.authenticationDescription'),
          variant: 'destructive',
        });
        return;
      }

      // Create invoice for the selected payment method
      const invoiceData = {
        user_id: user.id,
        instructor_id: item.instructor_id,
        item_id: item.id,
        item_type: item.type || 'course' as const,
        total_price: item.price,
        payment_type: methodId as 'vodafone_cash' | 'credit_card' | 'bank_transfer',
        status: 'pending' as const,
        notes: `Purchase of ${item.title}`,
        credits_amount: item.credits_amount,
        minutes_amount: item.minutes_amount
      };

      const invoice = await createInvoiceMutation.mutateAsync(invoiceData);

      if (invoice) {
        toast({
          title: t('invoices.notifications.invoiceCreated'),
          description: t('invoices.notifications.invoiceCreatedDescription'),
        });

        // Redirect to invoice detail page
        navigate(`/invoices/${invoice.id}`);
        onClose();
      }
    } catch (error: unknown) {
      console.error('Error creating invoice:', error);
      const errorMessage = error instanceof Error ? error.message : t('invoices.notifications.errorDescription');
      toast({
        title: t('invoices.notifications.error'),
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getItemIcon = () => {
    switch (item.type) {
      case 'credits':
        return <Zap className="h-6 w-6 text-yellow-500" />;
      case 'ai_minutes':
        return <MessageSquare className="h-6 w-6 text-blue-500" />;
      case 'course':
        return <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
      case 'chapter':
        return <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />;
      case 'lesson':
        return <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />;
      case 'quiz':
        return <BookOpen className="h-6 w-6 text-orange-600 dark:text-orange-400" />;
      default:
        return <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getItemDetails = () => {
    if (item.type === 'credits' && item.credits_amount) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4" />
            <span>Credits: {item.credits_amount}</span>
          </div>
        </div>
      );
    }
    
    if (item.type === 'ai_minutes' && item.minutes_amount) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>Minutes: {item.minutes_amount}</span>
          </div>
        </div>
      );
    }

    // Regular item details
    return (
      <>
        {item.instructor_id && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{t('invoices.ui.instructorId')}: {item.instructor_id}</span>
          </div>
        )}
        {item.id && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{t('invoices.ui.courseId')}: {item.id}</span>
          </div>
        )}
      </>
    );
  };

  const getItemTypeLabel = () => {
    switch (item.type) {
      case 'credits':
        return 'CREDITS PACKAGE';
      case 'ai_minutes':
        return 'AI MINUTES';
      case 'course':
        return 'COURSE';
      case 'chapter':
        return 'CHAPTER';
      case 'lesson':
        return 'LESSON';
      case 'quiz':
        return 'QUIZ';
      default:
        return 'ITEM';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Receipt className="h-6 w-6" />
            {t('invoices.choosePaymentMethod')}
          </DialogTitle>
        </DialogHeader>
        
        <HiddenScrollbar maxHeight="calc(90vh - 200px)" className="px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
            {/* Left Column - Payment Methods */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-muted-foreground">
                {t('invoices.title')}
              </h3>
              
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handlePaymentMethodSelect(method.id)}
                    disabled={loading}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${
                      method.bgColor
                    } ${method.darkBgColor} ${method.borderColor} hover:shadow-lg hover:shadow-black/5`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${method.color} text-white shadow-sm`}>
                        <method.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold text-foreground">{method.name}</h4>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                      <ArrowRight className={`h-5 w-5 ${method.textColor} transition-transform group-hover:translate-x-1`} />
                    </div>
                  </button>
                ))}
              </div>


            </div>

            {/* Right Column - Item Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-muted-foreground">
                {item.type === 'credits' || item.type === 'ai_minutes' 
                  ? t('invoices.packageInfo') 
                  : t('invoices.courseInfo')
                }
              </h3>
              
              <div className="space-y-4">
                {/* Item Card */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      {getItemIcon()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2">
                        {item?.title}
                      </h3>
                      <div className="space-y-3">
                        {getItemDetails()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Price Badge */}
                  <div className="mt-4 flex justify-center">
                    <Badge variant="outline" className="text-xl px-6 py-3 border-2 font-bold bg-white dark:bg-slate-800">
                      {item?.price} EGP
                    </Badge>
                  </div>
                </div>

                {/* Additional Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-green-800 dark:text-green-200">{t('invoices.ui.instantAccess')}</span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {t('invoices.ui.instantAccessDescription')}
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Receipt className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="font-medium text-purple-800 dark:text-purple-200">{t('invoices.ui.detailedInvoice')}</span>
                    </div>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      {t('invoices.ui.detailedInvoiceDescription')}
                    </p>
                  </div>
                </div>

                {/* Payment Security Info */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="font-medium text-amber-800 dark:text-amber-200">{t('invoices.ui.secureTransaction')}</span>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {t('invoices.ui.secureTransactionDescription')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </HiddenScrollbar>

        {/* Cancel Button */}
        <div className="flex justify-center pt-4 pb-4 border-t border-border bg-background">
          <Button variant="outline" onClick={onClose} disabled={loading} className="px-8">
            {t('invoices.cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
