import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminStats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeTeachers: number;
  activeStudents: number;
}

export interface AdminAnalytics {
  userRegistrations: Array<{ date: string; count: number }>;
  revenueData: Array<{ date: string; amount: number }>;
  courseCreations: Array<{ date: string; count: number }>;
  enrollmentData: Array<{ date: string; count: number }>;
  topCourses: Array<{
    id: string;
    title: string;
    enrollments: number;
    revenue: number;
    instructor_name: string;
  }>;
  topInstructors: Array<{
    id: string;
    name: string;
    courses: number;
    students: number;
    revenue: number;
  }>;
}

export interface AdminActivity {
  id: string;
  type: 'user_registration' | 'course_creation' | 'enrollment' | 'payment' | 'invoice_paid';
  user_name: string;
  description: string;
  timestamp: string;
  metadata?: {
    course_name?: string;
    instructor_name?: string;
    amount?: number;
  };
}

export interface AdminSystemOverview {
  systemHealth: {
    database: 'healthy' | 'warning' | 'error';
    storage: 'healthy' | 'warning' | 'error';
    api: 'healthy' | 'warning' | 'error';
  };
  storageUsed: number;
  storageLimit: number;
  activeConnections: number;
  errorRate: number;
  avgResponseTime: number;
}

export const useAdminDashboardData = (tenantId?: string | null) => {
  return useQuery({
    queryKey: ['admin-dashboard', tenantId],
    queryFn: async () => {
      // Fetch stats
      const statsData = await fetchAdminStats(tenantId);
      
      // Fetch analytics
      const analyticsData = await fetchAdminAnalytics(tenantId);
      
      // Fetch recent activity
      const activityData = await fetchAdminActivity(tenantId);
      
      // Fetch system overview
      const systemData = await fetchSystemOverview();

      return {
        stats: statsData,
        analytics: analyticsData,
        recentActivity: activityData,
        systemOverview: systemData,
      };
    },
  });
};

async function fetchAdminStats(tenantId?: string | null): Promise<AdminStats> {
  try {
    // Base queries
    let usersQuery = supabase.from('profiles').select('role');
    let coursesQuery = supabase.from('courses').select('id, instructor_id');
    let enrollmentsQuery = supabase.from('enrollments').select('*');
    let invoicesQuery = supabase.from('invoices').select('total_price, status, created_at, instructor_id');

    // If tenant mode, filter by tenant teacher
    if (tenantId) {
      coursesQuery = coursesQuery.eq('instructor_id', tenantId);
      invoicesQuery = invoicesQuery.eq('instructor_id', tenantId);
    }

    const [usersResult, coursesResult, enrollmentsResult, invoicesResult] = await Promise.all([
      usersQuery,
      coursesQuery,
      enrollmentsQuery,
      invoicesQuery
    ]);

    const users = usersResult.data || [];
    const courses = coursesResult.data || [];
    const enrollments = enrollmentsResult.data || [];
    const invoices = invoicesResult.data || [];

    // Filter enrollments if in tenant mode
    let filteredEnrollments = enrollments;
    if (tenantId && courses.length > 0) {
      const courseIds = courses.map(c => c.id);
      filteredEnrollments = enrollments.filter(e => courseIds.includes(e.course_id));
    }

    const totalUsers = users.length;
    const totalTeachers = users.filter(u => u.role === 'teacher').length;
    const totalStudents = users.filter(u => u.role === 'student').length;
    const totalCourses = courses.length;
    const totalEnrollments = filteredEnrollments.length;
    
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total_price, 0);
    
    // Calculate monthly revenue
    const thisMonth = new Date();
    const thisMonthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
    const monthlyRevenue = paidInvoices
      .filter(inv => new Date(inv.created_at) >= thisMonthStart)
      .reduce((sum, inv) => sum + inv.total_price, 0);

    // Calculate active users (simplified)
    const activeTeachers = tenantId ? 1 : Math.min(totalTeachers, 10); // Simplified for demo
    const activeStudents = Math.min(totalStudents, filteredEnrollments.length);

    return {
      totalUsers,
      totalTeachers,
      totalStudents,
      totalCourses,
      totalEnrollments,
      totalRevenue,
      monthlyRevenue,
      activeTeachers,
      activeStudents,
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      totalUsers: 0,
      totalTeachers: 0,
      totalStudents: 0,
      totalCourses: 0,
      totalEnrollments: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      activeTeachers: 0,
      activeStudents: 0,
    };
  }
}

