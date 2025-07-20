
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ChatbotProvider, useChatbot } from './contexts/ChatbotContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Navbar } from './components/layout/Navbar';
import { GlobalChatbotSidebar } from './components/chatbot/GlobalChatbotSidebar';
import { MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

// Pages
import Index from "./pages/Index";
import { AuthCallback } from './pages/auth/AuthCallback';

import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherCourseManagement } from './components/courses/TeacherCourseManagement';
import { TeacherCoursesPage } from './pages/teacher/TeacherCoursesPage';
import { TeacherCodesPage } from './pages/teacher/TeacherCodesPage';
import { TeacherAnalyticsPage } from './pages/teacher/TeacherAnalyticsPage';
import { TeacherNotificationsPage } from './pages/teacher/TeacherNotificationsPage';
import DashboardSettingsPage from "./pages/DashboardSettingsPage";

import { QuizEditor } from './pages/teacher/QuizEditor';
import { LessonDetails } from './pages/teacher/LessonDetails';
import { MultiplayerQuizManagement } from './pages/teacher/MultiplayerQuizManagement';

// Teacher's Chapters 
import { TeacherChaptersPage } from './pages/teacher/TeacherChaptersPage';
import { TeacherChapterManagement } from './pages/teacher/TeacherChapterManagement';

// Teacher's Groups 
import { TeacherGroups } from './pages/teacher/TeacherGroups';

import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentCoursesPage } from './pages/student/StudentCoursesPage';
import { StudentNotificationsPage } from './pages/student/StudentNotificationsPage';
import { StudentTransactions } from './pages/student/StudentTransactions';

import { Courses } from './pages/student/Courses';
import { CourseDetails } from './pages/teacher/CourseDetails';
import { CourseView } from './pages/student/CourseView';
import { CourseProgress } from './pages/student/CourseProgress';
import { LessonView } from './pages/student/LessonView';

import { StudentGroups } from './pages/student/StudentGroups';
import { StudentChaptersPage } from './pages/student/StudentChaptersPage';
import MultiplayerQuiz from './pages/student/MultiplayerQuiz';

// Shared Pages
import { GroupDetailPage } from './pages/groups/GroupDetailPage';
import { ChaptersPage } from './pages/chapters/ChaptersPage';
import { ChapterDetailPage } from './pages/chapters/ChapterDetailPage';

import RedeemPage from './pages/RedeemPage';

import { Unauthorized } from "./pages/Unauthorized";

import NotFound from "./pages/NotFound";

import Store from './pages/student/Store';
import Auth from "./pages/auth/Auth";
import { QuestionsPage } from "./pages/QuestionsPage";
import { TeachersPage } from './pages/teacher/TeachersPage';
import { TeacherProfile } from './pages/teacher/TeacherProfile';
import { TenantProvider, useTenant } from './contexts/TenantContext';

const queryClient = new QueryClient();

// Component to handle redirect from old codes route to new redeem route
const CodesRedirect = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  
  if (code) {
    return <Navigate to={`/redeem?code=${code}`} replace />;
  }
  
  return <Navigate to="/redeem" replace />;
};

const ChatSidebarToggle = () => {
  const { isOpen, openChatbot } = useChatbot();
  if (isOpen) return null;
  return (
    <button
      onClick={openChatbot}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 z-[10050] animate-pulse-glow flex items-center justify-center"
      style={{ pointerEvents: 'auto' }}
    >
      <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
    </button>
  );
};

