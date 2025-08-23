
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Invoice {
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

export interface InvoiceItem {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  instructor?: {
    id: string;
    full_name: string;
  };
}

export const useInvoices = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchInvoices = async (): Promise<Invoice[]> => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const fetchInvoiceById = async (invoiceId: string): Promise<Invoice | null> => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (error) throw error;
    return data;
  };

  const fetchInvoiceItem = async (itemId: string, itemType: string): Promise<InvoiceItem | null> => {
    let query;
    
    switch (itemType) {
      case 'course':
        query = supabase
          .from('courses')
          .select(`
            id,
            title,
            description,
            thumbnail,
            instructor:profiles!courses_instructor_id_fkey(id, full_name)
          `)
          .eq('id', itemId)
          .single();
        break;
      case 'chapter':
        query = supabase
          .from('chapters')
          .select(`
            id,
            title,
            description,
            thumbnail,
            instructor:profiles!chapters_instructor_id_fkey(id, full_name)
          `)
          .eq('id', itemId)
          .single();
        break;
      case 'lesson':
        query = supabase
          .from('lessons')
          .select(`
            id,
            title,
            description,
            course:courses(instructor:profiles!courses_instructor_id_fkey(id, full_name))
          `)
          .eq('id', itemId)
          .single();
        break;
      case 'quiz':
        query = supabase
          .from('quizzes')
          .select(`
            id,
            title,
            description,
            course:courses(instructor:profiles!courses_instructor_id_fkey(id, full_name))
          `)
          .eq('id', itemId)
          .single();
        break;
      default:
        return null;
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Format the data to match InvoiceItem interface
    if (data) {
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail,
        instructor: data.instructor || (data.course?.instructor)
      };
    }
    
    return null;
  };

  const createInvoice = async (invoiceData: Omit<Invoice, 'id' | 'invoice_number' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateInvoiceStatus = async (invoiceId: string, status: Invoice['status'], paymentReference?: string) => {
    const updateData: any = { 
      status,
      ...(status === 'paid' && { paid_at: new Date().toISOString() }),
      ...(paymentReference && { payment_reference: paymentReference })
    };

    const { data, error } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', invoiceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Query hooks
  const useInvoicesQuery = () => {
    return useQuery({
      queryKey: ['invoices'],
      queryFn: fetchInvoices,
    });
  };

  const useInvoiceQuery = (invoiceId: string) => {
    return useQuery({
      queryKey: ['invoice', invoiceId],
      queryFn: () => fetchInvoiceById(invoiceId),
      enabled: !!invoiceId,
    });
  };

  const useInvoiceItemQuery = (itemId: string, itemType: string) => {
    return useQuery({
      queryKey: ['invoice-item', itemId, itemType],
      queryFn: () => fetchInvoiceItem(itemId, itemType),
      enabled: !!itemId && !!itemType,
    });
  };

  // Mutation hooks
  const useCreateInvoice = () => {
    return useMutation({
      mutationFn: createInvoice,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
        toast({
          title: "Invoice Created",
          description: "Invoice has been created successfully.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to create invoice.",
          variant: "destructive",
        });
      },
    });
  };

  const useUpdateInvoiceStatus = () => {
    return useMutation({
      mutationFn: ({ invoiceId, status, paymentReference }: { 
        invoiceId: string; 
        status: Invoice['status']; 
        paymentReference?: string 
      }) => updateInvoiceStatus(invoiceId, status, paymentReference),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
        queryClient.invalidateQueries({ queryKey: ['invoice'] });
        toast({
          title: "Invoice Updated",
          description: "Invoice status has been updated successfully.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to update invoice.",
          variant: "destructive",
        });
      },
    });
  };

  return {
    useInvoicesQuery,
    useInvoiceQuery,
    useInvoiceItemQuery,
    useCreateInvoice,
    useUpdateInvoiceStatus,
  };
};
