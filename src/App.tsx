import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { Helmet } from 'react-helmet-async';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TenantProvider } from '@/contexts/TenantContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { useRandomBackground } from '@/hooks/useRandomBackground';
import { useScrollToTop } from '@/hooks/useScrollToTop';

// Page imports
import Index from './pages/Index';
import Home from './pages/Home';
import Auth from './pages/auth/Auth';
import AuthCallback from './pages/auth/AuthCallback';
import Login from './pages/auth/Login';
import LoginModern from './pages/auth/LoginModern';
import Signup from './pages/auth/Signup';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import RedeemPage from './pages/RedeemPage';
import CodeRedemption from './pages/CodeRedemption';
import QuestionsPage from './pages/QuestionsPage';
import DashboardSettingsPage from './pages/DashboardSettingsPage';
import TeacherLanding from './pages/TeacherLanding';
import InvoiceDetailPage from './pages/InvoiceDetailPage';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import Courses from './pages/student/Courses';
import StudentCoursesPage from './pages/student/StudentCoursesPage';
import CourseCatalog from './pages/student/CourseCatalog';
import CourseView from './pages/student/CourseView';
import CourseProgress from './pages/student/CourseProgress';
import QuizTaker from './pages/student/QuizTaker';
import MultiplayerQuiz from './pages/student/MultiplayerQuiz';
import Store from './pages/student/Store';
import StudentGroups from './pages/student/StudentGroups';
import StudentChaptersPage from './pages/student/StudentChaptersPage';
import StudentTransactions from './pages/student/StudentTransactions';
import StudentNotificationsPage from './pages/student/StudentNotificationsPage';

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import CreateCourse from './pages/teacher/CreateCourse';
import CourseDetails from './pages/teacher/CourseDetails';
import LessonDetails from './pages/teacher/LessonDetails';
import QuizEditor from './pages/teacher/QuizEditor';
import TeacherCoursesPage from './pages/teacher/TeacherCoursesPage';
import TeacherChaptersPage from './pages/teacher/TeacherChaptersPage';
import TeacherChapterManagement from './pages/teacher/TeacherChapterManagement';
import TeacherGroups from './pages/teacher/TeacherGroups';
import StudentStudents from './pages/teacher/StudentStudents';
import StudentDetail from './pages/teacher/StudentDetail';
import TeachersPage from './pages/teacher/TeachersPage';
import TeacherProfile from './pages/teacher/TeacherProfile';
import TeacherCodesPage from './pages/teacher/TeacherCodesPage';
import TeacherColorSettings from './pages/teacher/TeacherColorSettings';
import TeacherAnalyticsPage from './pages/teacher/TeacherAnalyticsPage';
import TeacherNotificationsPage from './pages/teacher/TeacherNotificationsPage';
import TeacherSchedulePage from './pages/teacher/TeacherSchedulePage';
import MultiplayerQuizManagement from './pages/teacher/MultiplayerQuizManagement';

// Chapter and Group pages
import ChaptersPage from './pages/chapters/ChaptersPage';
import ChapterDetailPage from './pages/chapters/ChapterDetailPage';
import GroupDetailPage from './pages/groups/GroupDetailPage';
import DiscussionsPage from './pages/discussions/DiscussionsPage';

