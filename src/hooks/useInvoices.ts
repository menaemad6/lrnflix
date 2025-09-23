
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Invoice {
  id: string;
  user_id: string;
  instructor_id?: string; // Made optional for system purchases
  item_id?: string; // Made optional for system purchases
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
  credits_amount?: number; // New field for credits purchases
  minutes_amount?: number; // New field for AI minutes purchases
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

// New interface for system purchases (credits and AI minutes)
export interface SystemPurchaseItem {
  type: 'credits' | 'ai_minutes';
  title: string;
  description: string;
  amount: number;
  unit: string;
  icon: string;
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

  const fetchInvoiceItem = async (itemId: string | null, itemType: string, invoice?: Invoice): Promise<InvoiceItem | SystemPurchaseItem | null> => {
    // Handle system purchases (credits and AI minutes)
    if (itemType === 'credits' || itemType === 'ai_minutes') {
      // Get the actual amounts from the invoice if available
      let amount = 0;
      if (invoice) {
        if (itemType === 'credits' && invoice.credits_amount) {
          amount = invoice.credits_amount;
        } else if (itemType === 'ai_minutes' && invoice.minutes_amount) {
          amount = invoice.minutes_amount;
        }
      }

      return {
        type: itemType,
        title: itemType === 'credits' ? 'Credits Package' : 'AI Assistant Minutes',
        description: itemType === 'credits' 
          ? 'Purchase additional credits for the platform' 
          : 'Purchase additional AI assistant minutes',
        amount: amount,
        unit: itemType === 'credits' ? 'credits' : 'minutes',
        icon: itemType === 'credits' ? '💳' : '🤖'
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
            .select(`
              id,
              title,
              description,
              cover_image_url,
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
              cover_image_url,
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
          console.warn(`Unrecognized item type: ${itemType}`);
          return null;
      }

      const { data, error } = await query;
      if (error) {
        console.error(`Error fetching ${itemType} with ID ${itemId}:`, error);
        return null;
      }
      
      if (!data) {
        console.warn(`No ${itemType} found with ID ${itemId}`);
        return null;
      }

      // Format the data to match InvoiceItem interface
      let instructor = null;
      let thumbnail = null;
      
      if (itemType === 'course') {
        instructor = data.instructor;
        thumbnail = data.cover_image_url;
      } else if (itemType === 'chapter') {
        instructor = data.instructor;
        thumbnail = data.cover_image_url;
      } else if (itemType === 'lesson' || itemType === 'quiz') {
        instructor = data.course?.instructor;
        // Lessons and quizzes don't have thumbnails, so we'll use null
        thumbnail = null;
      }

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        thumbnail: thumbnail,
        instructor: instructor
      };
    } catch (error) {
      console.error('Error in fetchInvoiceItem:', error);
      return null;
    }
  };

  const createInvoice = async (invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'invoice_number'>) => {
    // Prepare the data for insertion, handling optional fields
    const insertData: Record<string, unknown> = {
      user_id: invoiceData.user_id,
      total_price: invoiceData.total_price,
      payment_type: invoiceData.payment_type,
      status: invoiceData.status,
      notes: invoiceData.notes,
      invoice_number: null // Will be auto-generated by database trigger
    };

    // Add optional fields only if they exist
    if (invoiceData.instructor_id) {
      insertData.instructor_id = invoiceData.instructor_id;
    }
    if (invoiceData.item_id) {
      insertData.item_id = invoiceData.item_id;
    }
    if (invoiceData.item_type) {
      insertData.item_type = invoiceData.item_type;
    }
    if (invoiceData.credits_amount !== undefined) {
      insertData.credits_amount = invoiceData.credits_amount;
    }
    if (invoiceData.minutes_amount !== undefined) {
      insertData.minutes_amount = invoiceData.minutes_amount;
    }
    if (invoiceData.transferred_from) {
      insertData.transferred_from = invoiceData.transferred_from;
    }

    const { data, error } = await supabase
      .from('invoices')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(insertData as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateInvoiceStatus = async (invoiceId: string, status: Invoice['status'], paymentReference?: string) => {
    const updateData: { 
      status: Invoice['status'];
      paid_at?: string;
      payment_reference?: string;
    } = { 
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

  const updateTransferredFrom = async (invoiceId: string, transferredFrom: string) => {
    const { data, error } = await supabase
      .from('invoices')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ transferred_from: transferredFrom } as any)
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
      enabled: !!invoiceId && invoiceId.trim() !== '',
    });
  };

  const useInvoiceItemQuery = (itemId: string | null, itemType: string, invoice?: Invoice) => {
    return useQuery({
      queryKey: ['invoice-item', itemId, itemType],
      queryFn: () => fetchInvoiceItem(itemId, itemType, invoice),
      enabled: !!itemType && itemType.trim() !== '',
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
      onError: (error: Error) => {
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
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to update invoice.",
          variant: "destructive",
        });
      },
    });
  };

  const useUpdateTransferredFrom = () => {
    return useMutation({
      mutationFn: ({ invoiceId, transferredFrom }: { 
        invoiceId: string; 
        transferredFrom: string 
      }) => updateTransferredFrom(invoiceId, transferredFrom),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
        queryClient.invalidateQueries({ queryKey: ['invoice'] });
        toast({
          title: "Payment Information Updated",
          description: "Transferred from information has been saved successfully.",
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to update payment information.",
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
    useUpdateTransferredFrom,
  };
};
