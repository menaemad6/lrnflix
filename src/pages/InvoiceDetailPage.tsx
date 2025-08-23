
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useInvoices } from '@/hooks/useInvoices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Copy, CreditCard, User, Calendar, Receipt, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const InvoiceDetailPage = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const { toast } = useToast();
  const { useInvoiceQuery, useInvoiceItemQuery } = useInvoices();

  if (!invoiceId) {
    return <Navigate to="/" replace />;
  }

  const { data: invoice, isLoading: invoiceLoading, error: invoiceError } = useInvoiceQuery(invoiceId);
  const { data: item, isLoading: itemLoading } = useInvoiceItemQuery(
    invoice?.item_id || '',
    invoice?.item_type || ''
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Copied to clipboard successfully.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'refunded':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
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
      default:
        return '📄';
    }
  };

  if (invoiceLoading || itemLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (invoiceError || !invoice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Invoice Not Found</h1>
          <p className="text-muted-foreground">The invoice you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Invoice Details</h1>
            <p className="text-muted-foreground">Invoice #{invoice.invoice_number}</p>
          </div>
          <Badge className={getStatusColor(invoice.status)}>
            {invoice.status.toUpperCase()}
          </Badge>
        </div>

        {/* Invoice Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Invoice Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Invoice Number</label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-foreground font-mono">{invoice.invoice_number}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(invoice.invoice_number)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                <p className="text-2xl font-bold text-foreground mt-1">{invoice.total_price} EGP</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                <p className="text-foreground mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(invoice.created_at), 'PPP')}
                </p>
              </div>
              {invoice.paid_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Paid Date</label>
                  <p className="text-foreground mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(invoice.paid_at), 'PPP')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Item Details Card */}
        {item && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{getItemTypeIcon(invoice.item_type)}</span>
                Item Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                {item.thumbnail && (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground capitalize mb-2">{invoice.item_type}</p>
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                  )}
                  {item.instructor && (
                    <div className="flex items-center gap-2 mt-3">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {item.instructor.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        by {item.instructor.full_name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Details Card */}
        {invoice.status === 'pending' && invoice.payment_type === 'vodafone_cash' && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Phone className="w-5 h-5" />
                Payment Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-card p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-2">Send payment to:</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-mono font-bold text-foreground">01226102013</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard('01226102013')}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Number
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Payment Steps:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Open your Vodafone Cash app</li>
                  <li>Send exactly <strong className="text-foreground">{invoice.total_price} EGP</strong> to <strong className="text-foreground">01226102013</strong></li>
                  <li>Keep the transaction reference number</li>
                  <li>Your instructor will confirm the payment and activate your access</li>
                </ol>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  ⚠️ <strong>Important:</strong> Make sure to send the exact amount ({invoice.total_price} EGP) to avoid delays in processing.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {invoice.payment_reference && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <p className="font-mono text-foreground">{invoice.payment_reference}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(invoice.payment_reference || '')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetailPage;