const queryClient = new QueryClient();

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getBackgroundClass } = useRandomBackground();
  useScrollToTop();

  useEffect(() => {
    // Redirect to /home if the user is authenticated and tries to access / or /auth
    const token = localStorage.getItem('sb-access-token');
    const isAuthPage = location.pathname === '/auth' || location.pathname === '/';

    if (token && isAuthPage) {
      navigate('/home', { replace: true });
    }
  }, [navigate, location]);

  return (
    <ThemeProvider>
      <TenantProvider>
        <LanguageProvider>
          <AuthProvider>
            <Helmet>
              <title>LrnFlix - AI-Powered Learning Management System</title>
              <meta name="description" content="Experience the future of education with LrnFlix's AI-powered LMS. Gamified learning, intelligent tutoring, and personalized education paths." />
            </Helmet>
            <div className={`min-h-screen transition-all duration-500 ${getBackgroundClass()}`}>
              <QueryClientProvider client={queryClient}>
                <Toaster />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/login-modern" element={<LoginModern />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/404" element={<NotFound />} />
                  <Route path="/401" element={<Unauthorized />} />
                  <Route path="/redeem" element={<RedeemPage />} />
                  <Route path="/code-redemption" element={<CodeRedemption />} />
                  <Route path="/questions" element={<QuestionsPage />} />
                  <Route path="/dashboard-settings" element={<DashboardSettingsPage />} />
                  <Route path="/teacher-landing" element={<TeacherLanding />} />

                  {/* Student Routes */}
                  <Route path="/student/dashboard" element={<StudentDashboard />} />
                  <Route path="/student/courses" element={<Courses />} />
                  <Route path="/student/my-courses" element={<StudentCoursesPage />} />
                  <Route path="/student/course-catalog" element={<CourseCatalog />} />
                  <Route path="/student/course/:courseId" element={<CourseView />} />
                  <Route path="/student/course/:courseId/progress" element={<CourseProgress />} />
                  <Route path="/student/quiz/:quizId" element={<QuizTaker />} />
                  <Route path="/student/multiplayer-quiz" element={<MultiplayerQuiz />} />
                  <Route path="/student/store" element={<Store />} />
                  <Route path="/student/groups" element={<StudentGroups />} />
                  <Route path="/student/chapters" element={<StudentChaptersPage />} />
                  <Route path="/student/transactions" element={<StudentTransactions />} />
                  <Route path="/student/notifications" element={<StudentNotificationsPage />} />

                  {/* Teacher Routes */}
                  <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                  <Route path="/teacher/create-course" element={<CreateCourse />} />
                  <Route path="/teacher/course/:courseId" element={<CourseDetails />} />
                  <Route path="/teacher/lesson/:lessonId" element={<LessonDetails />} />
                  <Route path="/teacher/quiz/:quizId" element={<QuizEditor />} />
                  <Route path="/teacher/courses" element={<TeacherCoursesPage />} />
                  <Route path="/teacher/chapters" element={<TeacherChaptersPage />} />
                  <Route path="/teacher/chapter-management" element={<TeacherChapterManagement />} />
                  <Route path="/teacher/groups" element={<TeacherGroups />} />
                  <Route path="/teacher/students" element={<StudentStudents />} />
                  <Route path="/teacher/student/:studentId" element={<StudentDetail />} />
                  <Route path="/teacher/teachers" element={<TeachersPage />} />
                  <Route path="/teacher/profile" element={<TeacherProfile />} />
                  <Route path="/teacher/codes" element={<TeacherCodesPage />} />
                  <Route path="/teacher/color-settings" element={<TeacherColorSettings />} />
                  <Route path="/teacher/analytics" element={<TeacherAnalyticsPage />} />
                  <Route path="/teacher/notifications" element={<TeacherNotificationsPage />} />
                  <Route path="/teacher/schedule" element={<TeacherSchedulePage />} />
                  <Route path="/teacher/multiplayer-quiz-management" element={<MultiplayerQuizManagement />} />

                  {/* Chapter and Group Routes */}
                  <Route path="/chapters" element={<ChaptersPage />} />
                  <Route path="/chapter/:chapterId" element={<ChapterDetailPage />} />
                  <Route path="/group/:groupId" element={<GroupDetailPage />} />
                  <Route path="/discussions" element={<DiscussionsPage />} />
                  
                  {/* Invoice Detail Route */}
                  <Route path="/invoices/:invoiceId" element={<InvoiceDetailPage />} />
                </Routes>
              </QueryClientProvider>
            </div>
          </AuthProvider>
        </LanguageProvider>
      </TenantProvider>
    </ThemeProvider>
  );
}

export default App;
