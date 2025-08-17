import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  BookOpen, 
  Users, 
  MessageSquare, 
  Settings, 
  Gift,
  GraduationCap,
  UserCheck
} from 'lucide-react';

interface DashboardSidebarProps {
  isTeacher?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const teacherNavItems = [
  { name: 'Dashboard', href: '/teacher/dashboard', icon: BarChart3 },
  { name: 'Courses', href: '/teacher/courses', icon: BookOpen },
  { name: 'Students', href: '/teacher/students', icon: UserCheck },
  { name: 'Groups', href: '/discussions', icon: Users },
  { name: 'Discussions', href: '/discussions', icon: MessageSquare },
  { name: 'Codes', href: '/teacher/codes', icon: Gift },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const studentNavItems = [
  { name: 'Dashboard', href: '/student/dashboard', icon: BarChart3 },
  { name: 'My Courses', href: '/student/courses', icon: BookOpen },
  { name: 'Groups', href: '/groups', icon: Users },
  { name: 'Discussions', href: '/discussions', icon: MessageSquare },
  { name: 'Store', href: '/student/store', icon: GraduationCap },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  isTeacher = false,
  isOpen,
  onClose
}) => {
  const navItems = isTeacher ? teacherNavItems : studentNavItems;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-r-muted py-4 px-3 flex-col transition-transform duration-300 transform-gpu",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0 lg:static lg:inset-0 lg:z-auto lg:w-64"
      )}
    >
      <nav className="flex flex-col space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="group flex items-center space-x-3 rounded-md p-2 text-sm font-medium hover:bg-secondary hover:text-foreground"
            onClick={onClose}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};
