
import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useInvoices, InvoiceItem, SystemPurchaseItem } from '@/hooks/useInvoices';
import { useTeacherPaymentData } from '@/hooks/useTeacherPaymentData';
import { SEOHead } from '@/components/seo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Copy, 
  CreditCard, 
  User, 
  Calendar, 
  Receipt, 
  Phone, 
  Building2, 
  Wallet,
  Banknote,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Download,
  Share2,
  Eye,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/hooks/useI18n';
import { format } from 'date-fns';
import { PaymentData } from '@/types/payment';

const InvoiceDetailPage = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const { toast } = useToast();
  const { t } = useI18n('other');
  const { useInvoiceQuery, useInvoiceItemQuery, useUpdateTransferredFrom } = useInvoices();
  const [transferredFrom, setTransferredFrom] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { data: invoice, isLoading: invoiceLoading, error: invoiceError } = useInvoiceQuery(invoiceId || '');
  const { data: item, isLoading: itemLoading, error: itemError } = useInvoiceItemQuery(
    invoice?.item_id || null,
    invoice?.item_type || 'placeholder',
    invoice
  );
  const { data: teacherPaymentData } = useTeacherPaymentData(invoice?.instructor_id);
  const updateTransferredFromMutation = useUpdateTransferredFrom();

  // Initialize transferredFrom state when invoice data is loaded
  React.useEffect(() => {
    if (invoice?.transferred_from) {
      setTransferredFrom(invoice.transferred_from);
    }
  }, [invoice?.transferred_from]);

  if (!invoiceId) {
    return <Navigate to="/" replace />;
  }

  // Only show item loading if we have both item_id and item_type
  const shouldShowItemLoading = itemLoading && invoice?.item_type;
  const hasValidItemData = invoice?.item_type && item;
  const isSystemPurchase = invoice?.item_type === 'credits' || invoice?.item_type === 'ai_minutes';

  // Type guard to check if item is a regular item (InvoiceItem)
  const isRegularItem = (item: unknown): item is InvoiceItem => {
    return item !== null && typeof item === 'object' && 'id' in item && 'title' in item;
  };

  // Type guard to check if item is a system purchase (SystemPurchaseItem)
  const isSystemPurchaseItem = (item: unknown): item is SystemPurchaseItem => {
    return item !== null && typeof item === 'object' && 'type' in item && 
           (item as SystemPurchaseItem).type === 'credits' || (item as SystemPurchaseItem).type === 'ai_minutes';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Copied to clipboard successfully.",
    });
  };

  const copyUrlToClipboard = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl);
    toast({
      title: "URL Copied!",
      description: "Invoice URL copied to clipboard successfully.",
    });
  };

  const handleSaveTransferredFrom = async () => {
    if (!invoiceId || !transferredFrom.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number or account number.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateTransferredFromMutation.mutateAsync({
        invoiceId,
        transferredFrom: transferredFrom.trim(),
      });
    } catch (error) {
      console.error('Error saving transferred from:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400';
      case 'pending':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400';
      case 'cancelled':
        return 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400';
      case 'refunded':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'refunded':
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return '📚';
      case 'chapter':
        return '📖';
      case 'lesson':
        return '📝';
      case 'quiz':
        return '🧩';
      case 'credits':
        return '💳';
      case 'ai_minutes':
        return '🤖';
      default:
        return '📄';
    }
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'course':
        return 'Course';
      case 'chapter':
        return 'Chapter';
      case 'lesson':
        return 'Lesson';
      case 'quiz':
        return 'Quiz';
      case 'credits':
        return 'Credits Package';
      case 'ai_minutes':
        return 'AI Assistant Minutes';
      default:
        return 'Item';
    }
  };

  const getSystemPurchaseDetails = () => {
    if (invoice?.item_type === 'credits' && invoice.credits_amount) {
      return {
        title: `Credits Package - ${invoice.credits_amount} Credits`,
        description: `Purchase of ${invoice.credits_amount} platform credits`,
        icon: '💳',
        details: [
          { label: 'Credits Amount', value: `${invoice.credits_amount} credits` },
          { label: 'Package Type', value: 'System Purchase' }
        ]
      };
    }
    
    if (invoice?.item_type === 'ai_minutes' && invoice.minutes_amount) {
      return {
        title: `AI Assistant Minutes - ${invoice.minutes_amount} Minutes`,
        description: `Purchase of ${invoice.minutes_amount} AI assistant minutes`,
        icon: '🤖',
        details: [
          { label: 'Minutes Amount', value: `${invoice.minutes_amount} minutes` },
          { label: 'Package Type', value: 'System Purchase' }
        ]
      };
    }
    
    return null;
  };

  const getPaymentTypeInfo = (paymentType: string, totalPrice: number, paymentData?: PaymentData) => {
    switch (paymentType) {
      case 'vodafone_cash': {
        const vodafoneData = paymentData?.vodafone_cash;
        const phoneNumber = vodafoneData?.phone_number || '01226102013'; // Fallback to default
        return {
          title: t('invoices.detailPage.paymentTypes.vodafoneCash.title'),
          icon: <Phone className="w-5 h-5" />,
          color: 'border-blue-500/20 bg-blue-500/5',
          instructions: [
            t('invoices.detailPage.paymentSteps.vodafoneCash.0'),
            t('invoices.detailPage.paymentSteps.vodafoneCash.1', { amount: totalPrice, phoneNumber }),
            t('invoices.detailPage.paymentSteps.vodafoneCash.2'),
            t('invoices.detailPage.paymentSteps.vodafoneCash.3')
          ],
          phoneNumber,
          warning: t('invoices.detailPage.warnings.vodafoneCash', { amount: totalPrice })
        };
      }
      case 'fawry': {
        const fawryData = paymentData?.fawry;
        const merchantCode = fawryData?.merchant_code || '12345'; // Fallback to default
        return {
          title: t('invoices.detailPage.paymentTypes.fawry.title'),
          icon: <Building2 className="w-5 h-5" />,
          color: 'border-orange-500/20 bg-orange-500/5',
          instructions: [
            t('invoices.detailPage.paymentSteps.fawry.0'),
            t('invoices.detailPage.paymentSteps.fawry.1', { amount: totalPrice }),
            t('invoices.detailPage.paymentSteps.fawry.2', { reference: invoice?.invoice_number || 'N/A' }),
            t('invoices.detailPage.paymentSteps.fawry.3')
          ],
          reference: invoice?.invoice_number || 'N/A',
          merchantCode,
          warning: t('invoices.detailPage.warnings.fawry')
        };
      }
      case 'bank_transfer': {
        const bankData = paymentData?.bank_transfer;
        const accountNumber = bankData?.account_number || '1000 1234 5678 9012'; // Fallback to default
        const bankName = bankData?.bank_name || 'CIB'; // Fallback to default
        return {
          title: t('invoices.detailPage.paymentTypes.bankTransfer.title'),
          icon: <Banknote className="w-5 h-5" />,
          color: 'border-green-500/20 bg-green-500/5',
          instructions: [
            t('invoices.detailPage.paymentSteps.bankTransfer.0'),
            t('invoices.detailPage.paymentSteps.bankTransfer.1', { account: accountNumber }),
            t('invoices.detailPage.paymentSteps.bankTransfer.2', { amount: totalPrice }),
            t('invoices.detailPage.paymentSteps.bankTransfer.3', { reference: invoice?.invoice_number || 'N/A' })
          ],
          accountInfo: `${bankName}: ${accountNumber}`,
          warning: t('invoices.detailPage.warnings.bankTransfer')
        };
      }
      case 'credit_card':
        return {
          title: t('invoices.detailPage.paymentTypes.creditCard.title'),
          icon: <CreditCard className="w-5 h-5" />,
          color: 'border-purple-500/20 bg-purple-500/5',
          instructions: [
            t('invoices.detailPage.paymentSteps.creditCard.0'),
            t('invoices.detailPage.paymentSteps.creditCard.1'),
            t('invoices.detailPage.paymentSteps.creditCard.2'),
            t('invoices.detailPage.paymentSteps.creditCard.3')
          ],
          action: t('invoices.detailPage.paymentTypes.creditCard.payNow'),
          warning: t('invoices.detailPage.warnings.creditCard')
        };
      default:
        return {
          title: t('invoices.detailPage.paymentTypes.other.title'),
          icon: <Wallet className="w-5 h-5" />,
          color: 'border-gray-500/20 bg-gray-500/5',
          instructions: [
            t('invoices.detailPage.paymentSteps.other.0'),
            t('invoices.detailPage.paymentSteps.other.1', { reference: invoice?.invoice_number || 'N/A' }),
            t('invoices.detailPage.paymentSteps.other.2', { amount: totalPrice })
          ],
          reference: invoice?.invoice_number || 'N/A',
          warning: t('invoices.detailPage.warnings.other')
        };
    }
  };

  if (invoiceLoading || shouldShowItemLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-muted rounded-lg"></div>
              <div className="h-96 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (invoiceError || !invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">{t('invoices.detailPage.errors.invoiceNotFound')}</h1>
          <p className="text-muted-foreground">{t('invoices.detailPage.errors.invoiceNotFoundDescription')}</p>
        </div>
      </div>
    );
  }

  // Ensure we have valid invoice data before proceeding
  if (!invoice.item_type) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">{t('invoices.detailPage.errors.invalidInvoice')}</h1>
          <p className="text-muted-foreground">{t('invoices.detailPage.errors.invalidInvoiceDescription')}</p>
        </div>
      </div>
    );
  }

  const paymentInfo = getPaymentTypeInfo(invoice.payment_type || 'vodafone_cash', invoice.total_price, teacherPaymentData);

  return (
    <>
      <SEOHead 
        contentTitle={`Invoice #${invoice?.invoice_number || invoiceId}`}
        contentDescription={`Invoice for ${item?.title || 'course content'} - ${invoice?.total_price} EGP - Status: ${invoice?.status}`}
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6 pt-28">
        <div className="max-w-7xl mx-auto space-y-6">
                 {/* Enhanced Premium Header with Item Cover Background */}
         <div className="relative overflow-hidden rounded-2xl border border-primary/20 p-4 sm:p-6 lg:p-8 min-h-[200px] sm:min-h-[250px]">
           {/* Background Image or Gradient Fallback */}
           {hasValidItemData && isRegularItem(item) && item.thumbnail ? (
             <div 
               className="absolute inset-0 bg-cover bg-center bg-no-repeat"
               style={{ backgroundImage: `url(${item.thumbnail})` }}
             >
               <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div>
             </div>
           ) : (
             <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5"></div>
           )}
           
           {/* Overlay gradient for better text readability */}
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
           
           {/* Content */}
           <div className="relative z-10 h-full flex flex-col justify-between">
             {/* Top Section - Item Title and Actions */}
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
               <div className="flex-1">
                 <div className="flex items-center gap-3 mb-3">
                   <span className="text-2xl sm:text-3xl">{getItemTypeIcon(invoice.item_type)}</span>
                   <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                     {getItemTypeLabel(invoice.item_type)}
                   </Badge>
                 </div>
                 <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight">
                   {hasValidItemData && isRegularItem(item) ? item.title : 
                    hasValidItemData && isSystemPurchaseItem(item) ? item.title :
                    `Invoice #${invoice.invoice_number}`}
                 </h1>
               </div>
               
               <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                 <Badge className={`${getStatusColor(invoice.status)} border px-4 py-2 text-sm font-medium w-fit bg-white/10 backdrop-blur-sm`}>
                   <div className="flex items-center gap-2">
                     {getStatusIcon(invoice.status)}
                     <span className="hidden sm:inline">{t(`invoices.detailPage.status.${invoice.status}`)}</span>
                     <span className="sm:hidden">{t(`invoices.detailPage.status.${invoice.status}`)}</span>
                   </div>
                 </Badge>
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={copyUrlToClipboard}
                   className="flex-1 sm:flex-none bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                 >
                   <Share2 className="w-4 h-4 mr-2" />
                   <span className="hidden sm:inline">Copy Link</span>
                   <span className="sm:hidden">Share</span>
                 </Button>
               </div>
             </div>

             {/* Bottom Section - Key Information Cards */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
               {/* Total Amount - Most Important */}
               <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                 <div className="flex items-center gap-2 mb-2">
                   <Receipt className="w-4 h-4 text-white/80" />
                   <span className="text-sm font-medium text-white/80">Total Amount</span>
                 </div>
                 <p className="text-xl sm:text-2xl font-bold text-white">{invoice.total_price} EGP</p>
               </div>

               {/* Payment Type */}
               <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                 <div className="flex items-center gap-2 mb-2">
                   <div className="text-white/80">{paymentInfo.icon}</div>
                   <span className="text-sm font-medium text-white/80">Payment Method</span>
                 </div>
                 <p className="text-sm font-semibold text-white capitalize">{invoice.payment_type.replace('_', ' ')}</p>
               </div>
             </div>
           </div>
         </div>

        {/* Payment Instructions Section */}
        {invoice.status === 'pending' && (
          <Card className={`border-0 shadow-lg ${paymentInfo.color} backdrop-blur-sm`}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-current/10">
                  {paymentInfo.icon}
                </div>
                {paymentInfo.title} {t('invoices.detailPage.sections.paymentInstructions')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Details */}
              <div className="bg-card/50 p-4 rounded-xl border border-border/50">
                <div className="space-y-4">
                  {paymentInfo.phoneNumber && (
                    <div className="space-y-4">
                      {/* Vodafone Number Display */}
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-3">{t('invoices.detailPage.paymentTypes.vodafoneCash.sendPaymentTo')}</p>
                        <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-2 border-blue-500/30 rounded-xl p-4">
                          <div className="space-y-3">
                            <p className="text-2xl sm:text-3xl font-mono font-bold text-blue-600 dark:text-blue-400 break-all leading-tight">
                              {paymentInfo.phoneNumber}
                            </p>
                            <p className="text-sm text-muted-foreground">{t('invoices.detailPage.paymentTypes.vodafoneCash.vodafoneCashNumber')}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(paymentInfo.phoneNumber || '')}
                              className="bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 text-blue-600 hover:text-blue-700"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              {t('invoices.detailPage.actions.copyNumber')}
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Transferred From Input Field */}
                      <div className="bg-muted/30 border border-border/50 rounded-xl p-4">
                        <div className="space-y-3">
                          <div className="text-center">
                            <Label htmlFor="transferredFrom" className="text-sm font-medium text-foreground">
                              {t('invoices.detailPage.paymentTypes.vodafoneCash.enterYourNumber')}
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              {t('invoices.detailPage.paymentTypes.vodafoneCash.enterYourNumberDescription')}
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <Input
                              id="transferredFrom"
                              type="tel"
                              placeholder={t('invoices.detailPage.paymentTypes.vodafoneCash.phoneNumberPlaceholder')}
                              value={transferredFrom}
                              onChange={(e) => setTransferredFrom(e.target.value)}
                              className="h-10 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                              disabled={isSaving}
                            />
                            <Button
                              onClick={handleSaveTransferredFrom}
                              disabled={isSaving || !transferredFrom.trim()}
                              size="sm"
                              className="w-full"
                            >
                              {isSaving ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="w-4 h-4 mr-2" />
                                  {t('invoices.detailPage.actions.save')}
                                </>
                              )}
                            </Button>
                          </div>
                          
                          {invoice?.transferred_from && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  {t('invoices.detailPage.paymentTypes.vodafoneCash.savedNumber', { number: invoice.transferred_from })}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {paymentInfo.accountInfo && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">{t('invoices.detailPage.paymentTypes.bankTransfer.accountInformation')}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-mono font-bold text-foreground break-all">{paymentInfo.accountInfo}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(paymentInfo.accountInfo || '')}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          {t('invoices.detailPage.actions.copy')}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {paymentInfo.reference && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Reference Number:</p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-mono font-bold text-foreground break-all">{paymentInfo.reference}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(paymentInfo.reference || '')}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          {t('invoices.detailPage.actions.copy')}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {paymentInfo.action && (
                    <div>
                      <Button className="w-full" size="lg">
                        {paymentInfo.action}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <Separator />
              
              {/* Payment Steps */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground text-lg">{t('invoices.detailPage.paymentSteps.title')}</h4>
                <ol className="space-y-3">
                  {paymentInfo.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                        {index + 1}
                      </div>
                      <p className="text-muted-foreground">{instruction}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Warning */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  ⚠️ <strong>{t('invoices.detailPage.important')}</strong> {paymentInfo.warning}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Two Column Layout - Invoice Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Invoice Information */}
          <div className="space-y-6">
            {/* Invoice Details Card */}
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Receipt className="w-5 h-5 text-primary" />
                  </div>
                  {t('invoices.detailPage.sections.invoiceInformation')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">{t('invoices.detailPage.fields.invoiceNumber')}</label>
                      <p className="text-foreground font-mono text-lg font-semibold">{invoice.invoice_number}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(invoice.invoice_number)}
                      className="hover:bg-primary/10"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-muted/30">
                    <label className="text-sm font-medium text-muted-foreground">{t('invoices.detailPage.fields.totalAmount')}</label>
                    <p className="text-3xl font-bold text-primary mt-1">{invoice.total_price} EGP</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 rounded-lg bg-muted/30">
                      <label className="text-sm font-medium text-muted-foreground">{t('invoices.detailPage.fields.createdDate')}</label>
                      <p className="text-foreground mt-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {format(new Date(invoice.created_at), 'PPP')}
                      </p>
                    </div>
                    
                    {invoice.paid_at && (
                      <div className="p-4 rounded-lg bg-muted/30">
                        <label className="text-sm font-medium text-muted-foreground">{t('invoices.detailPage.fields.paidDate')}</label>
                        <p className="text-foreground mt-1 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {format(new Date(invoice.paid_at), 'PPP')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Reference Card */}
            {invoice.payment_reference && (
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">{t('invoices.detailPage.sections.paymentReference')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <p className="font-mono text-foreground text-lg">{invoice.payment_reference}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(invoice.payment_reference || '')}
                      className="hover:bg-primary/10"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Item Information */}
          <div className="space-y-6">
            {/* Item Details Card */}
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <span className="text-3xl">{getItemTypeIcon(invoice.item_type)}</span>
                  {t('invoices.detailPage.sections.itemDetails')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasValidItemData ? (
                  <div className="space-y-4">
                    {/* Handle system purchases (credits and AI minutes) */}
                    {isSystemPurchase && isSystemPurchaseItem(item) && (
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="w-full h-32 sm:h-40 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                            <span className="text-6xl">{item.icon}</span>
                          </div>
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-black/50 text-white border-0 text-xs">
                              {getItemTypeLabel(invoice.item_type)}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-lg sm:text-xl font-bold text-foreground">{item.title}</h3>
                          <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                            <div className="p-3 rounded-lg bg-muted/30">
                              <p className="text-sm text-muted-foreground">Amount</p>
                              <p className="font-semibold text-foreground">{item.amount} {item.unit}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/30">
                              <p className="text-sm text-muted-foreground">Package Type</p>
                              <p className="font-semibold text-foreground">System Purchase</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Handle regular items (courses, chapters, lessons, quizzes) */}
                    {!isSystemPurchase && isRegularItem(item) && (
                      <div className="space-y-4">
                        {item.thumbnail && (
                          <div className="relative">
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-full h-32 sm:h-40 rounded-xl object-cover shadow-lg"
                            />
                            <div className="absolute top-2 right-2">
                              <Badge variant="secondary" className="bg-black/50 text-white border-0 text-xs">
                                {getItemTypeLabel(invoice.item_type)}
                              </Badge>
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <h3 className="text-lg sm:text-xl font-bold text-foreground">{item.title}</h3>
                          
                          {item.description && (
                            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">{item.description}</p>
                          )}
                          
                          {item.instructor && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                                  {item.instructor.full_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-foreground text-sm">{t('invoices.detailPage.fields.instructor')}</p>
                                <p className="text-xs text-muted-foreground">{item.instructor.full_name}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    {itemError ? (
                      <div className="space-y-3">
                        <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                          <XCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <p className="text-destructive font-medium">{t('invoices.detailPage.errors.itemLoadError')}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('invoices.detailPage.errors.itemLoadErrorDescription')}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                          <Eye className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">
                          {t('invoices.detailPage.errors.itemNotAvailable')}
                        </p>
                        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                          {invoice.item_id && <p>Item ID: {invoice.item_id}</p>}
                          <p>Type: {invoice.item_type}</p>
                          {invoice.credits_amount && <p>Credits: {invoice.credits_amount}</p>}
                          {invoice.minutes_amount && <p>Minutes: {invoice.minutes_amount}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default InvoiceDetailPage;