const AppRoutes = () => {
  const location = useLocation();
  // Hide Navbar on auth pages
  const hideNavbar = location.pathname.startsWith('/auth');
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {!hideNavbar && <Navbar extraXSpacing />}
      <main className="" >
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/login" element={<Auth />} />
          <Route path="/auth/signup" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/codes" element={<CodesRedirect />} />
          <Route path="/redeem" element={<ProtectedRoute><RedeemPage /></ProtectedRoute>} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          {/* Teacher Routes */}
          <Route path="/teacher/dashboard" element={<ProtectedRoute requiredRole={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/courses" element={<ProtectedRoute requiredRole={['teacher']}><TeacherCoursesPage /></ProtectedRoute>} />
          <Route path="/teacher/courses/:id" element={<ProtectedRoute requiredRole={['teacher']}><CourseDetails /></ProtectedRoute>} />
          <Route path="/teacher/courses/:id/manage" element={<ProtectedRoute requiredRole={['teacher']}><TeacherCourseManagement /></ProtectedRoute>} />
          <Route path="/teacher/courses/:courseId/quiz/:quizId" element={<ProtectedRoute requiredRole={['teacher']}><QuizEditor /></ProtectedRoute>} />
          <Route path="/teacher/lesson/:id" element={<ProtectedRoute requiredRole={['teacher']}><LessonDetails /></ProtectedRoute>} />
          <Route path="/teacher/groups" element={<ProtectedRoute requiredRole={['teacher']}><TeacherGroups /></ProtectedRoute>} />
          <Route path="/teacher/chapters" element={<ProtectedRoute requiredRole={['teacher']}><TeacherChaptersPage /></ProtectedRoute>} />
          <Route path="/teacher/chapter/:chapterId" element={<ProtectedRoute requiredRole={['teacher']}><TeacherChapterManagement /></ProtectedRoute>} />
          <Route path="/teacher/codes" element={<ProtectedRoute requiredRole={['teacher']}><TeacherCodesPage /></ProtectedRoute>} />
          <Route path="/teacher/analytics" element={<ProtectedRoute requiredRole={['teacher']}><TeacherAnalyticsPage /></ProtectedRoute>} />
          <Route path="/teacher/notifications" element={<ProtectedRoute requiredRole={['teacher']}><TeacherNotificationsPage /></ProtectedRoute>} />
          <Route path="/teacher/multiplayer-quiz" element={<ProtectedRoute requiredRole={['teacher']}><MultiplayerQuizManagement /></ProtectedRoute>} />
          <Route path="/dashboard/settings" element={<ProtectedRoute requiredRole={['teacher']}><DashboardSettingsPage /></ProtectedRoute>} />
          {/* Student Routes */}
          <Route path="/student/dashboard" element={<ProtectedRoute requiredRole={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/courses" element={<ProtectedRoute requiredRole={['student']}><StudentCoursesPage /></ProtectedRoute>} />
          <Route path="/student/chapters" element={<ProtectedRoute requiredRole={['student']}><StudentChaptersPage /></ProtectedRoute>} />
          <Route path="/student/groups" element={<ProtectedRoute requiredRole={['student']}><StudentGroups /></ProtectedRoute>} />
          <Route path="/student/store" element={<ProtectedRoute requiredRole={['student']}><Store /></ProtectedRoute>} />
          <Route path="/student/transactions" element={<ProtectedRoute requiredRole={['student']}><StudentTransactions /></ProtectedRoute>} />
          <Route path="/multiplayer-quiz" element={<ProtectedRoute requiredRole={['student']}><MultiplayerQuiz /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path="/courses/:id" element={<ProtectedRoute><CourseView /></ProtectedRoute>} />
          <Route path="/courses/:id/progress" element={<ProtectedRoute><CourseProgress /></ProtectedRoute>} />
          <Route path="/courses/:id/progress/lesson/:lessonId" element={<ProtectedRoute><CourseProgress /></ProtectedRoute>} />
          <Route path="/courses/:id/progress/quiz/:quizId" element={<ProtectedRoute><CourseProgress /></ProtectedRoute>} />
          <Route path="/chapters" element={<ProtectedRoute><ChaptersPage /></ProtectedRoute>} />
          <Route path="/chapters/:id" element={<ProtectedRoute><ChapterDetailPage /></ProtectedRoute>} />
          <Route path="/student/notifications" element={<ProtectedRoute requiredRole={['student']}><StudentNotificationsPage /></ProtectedRoute>} />
          {/* Shared Routes */}

          <Route path="/teachers" element={<ProtectedRoute><TeachersPage /></ProtectedRoute>} />
          <Route path="/teachers/:teacherSlug" element={<ProtectedRoute><TeacherProfile /></ProtectedRoute>} />

          <Route path="/questions" element={<ProtectedRoute><QuestionsPage /></ProtectedRoute>} />
          <Route path="/groups/:id" element={<ProtectedRoute><GroupDetailPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <GlobalChatbotSidebar />
      <ChatSidebarToggle />
    </div>
  );
};

const AppRoutesWithTenant = () => {
  const { slug, teacher, loading } = useTenant();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // If subdomain is 'platform' or 'www', render main platform as usual
  if (!slug || slug === 'platform' || slug === 'www') {
    return <AppRoutes />;
  }

  // If subdomain is a teacher's slug and teacher exists, render the same routes (for now)
  if (teacher) {
    return <AppRoutes />;
  }

  // If subdomain is not found, show fallback (optional)
  return <AppRoutes />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <ChatbotProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <TenantProvider>
                <Suspense fallback={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                  </div>
                  }>
                  <BrowserRouter>
                    <AppRoutesWithTenant />
                  </BrowserRouter>
                </Suspense>
              </TenantProvider>
            </TooltipProvider>
          </ChatbotProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  </QueryClientProvider>
);

export default App;
