import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { BookOpen, Layout, LogOut, Home, Search, Store, Menu, Sidebar, MessageCircleQuestion, Gamepad2, Users, Gift, Bell, PieChart, DollarSign, CircleDollarSign, GraduationCap } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { RootState } from '@/store/store';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile, useIsLargeScreen } from '@/hooks/use-mobile';
import { useTheme } from '@/contexts/ThemeContext';
import { useTenant } from '@/contexts/TenantContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { ModernScrollbar } from '@/components/ui/modern-scrollbar';
import type { User } from '@/store/slices/authSlice';
import WalletCardDesign from '@/components/student/WalletCardDesign'
import { PLATFORM_NAME } from '@/data/constants';

// NavLink must be above NavbarSidebarContent for scope
const NavLink = ({ to, children, icon: Icon, onClick, className = "", isActive }: { to: string; children: React.ReactNode; icon: React.ComponentType<{ className?: string }>; onClick?: () => void; className?: string; isActive: (path: string) => boolean }) => (
  <Link to={to} onClick={onClick} className={`w-full ${className}`.trim()}>
    <Button 
      variant={isActive(to) ? "default" : "ghost"} 
      className={`transition-all duration-300 w-full justify-start text-foreground bg-transparent ${isActive(to) ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10 hover:text-primary'}`}
    >
      <Icon className="h-4 w-4 mr-2" />
      {children}
    </Button>
  </Link>
);

