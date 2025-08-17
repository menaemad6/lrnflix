import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ChatbotProvider } from "@/contexts/ChatbotContext";
import Index from "./pages/Index";
import { TeacherDashboard } from "./pages/teacher/TeacherDashboard";
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { StudentStudents } from "./pages/teacher/StudentStudents";
import { StudentDetail } from "./pages/teacher/StudentDetail";
import { CoursePage } from './pages/courses/CoursePage';
import { CourseCreate } from './pages/teacher/CourseCreate';
import { CourseEdit } from './pages/teacher/CourseEdit';
import { TeacherCourses } from './pages/teacher/TeacherCourses';
import { PricingPage } from './pages/PricingPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { DiscussionsPage } from './pages/DiscussionsPage';
import { DiscussionDetail } from './pages/DiscussionDetail';
import { DiscussionsCreate } from './pages/DiscussionsCreate';
import { GroupsPage } from './pages/GroupsPage';
import { GroupDetail } from './pages/GroupDetail';
import { GroupCreate } from './pages/GroupCreate';
import { TeacherCodes } from './pages/teacher/TeacherCodes';
import { SettingsDashboard } from './pages/dashboard/SettingsDashboard';
import { StudentStore } from './pages/student/StudentStore';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <TenantProvider>
              <ChatbotProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  
                  {/* Teacher Routes */}
                  <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                  <Route path="/teacher/students" element={<StudentStudents />} />
                  <Route path="/teacher/students/:studentId" element={<StudentDetail />} />
                  
                  {/* Student Routes */}
                  <Route path="/student/dashboard" element={<StudentDashboard />} />
                  
                  <Route path="/courses/:courseId" element={<CoursePage />} />
                  <Route path="/teacher/courses/create" element={<CourseCreate />} />
                  <Route path="/teacher/courses/:courseId/edit" element={<CourseEdit />} />
                  <Route path="/teacher/courses" element={<TeacherCourses />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/discussions" element={<DiscussionsPage />} />
                  <Route path="/discussions/:discussionId" element={<DiscussionDetail />} />
                  <Route path="/discussions/create" element={<DiscussionsCreate />} />
                  <Route path="/groups" element={<GroupsPage />} />
                  <Route path="/groups/:groupId" element={<GroupDetail />} />
                  <Route path="/groups/create" element={<GroupCreate />} />
                  <Route path="/teacher/codes" element={<TeacherCodes />} />
                  <Route path="/dashboard/settings" element={<SettingsDashboard />} />
                  <Route path="/student/store" element={<StudentStore />} />
                </Routes>
              </ChatbotProvider>
            </TenantProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
