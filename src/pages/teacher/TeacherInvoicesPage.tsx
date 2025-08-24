import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TeacherPageHeader } from '@/components/teacher/TeacherPageHeader';
import { CreateInvoiceModal } from '@/components/invoices/CreateInvoiceModal';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Check, X, DollarSign, Calendar, User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { enrollStudentFromInvoice } from '@/utils/enrollmentUtils';
import { TeacherInvoicesSkeleton } from '@/components/ui/skeletons';

interface Invoice {
  id: string;
  user_id: string;
  instructor_id: string;
  item_id: string;
  item_type: 'course' | 'chapter' | 'lesson' | 'quiz';
  total_price: number;
  payment_type: 'vodafone_cash' | 'credit_card' | 'bank_transfer' | 'wallet';
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  invoice_number: string;
  payment_reference?: string;
  notes?: string;
  created_at: string;
  paid_at?: string;
  updated_at: string;
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
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

      // If status is being changed to 'paid', automatically enroll the student
      if (status === 'paid') {
        try {
          console.log('Attempting to enroll student:', {
            studentId: invoice.user_id,
            itemId: invoice.item_id,
            itemType: invoice.item_type
          });

          const enrollmentResult = await enrollStudentFromInvoice(
            invoice.user_id,
            invoice.item_id,
            invoice.item_type
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

  // Sort invoices: pending first, then by creation date
  const sortedInvoices = [...invoices].sort((a, b) => {
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
            title="Invoice Management"
            subtitle="Manage and track all your course invoices"
            actionLabel="Create Invoice"
            onAction={() => setIsCreateModalOpen(true)}
            actionIcon={<Plus className="h-4 w-4 mr-2" />}
            actionButtonProps={{ className: 'btn-primary' }}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoices ({sortedInvoices.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedInvoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No invoices found</p>
                  <p className="text-sm">Create your first invoice to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedInvoices.map((invoice) => {
                    const item = invoiceItems?.[`${invoice.item_id}-${invoice.item_type}`];
                    const userProfile = userProfiles?.[invoice.user_id];
                    
                    return (
                      <div key={invoice.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="outline" className={getStatusColor(invoice.status)}>
                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                #{invoice.invoice_number}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {userProfile?.full_name || userProfile?.email || 'Unknown User'}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {item?.title || 'Unknown Item'} ({invoice.item_type})
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  ${invoice.total_price.toFixed(2)}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {format(new Date(invoice.created_at), 'MMM dd, yyyy')}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-sm text-muted-foreground">Payment:</span>
                              <span className="text-sm">
                                {getPaymentTypeIcon(invoice.payment_type)} {invoice.payment_type.replace('_', ' ')}
                              </span>
                            </div>
                            
                            {invoice.notes && (
                              <div className="mt-2">
                                <span className="text-sm text-muted-foreground">Notes: </span>
                                <span className="text-sm">{invoice.notes}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <Select
                              value={invoice.status}
                              onValueChange={(value: Invoice['status']) => 
                                handleStatusChange(invoice.id, value)
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            {invoice.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleStatusChange(invoice.id, 'paid')}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  
                                  onClick={() => handleStatusChange(invoice.id, 'cancelled')}
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Decline
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
