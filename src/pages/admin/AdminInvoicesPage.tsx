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
import { Input } from '@/components/ui/input';
import { Plus, Check, X, DollarSign, Calendar, User, FileText, Phone, TrendingUp, Clock, CheckCircle, Search, Filter, X as XIcon, Crown } from 'lucide-react';
import { format } from 'date-fns';
import { enrollStudentFromInvoice } from '@/utils/enrollmentUtils';
import { TeacherInvoicesSkeleton } from '@/components/ui/skeletons';
import { useTenant } from '@/contexts/TenantContext';

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
  instructor?: {
    id: string;
    full_name: string;
  };
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export const AdminInvoicesPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { teacher } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemType, setSelectedItemType] = useState<string>('all');
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch invoices - tenant-aware
  const { data: invoices = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-invoices', teacher?.id],
    queryFn: async (): Promise<Invoice[]> => {
      let query = supabase.from('invoices').select('*');
      
      // If we're on a tenant, only fetch that teacher's invoices
      if (teacher?.id) {
        query = query.eq('instructor_id', teacher.id);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch all teachers for filter dropdown (if not on tenant)
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: async (): Promise<UserProfile[]> => {
      if (teacher?.id) return []; // Don't fetch if on tenant

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('role', 'teacher')
        .order('full_name');

      if (error) throw error;
      return data || [];
    },
    enabled: !teacher?.id,
  });

  // Fetch invoice items for display
  const { data: invoiceItems } = useQuery({
    queryKey: ['admin-invoice-items', invoices.map(i => `${i.item_id}-${i.item_type}`)],
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
    queryKey: ['admin-user-profiles', invoices.map(i => i.user_id)],
    queryFn: async () => {
      const profiles: Record<string, UserProfile> = {};
      
      for (const invoice of invoices) {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, email, role')
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

  // Fetch instructor profiles for display
  const { data: instructorProfiles } = useQuery({
    queryKey: ['admin-instructor-profiles', invoices.map(i => i.instructor_id)],
    queryFn: async () => {
      const profiles: Record<string, UserProfile> = {};
      
      for (const invoice of invoices) {
        if (invoice.instructor_id) {
          const { data } = await supabase
            .from('profiles')
            .select('id, full_name, email, role')
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

      // Handle enrollment logic similar to teacher page
      if (status === 'paid' && ['course', 'chapter', 'lesson', 'quiz'].includes(invoice.item_type)) {
        try {
          const enrollmentResult = await enrollStudentFromInvoice(
            invoice.user_id,
            invoice.item_id,
            invoice.item_type as 'course' | 'chapter' | 'lesson' | 'quiz'
          );

          if (!enrollmentResult.success) {
            toast({
              title: "Enrollment Warning",
              description: `Invoice confirmed but enrollment failed: ${enrollmentResult.message}`,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Enrollment Success",
              description: "Student successfully enrolled in the item",
            });
          }
        } catch (enrollmentError) {
          console.error('Error during automatic enrollment:', enrollmentError);
          toast({
            title: "Enrollment Error",
            description: `Invoice confirmed but enrollment failed with error: ${enrollmentError instanceof Error ? enrollmentError.message : 'Unknown error'}`,
            variant: "destructive",
          });
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-invoices', teacher?.id] });
      toast({
        title: "Success",
        description: "Invoice status updated successfully",
      });
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
    
    return {
      totalInvoices,
      pendingInvoices,
      paidInvoices,
      totalRevenue
    };
  }, [invoices]);

  // Filter and search invoices
  const filteredInvoices = React.useMemo(() => {
    let filtered = [...invoices];

    // Apply search filter (student name, teacher name, invoice number, transferred from)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(invoice => {
        const userProfile = userProfiles?.[invoice.user_id];
        const instructorProfile = instructorProfiles?.[invoice.instructor_id];
        const studentName = userProfile?.full_name?.toLowerCase() || userProfile?.email?.toLowerCase() || '';
        const teacherName = instructorProfile?.full_name?.toLowerCase() || instructorProfile?.email?.toLowerCase() || '';
        const transferredFrom = invoice.transferred_from?.toLowerCase() || '';
        const invoiceNumber = invoice.invoice_number?.toLowerCase() || '';
        
        return studentName.includes(query) || 
               teacherName.includes(query) || 
               transferredFrom.includes(query) || 
               invoiceNumber.includes(query);
      });
    }

    // Apply filters
    if (selectedItemType !== 'all') {
      filtered = filtered.filter(invoice => invoice.item_type === selectedItemType);
    }

    if (selectedPaymentType !== 'all') {
      filtered = filtered.filter(invoice => invoice.payment_type === selectedPaymentType);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === selectedStatus);
    }

    if (selectedTeacher !== 'all') {
      filtered = filtered.filter(invoice => invoice.instructor_id === selectedTeacher);
    }

    return filtered;
  }, [invoices, searchQuery, selectedItemType, selectedPaymentType, selectedStatus, selectedTeacher, userProfiles, instructorProfiles]);

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
            title={teacher ? `Invoice Management - ${teacher.display_name}` : "Admin Invoice Management"}
            subtitle={teacher ? `Managing invoices for ${teacher.display_name}` : "Manage and track all invoices across the platform"}
            actionLabel="Create Invoice"
            onAction={() => setIsCreateModalOpen(true)}
            actionIcon={<Plus className="h-4 w-4 mr-2" />}
            actionButtonProps={{ className: 'btn-primary' }}
          />

          {/* Admin Badge */}
          {!teacher && (
            <div className="flex items-center gap-2 mb-4">
              <Crown className="h-5 w-5 text-amber-500" />
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                Global Admin View
              </Badge>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                    <p className="text-2xl font-bold">{stats.totalInvoices}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Invoices</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.pendingInvoices}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Paid Invoices</p>
                    <p className="text-2xl font-bold text-green-600">{stats.paidInvoices}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      ${stats.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by student name, teacher name, invoice number, or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filter Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="shrink-0"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {(selectedItemType !== 'all' || selectedPaymentType !== 'all' || selectedStatus !== 'all' || selectedTeacher !== 'all') && (
                    <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                      Active
                    </span>
                  )}
                </Button>
              </div>

              {/* Filter Options */}
              {showFilters && (
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Item Type Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Item Type</label>
                      <Select value={selectedItemType} onValueChange={setSelectedItemType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="course">Course</SelectItem>
                          <SelectItem value="chapter">Chapter</SelectItem>
                          <SelectItem value="lesson">Lesson</SelectItem>
                          <SelectItem value="quiz">Quiz</SelectItem>
                          <SelectItem value="credits">Credits</SelectItem>
                          <SelectItem value="ai_minutes">AI Minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Payment Type Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Payment Type</label>
                      <Select value={selectedPaymentType} onValueChange={setSelectedPaymentType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="vodafone_cash">Vodafone Cash</SelectItem>
                          <SelectItem value="credit_card">Credit Card</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="wallet">Wallet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Status</label>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Teacher Filter (only show if not on tenant) */}
                    {!teacher && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">Teacher</label>
                        <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Teachers</SelectItem>
                            {teachers.map(teacher => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.full_name || teacher.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Clear Filters */}
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedItemType('all');
                        setSelectedPaymentType('all');
                        setSelectedStatus('all');
                        setSelectedTeacher('all');
                        setSearchQuery('');
                      }}
                    >
                      <XIcon className="h-4 w-4 mr-2" />
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoices List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Invoices ({filteredInvoices.length})</span>
                {filteredInvoices.length !== invoices.length && (
                  <Badge variant="outline">
                    Filtered from {invoices.length} total
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No invoices found</h3>
                  <p className="text-muted-foreground">
                    {filteredInvoices.length === 0 && invoices.length > 0 
                      ? "Try adjusting your filters or search terms"
                      : "Create your first invoice to get started"
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedInvoices.map((invoice) => {
                    const item = invoiceItems?.[`${invoice.item_id}-${invoice.item_type}`];
                    const student = userProfiles?.[invoice.user_id];
                    const instructor = instructorProfiles?.[invoice.instructor_id];
                    
                    return (
                      <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            {/* Left side - Invoice info */}
                            <div className="flex items-start space-x-4 flex-1">
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                                {invoice.item_type === 'credits' && '💳'}
                                {invoice.item_type === 'ai_minutes' && '🤖'}
                                {['course', 'chapter'].includes(invoice.item_type) && '📚'}
                                {['lesson', 'quiz'].includes(invoice.item_type) && '📝'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold truncate">
                                    {item?.title || `${invoice.item_type} Purchase`}
                                  </h3>
                                  <Badge variant="outline" className="text-xs">
                                    {invoice.item_type}
                                  </Badge>
                                </div>
                                
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      Student: {student?.full_name || student?.email || 'Unknown'}
                                    </span>
                                    {!teacher && instructor && (
                                      <span className="flex items-center gap-1">
                                        <Crown className="h-3 w-3" />
                                        Teacher: {instructor.full_name || instructor.email}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                      <FileText className="h-3 w-3" />
                                      #{invoice.invoice_number}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {format(new Date(invoice.created_at), 'MMM dd, yyyy')}
                                    </span>
                                  </div>
                                  {invoice.transferred_from && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      From: {invoice.transferred_from}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right side - Status and actions */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:flex-shrink-0">
                              <div className="text-right">
                                <div className="font-bold text-lg">
                                  ${invoice.total_price.toFixed(2)}
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <span>{getPaymentTypeIcon(invoice.payment_type)}</span>
                                  {invoice.payment_type.replace('_', ' ')}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge className={`${getStatusColor(invoice.status)} border`}>
                                  {invoice.status}
                                </Badge>
                                
                                {invoice.status === 'pending' && (
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      onClick={() => handleStatusChange(invoice.id, 'paid')}
                                      disabled={updateStatusMutation.isPending}
                                      className="h-8 px-3"
                                    >
                                      <Check className="h-3 w-3 mr-1" />
                                      Confirm
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleStatusChange(invoice.id, 'cancelled')}
                                      disabled={updateStatusMutation.isPending}
                                      className="h-8 px-3"
                                    >
                                      <X className="h-3 w-3 mr-1" />
                                      Cancel
                                    </Button>
                                  </div>
                                )}

                                {invoice.status === 'paid' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStatusChange(invoice.id, 'refunded')}
                                    disabled={updateStatusMutation.isPending}
                                    className="h-8 px-3"
                                  >
                                    Refund
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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