async function fetchAdminAnalytics(tenantId?: string | null): Promise<AdminAnalytics> {
  try {
    // Generate mock data for analytics (in a real app, you'd calculate this from actual data)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const userRegistrations = last30Days.map(date => ({
      date,
      count: Math.floor(Math.random() * 10) + 1
    }));

    const revenueData = last30Days.map(date => ({
      date,
      amount: Math.floor(Math.random() * 1000) + 100
    }));

    const courseCreations = last30Days.map(date => ({
      date,
      count: Math.floor(Math.random() * 5)
    }));

    const enrollmentData = last30Days.map(date => ({
      date,
      count: Math.floor(Math.random() * 20) + 5
    }));

    // Fetch top courses
    let coursesQuery = supabase
      .from('courses')
      .select(`
        id, 
        title, 
        instructor_id,
        profiles!courses_instructor_id_fkey(full_name),
        enrollments(count),
        invoices(total_price, status)
      `);

    if (tenantId) {
      coursesQuery = coursesQuery.eq('instructor_id', tenantId);
    }

    const { data: coursesData } = await coursesQuery.limit(5);

    const topCourses = (coursesData || []).map(course => ({
      id: course.id,
      title: course.title,
      enrollments: course.enrollments?.[0]?.count || 0,
      revenue: (course.invoices || [])
        .filter((inv: any) => inv.status === 'paid')
        .reduce((sum: number, inv: any) => sum + inv.total_price, 0),
      instructor_name: course.profiles?.full_name || 'Unknown'
    }));

    // Fetch top instructors
    let instructorsQuery = supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        courses(count),
        courses!courses_instructor_id_fkey(
          enrollments(count),
          invoices(total_price, status)
        )
      `)
      .eq('role', 'teacher');

    if (tenantId) {
      instructorsQuery = instructorsQuery.eq('id', tenantId);
    }

    const { data: instructorsData } = await instructorsQuery.limit(5);

    const topInstructors = (instructorsData || []).map(instructor => {
      const courses = instructor.courses || [];
      const totalEnrollments = courses.reduce((sum: number, course: any) => 
        sum + (course.enrollments?.[0]?.count || 0), 0);
      const totalRevenue = courses.reduce((sum: number, course: any) => {
        const courseRevenue = (course.invoices || [])
          .filter((inv: any) => inv.status === 'paid')
          .reduce((courseSum: number, inv: any) => courseSum + inv.total_price, 0);
        return sum + courseRevenue;
      }, 0);

      return {
        id: instructor.id,
        name: instructor.full_name || 'Unknown',
        courses: courses.length,
        students: totalEnrollments,
        revenue: totalRevenue,
      };
    });

    return {
      userRegistrations,
      revenueData,
      courseCreations,
      enrollmentData,
      topCourses,
      topInstructors,
    };
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    return {
      userRegistrations: [],
      revenueData: [],
      courseCreations: [],
      enrollmentData: [],
      topCourses: [],
      topInstructors: [],
    };
  }
}

async function fetchAdminActivity(tenantId?: string | null): Promise<AdminActivity[]> {
  try {
    // Fetch recent enrollments
    let enrollmentsQuery = supabase
      .from('enrollments')
      .select(`
        created_at,
        profiles!enrollments_student_id_fkey(full_name),
        courses(title, instructor_id, profiles!courses_instructor_id_fkey(full_name))
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch recent invoices
    let invoicesQuery = supabase
      .from('invoices')
      .select(`
        created_at,
        status,
        total_price,
        profiles!invoices_user_id_fkey(full_name),
        instructor_id
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (tenantId) {
      invoicesQuery = invoicesQuery.eq('instructor_id', tenantId);
    }

    const [enrollmentsResult, invoicesResult] = await Promise.all([
      enrollmentsQuery,
      invoicesResult
    ]);

    const activities: AdminActivity[] = [];

    // Add enrollment activities
    (enrollmentsResult.data || []).forEach(enrollment => {
      // Filter by tenant if needed
      if (tenantId && enrollment.courses?.instructor_id !== tenantId) return;

      activities.push({
        id: `enrollment-${enrollment.created_at}`,
        type: 'enrollment',
        user_name: enrollment.profiles?.full_name || 'Unknown Student',
        description: 'enrolled in a course',
        timestamp: enrollment.created_at,
        metadata: {
          course_name: enrollment.courses?.title || 'Unknown Course',
          instructor_name: enrollment.courses?.profiles?.full_name || 'Unknown Instructor'
        }
      });
    });

    // Add invoice activities
    (invoicesResult.data || []).forEach(invoice => {
      if (invoice.status === 'paid') {
        activities.push({
          id: `invoice-${invoice.created_at}`,
          type: 'invoice_paid',
          user_name: invoice.profiles?.full_name || 'Unknown Student',
          description: 'completed a payment',
          timestamp: invoice.created_at,
          metadata: {
            amount: invoice.total_price
          }
        });
      }
    });

    // Sort by timestamp and return latest 20
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

  } catch (error) {
    console.error('Error fetching admin activity:', error);
    return [];
  }
}

async function fetchSystemOverview(): Promise<AdminSystemOverview> {
  // Mock system data (in a real app, you'd get this from monitoring APIs)
  return {
    systemHealth: {
      database: 'healthy',
      storage: 'healthy',
      api: 'healthy'
    },
    storageUsed: 2.4, // GB
    storageLimit: 10, // GB
    activeConnections: 45,
    errorRate: 0.02, // 2%
    avgResponseTime: 125 // ms
  };
}