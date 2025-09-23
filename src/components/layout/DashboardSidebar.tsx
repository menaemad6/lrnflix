import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  BookOpen, 
  Layout, 
  Users, 
  MessageSquare, 
  Settings, 
  Search,
  Trophy,
  PieChart,
  Bell,
  Gift,
  BarChart3,
  Target,
  Zap,
  Brain,
  ChevronLeft,
  Sparkles,
  GraduationCap,
  Menu,
  CreditCard,
  ArrowBigLeft,
  ChevronRight,
  File,
  Calendar,
  Palette,
  FileText,
  Shield,
  Crown,
  Database,
  Activity
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HiddenScrollbar } from '@/components/ui/hidden-scrollbar';
import { useChatbot } from '@/contexts/ChatbotContext';
import { useTenant } from '@/contexts/TenantContext';
import type { RootState } from '@/store/store';
import { useIsMobile } from '@/hooks/use-mobile';
import { PLATFORM_NAME } from '@/data/constants';
import { useTranslation } from 'react-i18next';

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
}

export const DashboardSidebar = () => {
  const { t } = useTranslation('navigation');
  const { state, toggleSidebar } = useSidebar();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { openChatbot } = useChatbot();
  const { teacher } = useTenant();
  const userRole = user?.role || 'student';
  const isCollapsed = state === 'collapsed';
  const isMobile = useIsMobile();

  const isActive = (path: string) => location.pathname === path;

  const studentMenuItems: MenuItem[] = [
    { 
      title: t('sidebar.dashboard'), 
      url: "/student/dashboard", 
      icon: Layout,
      description: t('sidebar.overview')
    },
    { 
      title: t('sidebar.myCourses'), 
      url: "/student/courses", 
      icon: BookOpen,
      description: t('sidebar.continueLearning')
    },
    { 
      title: t('sidebar.myChapters'), 
      url: "/student/chapters", 
      icon: BookOpen,
      description: t('sidebar.learningPaths')
    },

    { 
      title: t('sidebar.learningGroups'), 
      url: "/student/groups", 
      icon: Users,
      description: t('sidebar.collaborateLearn')
    },
    { 
      title: t('sidebar.invoices'), 
      url: "/student/transactions", 
      icon: FileText,
      description: t('sidebar.viewInvoices')
    },
    // { 
    //   title: t('sidebar.aiTutor'), 
    //   url: "/student/ai-tutor", 
    //   icon: Brain,
    //   description: t('sidebar.personalAssistant'),
    //   badge: "New"
    // },
    // { 
    //   title: t('sidebar.notifications'), 
    //   url: "/student/notifications", 
    //   icon: Bell,
    //   description: t('sidebar.stayUpdated')
    // },

  ];

  const teacherMenuItems: MenuItem[] = [
    { 
      title: t('sidebar.dashboard'), 
      url: "/teacher/dashboard", 
      icon: Layout,
      description: t('sidebar.courseOverview')
    },

    { 
      title: t('sidebar.myCourses'), 
      url: "/teacher/courses", 
      icon: BookOpen,
      description: t('sidebar.manageContent')
    },
    { 
      title: t('sidebar.myChapters'), 
      url: "/teacher/chapters", 
      icon: File,
      description: t('sidebar.learningPaths')
    },
    { 
      title: t('sidebar.learningGroups'), 
      url: "/teacher/groups", 
      icon: Users,
      description: t('sidebar.studentManagement')
    },
    { 
      title: t('sidebar.invoices'), 
      url: "/teacher/invoices", 
      icon: FileText,
      description: t('sidebar.manageInvoices')
    },
    { 
      title: t('sidebar.students'), 
      url: "/teacher/students", 
      icon: GraduationCap,
      description: t('sidebar.studentManagement')
    },
    { 
      title: t('sidebar.schedule'), 
      url: "/teacher/schedule", 
      icon: Calendar,
      description: t('sidebar.schedule')
    },
    { 
      title: t('sidebar.quizzes'), 
      url: "/teacher/multiplayer-quiz", 
      icon: Trophy,
      description: t('sidebar.manageContent')
    },
    { 
      title: t('sidebar.analytics'), 
      url: "/teacher/analytics", 
      icon: Layout,
      description: t('sidebar.viewAnalytics')
    },
    { 
      title: t('navbar.walletCodes'), 
      url: "/teacher/codes", 
      icon: Gift,
      description: t('sidebar.rewardStudents')
    },
    { 
      title: t('sidebar.brandColors'), 
      url: "/teacher/colors", 
      icon: Palette,
      description: t('sidebar.customizeBrand')
    },
    // { 
    //   title: "Notifications", 
    //   url: "/teacher/notifications", 
    //   icon: Bell,
    //   description: "Stay updated"
    // },
    { 
      title: t('sidebar.settings'), 
      url: "/dashboard/settings", 
      icon: Settings,
      description: t('sidebar.preferences')
    },
  ];

  const adminMenuItems: MenuItem[] = [
    {
      title: t('sidebar.dashboard'), 
      url: "/admin/dashboard", 
      icon: Layout,
      description: t('sidebar.adminOverview')
    },
    {
      title: t('sidebar.invoices'), 
      url: "/admin/invoices", 
      icon: FileText,
      description: t('sidebar.manageAllInvoices')
    },
    {
      title: t('sidebar.systemAnalytics'), 
      url: "/admin/analytics", 
      icon: BarChart3,
      description: t('sidebar.platformAnalytics')
    },
    {
      title: t('sidebar.userManagement'), 
      url: "/admin/users", 
      icon: Users,
      description: t('sidebar.manageUsers')
    },
    {
      title: t('sidebar.systemSettings'), 
      url: "/admin/settings", 
      icon: Settings,
      description: t('sidebar.platformSettings')
    },
  ];

  const menuItems = userRole === 'student' ? studentMenuItems : 
                   userRole === 'admin' ? adminMenuItems : 
                   teacherMenuItems;

  const handleAskAI = () => {
    openChatbot();
  };

  return (
    <>
      {/* Sidebar Opener Button: Show on mobile or when collapsed */}
      {(isMobile || isCollapsed) && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="fixed top-1/2 left-[-25px] -translate-y-1/2 rounded-full z-50 w-16 h-16 p-0 flex items-center justify-center bg-gradient-to-br from-primary-500/80 to-secondary-500/80 shadow-xl border-2 border-white/30 hover:from-primary-400 hover:to-secondary-400 hover:scale-105 hover:shadow-primary-400/30 transition-all duration-300"
          title={t('sidebar.openSidebar')}
        >
          <ChevronRight className={`h-8 w-8 ml-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
        </Button>
      )}

      <Sidebar className="glass-card border-r border-white/10 bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-xl">
        <SidebarHeader className="p-6 border-b border-white/5 relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center animate-glow-pulse shadow-lg shadow-primary-500/25 overflow-hidden">
              <img 
                src="/assests/logo.png" 
                alt="Logo" 
                className="h-8 w-8 object-contain"
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-xl font-bold gradient-text bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                  {teacher?.display_name || PLATFORM_NAME }
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-muted-foreground capitalize font-medium">
                    {userRole === 'admin' ? 'Admin Portal' : `${userRole} Portal`}
                  </span>
                </div>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="absolute -bottom-3 left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"></div>
          )}
        </SidebarHeader>
        {/* Collapse Button: Centered vertically on the right edge of the sidebar, half-circle style */}
        {!isCollapsed && (
          <div className="absolute top-1/2 right-0 -translate-y-1/2 z-50 w-16 h-16 flex items-center justify-end overflow-visible pointer-events-none">
            <div className="w-1/2 h-full overflow-hidden flex items-center justify-center pointer-events-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="w-16 h-16 rounded-l-full rounded-r-none bg-gradient-to-br from-primary-500/80 to-secondary-500/80 shadow-xl border-2 border-white/30 hover:from-primary-400 hover:to-secondary-400 hover:scale-105 hover:shadow-primary-400/30 transition-all duration-300 flex items-center justify-center p-0"
                title={t('sidebar.collapseSidebar')}
                style={{ borderRight: 'none' }}
              >
                <ChevronLeft className="h-8 w-8 text-white drop-shadow-lg" />
              </Button>
            </div>
          </div>
        )}

        <SidebarContent className="p-4">
          <HiddenScrollbar maxHeight="calc(100vh - 200px)">
            <div className="pr-2">
              <SidebarGroup>
                <SidebarGroupLabel className={`text-primary-400/80 font-medium mb-4 flex items-center gap-2 ${isCollapsed ? "justify-center" : ""}`}>
                  {!isCollapsed && (
                    <>
                      <Zap className="h-4 w-4" />
                      Main Menu
                    </>
                  )}
                  {isCollapsed && <Zap className="h-4 w-4" />}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {menuItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <Link 
                            to={item.url} 
                            className={`group flex items-center gap-3 px-3 h-14 min-h-14 rounded-2xl transition-all duration-300 relative overflow-hidden backdrop-blur-sm whitespace-nowrap w-full min-w-0 max-w-full
                              ${isActive(item.url) 
                                ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-primary-500 glow border border-primary-500/30 shadow-lg shadow-primary-500/20 pointer-events-none' 
                                : 'hover:bg-primary-600/15 hover:text-white hover:shadow-lg hover:shadow-primary-500/20'}
                              ${isCollapsed ? 'justify-center' : ''}`}
                            title={isCollapsed ? item.title : ''}
                            style={{ minWidth: 0 }}
                          >
                            <div className={`p-2 rounded-xl transition-all duration-300 flex-shrink-0
                              ${isActive(item.url) 
                                ? 'bg-primary-500/20 text-primary-500 shadow-lg shadow-primary-500/25' 
                                : 'group-hover:bg-primary-600/20 group-hover:text-white group-hover:shadow-md'}
                            `}>
                              <item.icon className="h-5 w-5" />
                            </div>
                            {!isCollapsed && (
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between min-w-0">
                                  <div className="font-semibold text-xs truncate min-w-0 text-ellipsis overflow-hidden">{item.title}</div>
                                  {item.badge && (
                                    <Badge className="bg-primary-500 text-black text-xs font-medium shadow-lg ml-2 whitespace-nowrap">{item.badge}</Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground truncate min-w-0 text-ellipsis overflow-hidden">{item.description}</div>
                              </div>
                            )}
                            {isActive(item.url) && (
                              <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-primary-400 to-secondary-400 rounded-r shadow-lg shadow-primary-400/50" />
                            )}
                            {isActive(item.url) && !isCollapsed && (
                              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 rounded-2xl pointer-events-none" />
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </div>
          </HiddenScrollbar>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-white/5">
          {/* Quick Actions: Always visible, right before the student card */}
          {!isCollapsed && (
            <div>
              
              <SidebarGroupContent>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-primary-500/20 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-black" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-primary-400">AI Assistant</div>
                      <div className="text-xs text-muted-foreground">Get instant help</div>
                    </div>
                  </div>
                  <Button 
                    onClick={handleAskAI}
                    className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-black font-semibold text-xs py-2 rounded-xl shadow-lg shadow-primary-500/25 border border-primary-400/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/30"
                  >
                    Ask AI
                  </Button>
                </div>
              </SidebarGroupContent>
            </div>
          )}
          
          {!isCollapsed && user && (
            <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-black font-bold">
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{user?.full_name || 'User'}</div>
                  <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                </div>
              </div>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
    </>
  );
};