export const Navbar = ({ extraXSpacing = false }: { extraXSpacing?: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const isMobile = useIsMobile();
  const isLargeScreen = useIsLargeScreen();
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const { teacher } = useTenant();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setHidden(false);
      return;
    }
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          // Home page: hide until scrolled past hero, then use scroll direction logic
          if (location.pathname === '/' && isLargeScreen) {
            if (currentScrollY < window.innerHeight) {
              setHidden(true);
            } else {
              // After hero: hide on scroll down, show on scroll up
              if (currentScrollY === 0) {
                setHidden(false);
              } else if (currentScrollY > lastScrollY.current) {
                setHidden(true);
              } else if (currentScrollY < lastScrollY.current) {
                setHidden(false);
              }
            }
          } else if (isLargeScreen) {
            // Other pages: hide on scroll down, show on scroll up
            if (currentScrollY === 0) {
              setHidden(false);
            } else if (currentScrollY > lastScrollY.current) {
              setHidden(true);
            } else if (currentScrollY < lastScrollY.current) {
              setHidden(false);
            }
          } else {
            // On mobile, always show
            setHidden(false);
          }
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile, isLargeScreen, location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const userRole = user?.role || 'student';

  // NAVIGATION LINKS
  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    ...(userRole === 'student'
      ? [
        { to: '/courses', label: 'Courses', icon: Search },
          { to: '/student/dashboard', label: 'Dashboard', icon: Layout },

        ]
      : []),
    ...((userRole === 'teacher' || userRole === 'admin')
      ? [
          { to: '/teacher/dashboard', label: 'Dashboard', icon: Layout },
        ]
      : []),
  ];

    // NAVIGATION LINKS FOR SIDENAVBAR
    let sideNavLinks = [
      { to: '/', label: 'Home', icon: Home },
      ...(userRole === 'student'
        ? [
          { to: '/student/dashboard', label: 'Dashboard', icon: Layout },
          { to: '/teachers', label: 'Teachers', icon: GraduationCap },
          { to: '/courses', label: 'Courses', icon: Search },
          { to: '/student/store', label: 'Store', icon: CircleDollarSign },
          { to: '/chapters', label: 'Chapters', icon: BookOpen },
          { to: '/student/groups', label: 'My Groups', icon: Users },
          { to: '/questions', label: 'Questions', icon: MessageCircleQuestion },
          { to: '/multiplayer-quiz', label: 'Quiz Game', icon: Gamepad2 },
          { to: '/student/notifications', label: 'My Notifications', icon: Bell },
  
          ]
        : []),
      ...((userRole === 'teacher' || userRole === 'admin')
        ? [
            { to: '/teacher/dashboard', label: 'Dashboard', icon: Layout },
            { to: '/teacher/chapters', label: 'My Chapters', icon: BookOpen },
            { to: '/questions', label: 'Questions', icon: MessageCircleQuestion },
            { to: '/teacher/multiplayer-quiz', label: 'Quiz Game', icon: Gamepad2 },
            { to: '/teacher/groups', label: 'My Groups', icon: Users },
            { to: '/teacher/codes', label: 'Wallet Codes', icon: Gift },
            { to: '/teacher/notifications', label: 'Notifications', icon: Bell },
            { to: '/teacher/analytics', label: 'Analytics', icon: PieChart },
          ]
        : []),
    ];

  // Hide the Teachers link (second in the student links) if there is a teacher in the tenant
  if (userRole === 'student' && teacher) {
    sideNavLinks = sideNavLinks.filter((link, idx) => !(idx === 2 && link.to === '/teachers'));
  }

  // UNAUTHENTICATED NAVBAR
  if (!isAuthenticated) {
    return (
      <nav className={`glass-card border border-border/20 fixed top-4 left-4 right-4 z-50 rounded-2xl shadow-xl ${extraXSpacing ? 'md:left-8 md:right-8 lg:left-16 lg:right-16' : ''} bg-white/60 dark:bg-transparent backdrop-blur-xl text-card-foreground transition-all duration-500 ease-in-out ${hidden ? '-translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'} max-w-full md:max-w-3xl lg:max-w-6xl mx-auto`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold gradient-text">{teacher?.display_name || PLATFORM_NAME}</span>
            </Link>
            {isMobile ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="glass hover-glow">
                  <Sidebar className="h-[1.2rem] w-[1.2rem]" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="pt-0 w-72 rounded-l-2xl shadow-2xl bg-card text-foreground flex flex-col h-full justify-between">
                  <div className="flex flex-col h-full">
                    {/* Top: Logo and Theme Toggle (not scrollable) */}
                    <div className="flex flex-col gap-2 pt-8 pb-2 px-6 border-b border-border/10">
                      <div className="flex flex-col items-center justify-center w-full">
                        <BookOpen className="h-8 w-8 text-primary mb-1" />
                        <span className="text-2xl font-bold gradient-text text-center w-full">{teacher?.display_name || PLATFORM_NAME}</span>
                      </div>
                      <div className="mt-4">
                        <ThemeSegmentedToggle />
                      </div>
                    </div>
                    {/* Login/Signup Buttons (directly below theme toggler) */}
                    <div className="px-1 pb-4 pt-8 flex flex-col gap-3">
                      <div>
                        <Link to="/auth/login">
                          <Button className="hover-glow w-full">Login</Button>
                        </Link>
                        <div className="text-xs text-muted-foreground mt-1 text-center">
                          Access your account and continue learning
                        </div>
                      </div>
                      <div>
                        <Link to="/auth/signup">
                          <Button variant="outline" className="glass hover-glow w-full">Sign Up</Button>
                        </Link>
                        <div className="text-xs text-muted-foreground mt-1 text-center">
                          Create a free account to get started
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <div className="flex items-center space-x-4">
                <NavLink to="/" icon={Home} isActive={isActive}>Home</NavLink>
                <Separator orientation="vertical" className="h-8 mx-2" />
                <ThemeToggle buttonClassName="glass hover-glow px-3 py-2 hover:bg-emerald-500/20 focus:bg-primary/20 active:bg-primary/20 transition-colors group" iconClassName="group-hover:text-emerald-500 transition-colors" />
                <Separator orientation="vertical" className="h-8 mx-2" />
                <Link to="/auth/login">
                  <Button className="hover-glow">Login</Button>
                </Link>
                <Link to="/auth/signup">
                  <Button variant="outline" className="glass hover-glow">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  }

  // AUTHENTICATED NAVBAR
  return (
    <nav className={`glass-card border border-border/20 fixed top-4 left-4 right-4 z-50 rounded-2xl shadow-xl ${extraXSpacing ? 'md:left-8 md:right-8 lg:left-16 lg:right-16' : ''} bg-white/60 dark:bg-transparent backdrop-blur-xl text-card-foreground transition-all duration-500 ease-in-out ${hidden ? '-translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'} max-w-full md:max-w-3xl lg:max-w-6xl mx-auto`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">{teacher?.display_name || PLATFORM_NAME}</span>
          </Link>
          {/* Sidebar Trigger and Profile Dropdown */}
          {isMobile ? (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="glass hover-glow ml-4" aria-label="Open Sidebar">
                  <Sidebar className="h-[1.2rem] w-[1.2rem]" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="pt-0 w-72 rounded-l-2xl shadow-2xl bg-card text-foreground flex flex-col h-full justify-between">
                <NavbarSidebarContent user={user} navLinks={sideNavLinks} handleLogout={handleLogout} setSheetOpen={setSheetOpen} isActive={isActive} />
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex items-center space-x-4">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} icon={link.icon} className="hidden lg:inline-flex" isActive={isActive}>
                  {link.label}
                </NavLink>
              ))}
              
              <Separator orientation="vertical" className="h-8 mx-2" />
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="glass hover-glow flex items-center justify-center hover:bg-primary/10 focus:bg-primary/20 active:bg-primary/20 transition-colors" aria-label="Profile">
                    <Avatar className="h-10 w-10">
                      {user?.avatar_url ? (
                        <AvatarImage src={user.avatar_url} alt={user?.full_name || user?.email || 'User'} />
                      ) : (
                        <AvatarFallback className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-lg uppercase focus:ring-2 focus:ring-primary/40">
                          {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-64 p-4 mt-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-12 w-12">
                      {user?.avatar_url ? (
                        <AvatarImage src={user.avatar_url} alt={user?.full_name || user?.email || 'User'} />
                      ) : (
                        <AvatarFallback className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xl uppercase">
                          {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-semibold text-base truncate text-foreground">{user?.full_name || 'User'}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{user?.email}</div>
                      { userRole === 'student' && <div className="mt-2"><WalletCardDesign wallet={user?.wallet} /></div> }
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="flex flex-col gap-2 my-2">
                    <DropdownMenuItem asChild>
                      <button
                        className="w-full flex items-center gap-2 justify-start px-2 py-1.5 rounded hover:bg-accent transition text-sm"
                        onClick={() => { setDropdownOpen(false); navigate('/student/courses'); }}
                      >
                        <BookOpen className="h-4 w-4" />
                        My Courses
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <button
                        className="w-full flex items-center gap-2 justify-start px-2 py-1.5 rounded hover:bg-accent transition text-sm"
                        onClick={() => { setDropdownOpen(false); navigate('/student/notifications'); }}
                      >
                        <Bell className="h-4 w-4" />
                        My Notifications
                      </button>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <button
                      onClick={handleLogout}
                      className="w-full mt-2 flex items-center gap-2 text-destructive font-semibold py-2 px-2 rounded hover:bg-destructive/10 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Separator orientation="vertical" className="h-8 mx-2" />
              <ThemeToggle buttonClassName="glass hover-glow px-3 py-2 hover:bg-emerald-500/20 focus:bg-primary/20 active:bg-primary/20 transition-colors group" iconClassName="group-hover:text-emerald-500 transition-colors" />
              <Separator orientation="vertical" className="h-8 mx-2" />
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="glass hover-glow px-3 py-2 hover:bg-emerald-500/20 focus:bg-primary/20 active:bg-primary/20 transition-colors group" aria-label="Open Sidebar">
                    <Sidebar className="h-[1.2rem] w-[1.2rem] transition-colors group-hover:text-emerald-500" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="pt-0 w-72 lg:w-96 rounded-l-2xl shadow-2xl bg-card text-foreground flex flex-col h-full">
                  <NavbarSidebarContent user={user} navLinks={sideNavLinks} handleLogout={handleLogout} setSheetOpen={setSheetOpen} isActive={isActive} />
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

function ThemeSegmentedToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex w-full rounded-xl bg-background/70 border border-border/20 shadow-inner overflow-hidden">
      <button
        className={`flex-1 py-2 text-sm font-medium transition-all ${theme === 'light' ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5 text-foreground'} focus:outline-none`}
        onClick={() => setTheme('light')}
        aria-pressed={theme === 'light'}
      >
        <span className="flex items-center justify-center gap-1"><span className="i-lucide-sun" />Light</span>
      </button>
      <button
        className={`flex-1 py-2 text-sm font-medium transition-all ${theme === 'dark' ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5 text-foreground'} focus:outline-none`}
        onClick={() => setTheme('dark')}
        aria-pressed={theme === 'dark'}
      >
        <span className="flex items-center justify-center gap-1"><span className="i-lucide-moon" />Dark</span>
      </button>
      <button
        className={`flex-1 py-2 text-sm font-medium transition-all ${theme === 'system' ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5 text-foreground'} focus:outline-none`}
        onClick={() => setTheme('system')}
        aria-pressed={theme === 'system'}
      >
        <span className="flex items-center justify-center gap-1"><span className="i-lucide-monitor" />Auto</span>
      </button>
    </div>
  );
}

// Reusable sidebar content for Navbar (move above Navbar for scope)
interface NavLinkItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

function NavbarSidebarContent({ user, navLinks, handleLogout, setSheetOpen, isActive }: { user: User | null, navLinks: NavLinkItem[], handleLogout: () => void, setSheetOpen?: (open: boolean) => void, isActive: (path: string) => boolean }) {
  const { teacher } = useTenant();
  return (
    <div className="flex flex-col h-full">
      {/* Top: Logo and Theme Toggle (not scrollable) */}
      <div className="flex flex-col gap-2 pt-8 pb-2 px-6 border-b border-border/10">
        <div className="flex flex-col items-center justify-center w-full">
          <BookOpen className="h-8 w-8 text-primary mb-1" />
          <span className="text-2xl font-bold gradient-text text-center w-full">{teacher?.display_name || PLATFORM_NAME}</span>
        </div>
        <div className="mt-4">
          <ThemeSegmentedToggle />
        </div>
      </div>
      {/* Middle: Scrollable Links */}
      <ModernScrollbar maxHeight="calc(100vh - 270px)">
        <div className="flex flex-col gap-2 px-1 mt-2">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} icon={link.icon} onClick={setSheetOpen ? () => setSheetOpen(false) : undefined} isActive={isActive}>
              {link.label}
            </NavLink>
          ))}
        </div>
      </ModernScrollbar>
      {/* Bottom: Profile Card and Logout (not scrollable) */}
      <div className="px-1 pb-4 pt-2 flex flex-col gap-2 mt-auto">
        <Card className="p-2 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-black font-bold text-base">
              {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate">{user?.full_name || 'User'}</div>
              <div className="text-[10px] text-muted-foreground truncate">{user?.email}</div>
            </div>
          </div>
        </Card>
        <Button 
          variant="destructive"
          size="sm"
          onClick={handleLogout}
          className="w-full text-sm font-bold rounded-lg shadow flex items-center justify-center gap-2 py-2"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
