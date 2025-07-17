import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { BookOpen, Layout, LogOut, Home, Search, Store, Menu } from 'lucide-react';
import type { RootState } from '@/store/store';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/contexts/ThemeContext';
import { useTenant } from '@/contexts/TenantContext';

export const Navbar = ({ extraXSpacing = false }: { extraXSpacing?: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const isMobile = useIsMobile();
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { teacher } = useTenant();

  useEffect(() => {
    if (isMobile) return;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 64) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isMobile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ to, children, icon: Icon, onClick }: { to: string; children: React.ReactNode; icon: React.ComponentType<{ className?: string }>; onClick?: () => void }) => (
    <Link to={to} onClick={onClick} className="w-full">
      <Button 
        variant={isActive(to) ? "default" : "ghost"} 
        className={`transition-all duration-300 w-full justify-start text-foreground bg-transparent ${isActive(to) ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'} `}
      >
        <Icon className="h-4 w-4 mr-2" />
        {children}
      </Button>
    </Link>
  );

  const userRole = user?.role || 'student';

  // NAVIGATION LINKS
  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    ...(userRole === 'student'
      ? [
        { to: '/courses', label: 'Courses', icon: Search },
          { to: '/student/dashboard', label: 'Dashboard', icon: Layout },
          { to: '/student/store', label: 'Store', icon: Store },
        ]
      : []),
    ...((userRole === 'teacher' || userRole === 'admin')
      ? [
          { to: '/teacher/dashboard', label: 'Dashboard', icon: Layout },
        ]
      : []),
  ];

  // UNAUTHENTICATED NAVBAR
  if (!isAuthenticated) {
    return (
      <nav className={`glass-card border border-border/20 fixed top-4 left-4 right-4 z-50 rounded-2xl shadow-xl ${extraXSpacing ? 'md:left-8 md:right-8 lg:left-16 lg:right-16' : ''} bg-white/60 dark:bg-transparent backdrop-blur-xl text-card-foreground transition-all duration-500 ease-in-out ${hidden ? '-translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold gradient-text">{teacher?.display_name || 'EduPlatform'}</span>
            </Link>
            {isMobile ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="glass hover-glow">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="pt-8 w-64 glass-card">
                  <div className="flex flex-col gap-4">
                    <NavLink to="/" icon={Home}>Home</NavLink>
                    <div className="px-2"><ThemeToggle /></div>
                    <Link to="/auth/login">
                      <Button className="hover-glow w-full">Login</Button>
                    </Link>
                    <Link to="/auth/signup">
                      <Button variant="outline" className="glass hover-glow w-full">Sign Up</Button>
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <div className="flex items-center space-x-4">
                <NavLink to="/" icon={Home}>Home</NavLink>
                <div className="px-2"><ThemeToggle /></div>
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
    <nav className={`glass-card border border-border/20 fixed top-4 left-4 right-4 z-50 rounded-2xl shadow-xl ${extraXSpacing ? 'md:left-8 md:right-8 lg:left-16 lg:right-16' : ''} bg-white/60 dark:bg-transparent backdrop-blur-xl text-card-foreground transition-all duration-500 ease-in-out ${hidden ? '-translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">{teacher?.display_name || 'EduPlatform'}</span>
          </Link>
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="glass hover-glow">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pt-0 w-72 rounded-r-2xl shadow-2xl bg-white/80 dark:bg-black/40 text-foreground flex flex-col h-full justify-between">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3 px-6 pt-8 pb-2 border-b border-border/10">
                    <BookOpen className="h-8 w-8 text-primary" />
                    <span className="text-2xl font-bold gradient-text">EduPlatform</span>
                  </div>
                  <div className="px-4 mt-4">
                    <ThemeSegmentedToggle />
                  </div>
                  <div className="flex flex-col gap-2 px-1 mt-2">
                    {navLinks.map((link) => (
                      <NavLink key={link.to} to={link.to} icon={link.icon} onClick={() => {}}>
                        {link.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
                <div className="px-1 pb-8 pt-4 flex flex-col gap-4">
                  <div className="bg-card/80 rounded-xl p-4 flex items-center gap-3 shadow border border-border/10">
                    <div className="flex items-center justify-center rounded-full bg-primary/20 text-primary font-bold w-12 h-12 text-xl">
                      {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base truncate text-foreground">{user?.full_name || 'User'}</div>
                      <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                      <Link to="/student/profile" className="text-xs text-primary underline hover:text-primary/80 transition">View Profile</Link>
                    </div>
                  </div>
                  <Button 
                    variant="destructive"
                    size="lg"
                    onClick={handleLogout}
                    className="w-full text-lg font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 py-4"
                  >
                    <LogOut className="h-6 w-6" />
                    Sign Out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex items-center space-x-4">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} icon={link.icon}>
                  {link.label}
                </NavLink>
              ))}
              <div className="flex-shrink-0 px-2"><ThemeToggle /></div>
              <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-border/20">
                <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                  {user?.full_name || user?.email}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="glass hover-glow hover:bg-destructive/20"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
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
