import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const getTeacherCourses = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data: coursesData, error } = await supabase
    .from('courses')
    .select(`
      *,
      enrollments(count)
    `)
    .eq('instructor_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return coursesData || [];
};

export const useTeacherCourses = () => {
    return useQuery({
        queryKey: ['teacherCourses'],
        queryFn: getTeacherCourses,
    });
};

export const getTeacherChapters = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data: chaptersData, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('instructor_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const chaptersWithCounts = await Promise.all(
    (chaptersData || []).map(async (chapter) => {
      const { count: courseCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('chapter_id', chapter.id)
        .eq('instructor_id', user.id);

      const { count: enrollmentCount } = await supabase
        .from('chapter_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('chapter_id', chapter.id);

      return {
        ...chapter,
        course_count: courseCount || 0,
        enrollment_count: enrollmentCount || 0
      };
    })
  );
  return chaptersWithCounts;
};

export const useTeacherChapters = () => {
    return useQuery({
        queryKey: ['teacherChapters'],
        queryFn: getTeacherChapters,
    });
};

export const getTeacherGroups = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

    if (groupsError) throw groupsError;

    const groupsWithCounts = await Promise.all(
        groupsData.map(async (group) => {
            const { count, error: countError } = await supabase
                .from('group_members')
                .select('*', { count: 'exact', head: true })
                .eq('group_id', group.id);

            if (countError) {
                console.error(`Count error for group ${group.id}:`, countError);
                return { ...group, member_count: 0 };
            }
            return { ...group, member_count: count || 0 };
        })
    );
    return groupsWithCounts;
};

export const useTeacherGroups = () => {
    return useQuery({
        queryKey: ['teacherGroups'],
        queryFn: getTeacherGroups,
    });
};

export const getTeacherStudents = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(`
          student_id,
          enrolled_at,
          course:courses!inner (
            id,
            title,
            price,
            instructor_id
          )
        `)
        .eq('course.instructor_id', user.id);

    if (enrollmentsError) throw enrollmentsError;

    const studentMap = new Map();
    (enrollmentsData)?.forEach((enrollment: any) => {
        const studentId = enrollment.student_id;
        if (!studentMap.has(studentId)) {
            studentMap.set(studentId, {
                id: studentId,
                enrollments: [],
                totalSpent: 0,
                enrollmentCount: 0
            });
        }
        const student = studentMap.get(studentId);
        student.enrollments.push(enrollment);
        student.totalSpent += enrollment.course.price;
        student.enrollmentCount += 1;
    });

    const studentIds = Array.from(studentMap.keys());
    const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', studentIds);

    const studentsWithDetails = await Promise.all(
        Array.from(studentMap.values()).map(async (student: any) => {
            const profile = profilesData?.find(p => p.id === student.id);
            const courseIds = student.enrollments.map((e: any) => e.course.id);
            const { data: quizAttempts } = await supabase
                .from('quiz_attempts')
                .select(`
              score,
              max_score,
              quiz:quizzes!inner (
                course_id
              )
            `)
                .eq('student_id', student.id)
                .in('quiz.course_id', courseIds);

            let averageScore = 0;
            let completedQuizzes = 0;
            if (quizAttempts && quizAttempts.length > 0) {
                const scores = quizAttempts
                    .filter(attempt => attempt.score !== null && attempt.max_score !== null)
                    .map(attempt => (attempt.score / attempt.max_score) * 100);
                averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
                completedQuizzes = scores.length;
            }

            const { count: totalQuizzesCount } = await supabase
                .from('quizzes')
                .select('*', { count: 'exact', head: true })
                .in('course_id', courseIds);
            const totalQuizzes = totalQuizzesCount || 0;

            const lastEnrollment = student.enrollments.sort((a: any, b: any) =>
                new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime()
            )[0];

            return {
                ...student,
                full_name: profile?.full_name || 'Unknown Student',
                email: profile?.email || '',
                avatar_url: profile?.avatar_url,
                averageScore: Math.round(averageScore),
                lastActive: lastEnrollment?.enrolled_at || '',
                completedQuizzes,
                totalQuizzes
            };
        })
    );
    return studentsWithDetails;
};

export const useTeacherStudents = () => {
    return useQuery({
        queryKey: ['teacherStudents'],
        queryFn: getTeacherStudents,
    });
};

