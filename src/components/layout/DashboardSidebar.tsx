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
  CreditCard
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
import { ModernScrollbar } from '@/components/ui/modern-scrollbar';
import { useChatbot } from '@/contexts/ChatbotContext';
import type { RootState } from '@/store/store';

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
}

export const DashboardSidebar = () => {
  const { state, toggleSidebar } = useSidebar();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { openChatbot } = useChatbot();
  const userRole = user?.role || 'student';
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => location.pathname === path;

  const studentMenuItems: MenuItem[] = [
    { 
      title: "Dashboard", 
      url: "/student/dashboard", 
      icon: Layout,
      description: "Overview & Analytics"
    },
    { 
      title: "My Courses", 
      url: "/student/courses", 
      icon: BookOpen,
      description: "Continue learning"
    },
    { 
      title: "My Chapters", 
      url: "/student/chapters", 
      icon: BookOpen,
      description: "Learning paths"
    },

    { 
      title: "Learning Groups", 
      url: "/student/groups", 
      icon: Users,
      description: "Collaborate & Learn"
    },
    { 
      title: "Transactions", 
      url: "/student/transactions", 
      icon: CreditCard,
      description: "View wallet history"
    },
    { 
      title: "Notifications", 
      url: "/student/notifications", 
      icon: Bell,
      description: "Stay updated"
    },
    { 
      title: "Achievements", 
      url: "/student/achievements", 
      icon: Trophy,
      description: "Track progress"
    },
    { 
      title: "AI Tutor", 
      url: "/student/ai-tutor", 
      icon: Brain,
      description: "Personal assistant",
      badge: "New"
    },

  ];

  const teacherMenuItems: MenuItem[] = [
    { 
      title: "Dashboard", 
      url: "/teacher/dashboard", 
      icon: Layout,
      description: "Teaching overview"
    },
    { 
      title: "My Courses", 
      url: "/teacher/courses", 
      icon: BookOpen,
      description: "Manage content"
    },
    { 
      title: "My Chapters", 
      url: "/teacher/chapters", 
      icon: BookOpen,
      description: "Learning paths"
    },
    { 
      title: "Manage Groups", 
      url: "/teacher/groups", 
      icon: Users,
      description: "Student communities"
    },
    { 
      title: "Analytics", 
      url: "/teacher/analytics", 
      icon: PieChart,
      description: "Performance insights"
    },
    { 
      title: "Wallet Codes", 
      url: "/teacher/codes", 
      icon: Gift,
      description: "Reward students"
    },
    { 
      title: "Notifications", 
      url: "/teacher/notifications", 
      icon: Bell,
      description: "Stay updated"
    },
  ];

  const menuItems = userRole === 'student' ? studentMenuItems : teacherMenuItems;

  const handleAskAI = () => {
    openChatbot();
  };

  return (
    <>
      {/* Collapsed Sidebar Handler - Only show when collapsed */}
      {isCollapsed && (
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="fixed left-4 top-20 z-50 w-12 h-12 p-0 hover:bg-white/10 hover:text-emerald-400 transition-all duration-300 rounded-xl bg-background/80 border border-white/10 shadow-lg hover:shadow-xl backdrop-blur-sm"
          title="Open Sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      <Sidebar className="glass-card border-r border-white/10 bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-xl pt-20">
        {/* <SidebarHeader className="p-6 border-b border-white/5 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center animate-glow-pulse shadow-lg shadow-emerald-500/25">
                <BookOpen className="h-7 w-7 text-black" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-xl font-bold gradient-text bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    EduPlatform
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-muted-foreground capitalize font-medium">
                      {userRole} Portal
                    </span>
                  </div>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="w-8 h-8 p-0 hover:bg-white/10 hover:text-emerald-400 transition-all duration-300 rounded-lg bg-background/50 border border-white/10 shadow-lg hover:shadow-xl"
            >
              <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
            </Button>
          </div>
          {!isCollapsed && (
            <div className="absolute -bottom-3 left-6 right-6 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
          )}
        </SidebarHeader> */}

        <SidebarContent className="p-4">
          <ModernScrollbar maxHeight="calc(100vh - 200px)">
            <div className="pr-2">
              <SidebarGroup>
                <SidebarGroupLabel className={`text-emerald-400/80 font-medium mb-4 flex items-center gap-2 ${isCollapsed ? "justify-center" : ""}`}>
                  {!isCollapsed && (
                    <>
                      <Zap className="h-4 w-4" />
                      Main Menu
                    </>
                  )}
                  {isCollapsed && <Zap className="h-4 w-4" />}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-2">
                    {menuItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <Link 
                            to={item.url} 
                            className={`group flex items-center gap-2 px-3  rounded-2xl transition-all duration-300 relative overflow-hidden backdrop-blur-sm ${
                              isActive(item.url) 
                                ? 'py-8 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 glow border border-emerald-500/30 shadow-lg shadow-emerald-500/20' 
                                : 'py-4 hover:bg-white/10 hover:text-emerald-300 hover-glow hover:shadow-lg hover:shadow-white/10'
                            } ${isCollapsed ? 'justify-center' : ''}`}
                            title={isCollapsed ? item.title : ''}
                          >
                            <div className={`p-2 rounded-xl transition-all duration-300 ${
                              isActive(item.url) 
                                ? 'bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/25' 
                                : 'group-hover:bg-emerald-500/10 group-hover:shadow-md'
                            }`}>
                              <item.icon className="h-5 w-5" />
                            </div>
                            {!isCollapsed && (
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-semibold text-sm whitespace-nowrap">{item.title}</div>
                                    <div className="text-xs text-muted-foreground truncate whitespace-nowrap">{item.description}</div>
                                  </div>
                                  {item.badge && (
                                    <Badge className="bg-emerald-500 text-black text-xs font-medium shadow-lg">
                                      {item.badge}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                            {isActive(item.url) && (
                              <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-teal-400 rounded-r shadow-lg shadow-emerald-400/50" />
                            )}
                            {isActive(item.url) && !isCollapsed && (
                              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-2xl pointer-events-none" />
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {!isCollapsed && (
                <SidebarGroup className="mt-8">
                  <SidebarGroupLabel className="text-emerald-400/80 font-medium mb-4 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Quick Actions
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-black" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-emerald-400">AI Assistant</div>
                          <div className="text-xs text-muted-foreground">Get instant help</div>
                        </div>
                      </div>
                      <Button 
                        onClick={handleAskAI}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-black font-semibold text-xs py-2 rounded-xl shadow-lg shadow-emerald-500/25 border border-emerald-400/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30"
                      >
                        Ask AI
                      </Button>
                    </div>
                  </SidebarGroupContent>
                </SidebarGroup>
              )}
            </div>
          </ModernScrollbar>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-white/5">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link
                  to="/dashboard/settings"
                  className={`group flex items-center gap-2 px-3 py-2 rounded-2xl hover:bg-white/10 hover:text-emerald-300 hover-glow transition-all duration-300 backdrop-blur-sm ${
                    isCollapsed ? 'justify-center' : ''
                  }`}
                  title={isCollapsed ? 'Settings' : ''}
                >
                  <div className="p-2 rounded-xl group-hover:bg-emerald-500/10 transition-all duration-300">
                    <Settings className="h-5 w-5" />
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm whitespace-nowrap">Settings</div>
                      <div className="text-xs text-muted-foreground truncate whitespace-nowrap">Preferences</div>
                    </div>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          
          {!isCollapsed && user && (
            <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-black font-bold">
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