export const getTeacherDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Fetch courses with enrollment count
    const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          enrollments(count)
        `)
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false });

    if (coursesError) throw coursesError;

    // Calculate stats
    const totalCourses = coursesData?.length || 0;
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select('student_id')
        .in('course_id', coursesData?.map(c => c.id) || []);

    const uniqueStudents = new Set(enrollments?.map((e: any) => e.student_id));
    const totalStudents = uniqueStudents.size;
    const totalRevenue = coursesData?.reduce((sum, course) =>
        sum + (course.price * (course.enrollments?.[0]?.count || 0)), 0) || 0;

    // Fetch active discussions count
    const { count: discussionsCount } = await supabase
        .from('discussions')
        .select('*', { count: 'exact', head: true })
        .in('course_id', coursesData?.map(c => c.id) || []);

    const stats = {
        totalCourses,
        totalStudents,
        totalRevenue,
        activeDiscussions: discussionsCount || 0
    };

    // Generate mock activities based on real data
    const mockActivities: any[] = [];
    if (coursesData && coursesData.length > 0) {
        coursesData.forEach((course: any) => {
            mockActivities.push({
                id: `course-${course.id}`,
                type: 'course_created',
                title: 'Course Created',
                description: `Created course: ${course.title}`,
                timestamp: course.created_at,
                course: { name: course.title, id: course.id }
            });
            if (course.enrollments?.[0]?.count) {
                mockActivities.push({
                    id: `enrollment-${course.id}`,
                    type: 'enrollment',
                    title: 'Student Enrollment',
                    description: `New student enrolled in ${course.title}`,
                    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                    user: { name: `Student ${Math.floor(Math.random() * 1000)}` },
                    course: { name: course.title, id: course.id },
                    metadata: { studentCount: course.enrollments[0].count }
                });
            }
        });
    }

    // Generate mock student insights
    const mockStudents: any[] = [];
    if (coursesData && coursesData.length > 0) {
        coursesData.forEach((course: any, courseIndex) => {
            const studentCount = course.enrollments?.[0]?.count || 0;
            for (let i = 0; i < Math.min(studentCount, 3); i++) {
                const engagement = ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low';
                mockStudents.push({
                    id: `student-${course.id}-${i}`,
                    name: `Student ${courseIndex * 3 + i + 1}`,
                    email: `student${courseIndex * 3 + i + 1}@example.com`,
                    courseId: course.id,
                    courseName: course.title,
                    enrollmentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                    lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                    progress: Math.floor(Math.random() * 100),
                    engagement,
                    rating: Math.floor(Math.random() * 5) + 1,
                    discussionPosts: Math.floor(Math.random() * 10),
                    lessonsCompleted: Math.floor(Math.random() * 20),
                    totalLessons: 25,
                    timeSpent: Math.floor(Math.random() * 50) + 5
                });
            }
        });
    }

    const performanceMetrics = {
        totalStudents,
        totalCourses,
        averageRating: 4.2,
        completionRate: 78,
        engagementScore: 85,
        responseTime: 2.5,
        monthlyGrowth: 12,
        topPerformingCourse: 'Advanced React Development'
    };

    return {
        courses: coursesData || [],
        stats,
        performanceMetrics,
        activities: mockActivities,
        students: mockStudents,
        user
    };
};

export const useTeacherDashboardData = () => {
    return useQuery({
        queryKey: ['teacherDashboardData'],
        queryFn: getTeacherDashboardData,
    });
};

export const getTeacherTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data: tasksData, error } = await supabase
        .from('teacher_schedule_tasks')
        .select('*')
        .eq('teacher_id', user.id)
        .order('due_date', { ascending: true })
        .limit(5);

    if (error) throw error;
    return tasksData || [];
};

export const useTeacherTasks = () => {
    return useQuery({
        queryKey: ['teacherTasks'],
        queryFn: getTeacherTasks,
    });
};

export const getMultiplayerQuizQuestions = async (userId: string) => {
    const { data, error } = await supabase
        .from('multiplayer_quiz_questions')
        .select('*')
        .eq('instructor_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedQuestions = (data as any)?.map((q: any) => ({
        id: q.id,
        question: q.question,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options),
        correct_answer: q.correct_answer,
        difficulty: q.difficulty,
        time_limit: q.time_limit,
        category: q.category || 'General',
        instructor_id: q.instructor_id,
    })) || [];

    return formattedQuestions;
};

export const useMultiplayerQuizQuestions = (userId: string) => {
    return useQuery({
        queryKey: ['multiplayerQuizQuestions', userId],
        queryFn: () => getMultiplayerQuizQuestions(userId),
        enabled: !!userId,
    });
};

export const getMultiplayerQuizCategories = async (userId: string) => {
    const { data, error } = await supabase
        .from('multiplayer_quiz_questions')
        .select('category')
        .eq('instructor_id', userId)
        .order('category');

    if (error) throw error;

    const uniqueCategories = [...new Set(data?.map((q: any) => q.category) || [])];
    return uniqueCategories;
};

export const useMultiplayerQuizCategories = (userId: string) => {
    return useQuery({
        queryKey: ['multiplayerQuizCategories', userId],
        queryFn: () => getMultiplayerQuizCategories(userId),
        enabled: !!userId,
    });
};

export const fetchTeacherAnalytics = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Fetch courses taught by this teacher
    const { data: courses } = await supabase
        .from('courses')
        .select('id, title, price, created_at')
        .eq('instructor_id', user.id);

    const courseIds = courses?.map(c => c.id) || [];

    // Fetch enrollments for teacher's courses
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
      id,
      student_id,
      enrolled_at,
      course_id,
      courses!inner(title, price)
    `)
        .in('course_id', courseIds);

    // Fetch lesson progress
    const { data: lessonProgress } = await supabase
        .from('lesson_progress')
        .select(`
      id,
      completed_at,
      lessons!inner(course_id)
    `)
        .in('lessons.course_id', courseIds);

    // Fetch quiz attempts
    const { data: quizAttempts } = await supabase
        .from('quiz_attempts')
        .select(`
      id,
      score,
      max_score,
      submitted_at,
      quizzes!inner(course_id)
    `)
        .in('quizzes.course_id', courseIds);

    // Calculate analytics
    const totalStudents = new Set(enrollments?.map(e => e.student_id)).size;
    const totalCourses = courses?.length || 0;
    const totalRevenue = enrollments?.reduce((sum, e) => sum + (e.courses?.price || 0), 0) || 0;
    const totalEnrollments = enrollments?.length || 0;

    // Calculate average rating (mock data for now)
    const averageRating = 4.7;
    const completionRate = lessonProgress?.length && totalEnrollments ?
        Math.round((lessonProgress.length / (totalEnrollments * 10)) * 100) : 0; // Assuming 10 lessons per course average

    // Monthly revenue data
    const monthlyData = new Map();
    enrollments?.forEach(enrollment => {
        const month = new Date(enrollment.enrolled_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const existing = monthlyData.get(month) || { month, revenue: 0, enrollments: 0 };
        existing.revenue += enrollment.courses?.price || 0;
        existing.enrollments += 1;
        monthlyData.set(month, existing);
    });

    const monthlyRevenue = Array.from(monthlyData.values()).slice(-6);

    // Course performance
    const courseStats = new Map();
    courses?.forEach(course => {
        courseStats.set(course.id, {
            name: course.title,
            enrollments: 0,
            completion: 0,
            rating: 4.5 + Math.random() * 0.5 // Mock rating
        });
    });

    enrollments?.forEach(enrollment => {
        const stats = courseStats.get(enrollment.course_id);
        if (stats) stats.enrollments += 1;
    });

    const coursePerformance = Array.from(courseStats.values()).slice(0, 5);

    // Student engagement (mock data based on lesson progress)
    const engagementData: any[] = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        engagementData.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            activeStudents: Math.floor(Math.random() * 20) + 10,
            lessonsCompleted: Math.floor(Math.random() * 50) + 20
        });
    }

    // Top courses
    const topCourses = coursePerformance
        .sort((a, b) => b.enrollments - a.enrollments)
        .slice(0, 3)
        .map(course => ({
            title: course.name,
            enrollments: course.enrollments,
            revenue: course.enrollments * 100 // Approximate revenue
        }));

    // Recent activity
    const recentActivity = [
        {
            type: 'New Enrollments', count: enrollments?.filter(e =>
                new Date(e.enrolled_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length || 0, change: 12
        },
        {
            type: 'Lessons Completed', count: lessonProgress?.filter(lp =>
                new Date(lp.completed_at || '') > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length || 0, change: 8
        },
        {
            type: 'Quiz Attempts', count: quizAttempts?.filter(qa =>
                new Date(qa.submitted_at || '') > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length || 0, change: -3
        },
        { type: 'Course Views', count: Math.floor(Math.random() * 100) + 50, change: 15 }
    ];

    return {
        totalStudents,
        totalCourses,
        totalRevenue,
        totalEnrollments,
        averageRating,
        completionRate,
        monthlyRevenue,
        coursePerformance,
        studentEngagement: engagementData,
        topCourses,
        recentActivity
    };
};

export const useTeacherAnalytics = () => {
    return useQuery({
        queryKey: ['teacher-analytics'],
        queryFn: fetchTeacherAnalytics,
    });
};

export const getWalletCodes = async (userId: string) => {
    const { data, error } = await supabase
        .from('wallet_codes')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

export const useWalletCodes = (userId: string) => {
    return useQuery({
        queryKey: ['walletCodes', userId],
        queryFn: () => getWalletCodes(userId),
        enabled: !!userId,
    });
};
