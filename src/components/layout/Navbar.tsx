import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { SidebarLanguageSelector } from '@/components/ui/SidebarLanguageSelector';
import { Layout, LogOut, Home, Search, Store, Menu, Sidebar, MessageCircleQuestion, Gamepad2, Users, Gift, Bell, PieChart, DollarSign, CircleDollarSign, GraduationCap, BookOpen, X, Sun, Moon, Laptop, ChevronRight, User as UserIcon, MenuIcon, FileText, Settings } from 'lucide-react';
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
import { HiddenScrollbar } from '@/components/ui/hidden-scrollbar';
import type { User } from '@/store/slices/authSlice';
import WalletCardDesign from '@/components/student/WalletCardDesign'
import { PLATFORM_NAME } from '@/data/constants';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { FaBars } from 'react-icons/fa';

// Logo component to replace BookOpen icons
const Logo = ({ className = "" }: { className?: string }) => (
  <img src="/assests/logo.png" alt="Logo" className={className} />
);

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
  const { t } = useTranslation('navigation');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const isMobile = useIsMobile();
  const isLargeScreen = useIsLargeScreen();
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const { teacher, slug } = useTenant();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { theme, setTheme } = useTheme();

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
          // Home page with tenant: hide until scrolled past hero, then use scroll direction logic
          // Exception: show navbar immediately for 'pola' slug
          if (location.pathname === '/' && teacher && isLargeScreen && slug !== 'pola') {
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
  }, [isMobile, isLargeScreen, location.pathname, teacher, slug]);

  // Hide navbar completely on home route when there's no tenant
  if (location.pathname === '/' && !teacher) {
    return null;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const userRole = user?.role || 'student';

  // NAVIGATION LINKS
  const navLinks = [
    { to: '/', label: t('navbar.home'), icon: Home },
    ...(userRole === 'student'
      ? [
        { to: '/courses', label: t('navbar.courses'), icon: Search },
          { to: '/student/dashboard', label: t('navbar.dashboard'), icon: Layout },

        ]
      : []),
    ...(userRole === 'teacher'
      ? [
          { to: '/teacher/dashboard', label: t('navbar.dashboard'), icon: Layout },
        ]
      : []),
    ...(userRole === 'admin'
      ? [
          { to: '/admin/dashboard', label: t('navbar.dashboard'), icon: Layout },
        ]
      : []),
  ];

    // NAVIGATION LINKS FOR SIDENAVBAR
    let sideNavLinks = [
      { to: '/', label: t('navbar.home'), icon: Home },
      ...(userRole === 'student'
        ? [
          { to: '/student/dashboard', label: t('navbar.dashboard'), icon: Layout },
          { to: '/courses', label: t('navbar.courses'), icon: Search },
          { to: '/chapters', label: t('navbar.chapters'), icon: BookOpen },
          { to: '/multiplayer-quiz', label: t('navbar.quizGame'), icon: Gamepad2 },
          { to: '/student/groups', label: t('navbar.myGroups'), icon: Users },
          { to: '/teachers', label: t('navbar.teachers'), icon: GraduationCap },
          { to: '/student/store', label: t('navbar.store'), icon: CircleDollarSign },
          { to: '/questions', label: t('navbar.questions'), icon: MessageCircleQuestion },
          // { to: '/student/notifications', label: t('navbar.myNotifications'), icon: Bell },
  
          ]
        : []),
      ...(userRole === 'teacher'
        ? [
            { to: '/teacher/dashboard', label: t('navbar.dashboard'), icon: Layout },
            { to: '/teacher/courses', label: t('navbar.myCourses'), icon: BookOpen },
            { to: '/teacher/chapters', label: t('navbar.myChapters'), icon: BookOpen },
            { to: '/teacher/groups', label: t('navbar.myGroups'), icon: Users },
            { to: '/teacher/multiplayer-quiz', label: t('navbar.quizGame'), icon: Gamepad2 },
            { to: '/questions', label: t('navbar.questions'), icon: MessageCircleQuestion },
            { to: '/teacher/codes', label: t('navbar.walletCodes'), icon: Gift },
            // { to: '/teacher/notifications', label: t('navbar.notifications'), icon: Bell },
            { to: '/teacher/analytics', label: t('navbar.analytics'), icon: PieChart },
          ]
        : []),
      ...(userRole === 'admin'
        ? [
            { to: '/admin/dashboard', label: t('navbar.dashboard'), icon: Layout },
            { to: '/admin/invoices', label: t('navbar.invoices'), icon: FileText },
            { to: '/admin/analytics', label: t('navbar.analytics'), icon: PieChart },
            { to: '/admin/users', label: t('navbar.userManagement'), icon: Users },
            { to: '/admin/settings', label: t('navbar.settings'), icon: Settings },
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
      <nav className={`bg-card border border-border/20 fixed top-2 md:top-4 left-4 right-4 z-50 rounded-2xl shadow-xl backdrop-blur-xl ${extraXSpacing ? 'md:left-8 md:right-8 lg:left-16 lg:right-16' : ''} text-card-foreground transition-all duration-500 ease-in-out ${hidden ? '-translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'} max-w-full md:max-w-3xl lg:max-w-6xl mx-auto`}>
        <div className="px-6 py-2 md:py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Logo className="h-8 w-auto" />
              <span className="text-2xl font-bold text-black dark:text-white">{teacher?.display_name || PLATFORM_NAME}</span>
            </Link>
                         {isMobile ? (
               <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                 <SheetTrigger asChild>
                   <Button variant="ghost" size="icon" aria-label={t('navbar.openSidebar')}>
                     <FaBars className="h-7 w-7" />
                   </Button>
                 </SheetTrigger>
                                 <SheetContent side="right" className="w-full max-w-sm p-0 bg-background/95 backdrop-blur-xl border-l border-border/40">
                   <div className="flex flex-col h-full">
                     {/* Modernized Header */}
                     <div className="p-3 flex items-center justify-between">
                       <h2 className="text-base font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">More Options</h2>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="h-7 w-7 rounded-full bg-muted/50" 
                         onClick={() => setSheetOpen(false)}
                       >
                         <X className="h-3.5 w-3.5" />
                       </Button>
                     </div>
                     
                                           {/* Stylish Theme Selector */}
                      <div className="mx-3 p-2.5 rounded-lg bg-muted/50 backdrop-blur-sm border border-border/40">
                        <div className="font-medium text-xs mb-2 text-muted-foreground">Choose Theme</div>
                        <div className="grid grid-cols-3 gap-1.5">
                          <Button
                            variant={theme === 'light' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTheme('light')}
                            className="h-8 rounded-md text-xs px-2"
                          >
                            <Sun className="h-3.5 w-3.5 mr-1" />
                            Light
                          </Button>
                          <Button
                            variant={theme === 'dark' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTheme('dark')}
                            className="h-8 rounded-md text-xs px-2"
                          >
                            <Moon className="h-3.5 w-3.5 mr-1" />
                            Dark
                          </Button>
                          <Button
                            variant={theme === 'system' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTheme('system')}
                            className="h-8 rounded-md text-xs px-2"
                          >
                            <Laptop className="h-3.5 w-3.5 mr-1" />
                            Auto
                          </Button>
                        </div>
                      </div>
                      
                                             {/* Stylish Language Selector */}
                       <SidebarLanguageSelector variant="compact" className="mt-3" />
                     
                     {/* Profile Card - for non-authenticated users */}
                     <div className="p-3 mt-auto">
                       <div className="p-2.5 bg-muted/60 rounded-lg border border-border/40">
                         <div className="flex items-center mb-2.5">
                           <Avatar className="h-9 w-9 mr-2.5 border border-border/40">
                             <AvatarFallback className="bg-muted/80">
                               <UserIcon className="h-4 w-4 text-muted-foreground" />
                             </AvatarFallback>
                           </Avatar>
                           <div>
                             <p className="font-medium text-sm">Not signed in</p>
                             <p className="text-xs text-muted-foreground">Sign in to view your profile</p>
                           </div>
                         </div>
                         <div className="grid grid-cols-2 gap-1.5">
                           <Button
                             variant="default"
                             size="sm"
                             asChild
                             className="w-full h-8 text-xs"
                             onClick={() => setSheetOpen(false)}
                           >
                             <Link to="/auth/login">Sign In</Link>
                           </Button>
                           <Button
                             variant="outline"
                             size="sm"
                             asChild
                             className="w-full h-8 text-xs"
                             onClick={() => setSheetOpen(false)}
                           >
                             <Link to="/auth/signup">Sign Up</Link>
                           </Button>
                         </div>
                       </div>
                     </div>
                   </div>
                 </SheetContent>
              </Sheet>
            ) : (
              <div className="flex items-center space-x-4">
                <NavLink to="/" icon={Home} isActive={isActive}>{t('navbar.home')}</NavLink>
                <Separator orientation="vertical" className="h-8 mx-2" />
                <LanguageSwitcher />
                <Separator orientation="vertical" className="h-8 mx-2" />
                <ThemeToggle buttonClassName="glass hover-glow px-3 py-2 hover:bg-primary-500/20 focus:bg-primary/500/20 active:bg-primary/20 transition-colors group" iconClassName="group-hover:text-primary-500 transition-colors" />
                <Separator orientation="vertical" className="h-2 mx-2" />
                <Link to="/auth/login">
                  <Button className="hover-glow">{t('auth.login')}</Button>
                </Link>
                <Link to="/auth/signup">
                  <Button variant="outline" className="glass hover-glow">{t('auth.signup')}</Button>
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
    <nav className={`bg-card border border-border/20 fixed top-2 md:top-4 left-4 right-4 z-50 rounded-2xl shadow-xl backdrop-blur-xl ${extraXSpacing ? 'md:left-8 md:right-8 lg:left-16 lg:right-16' : ''} text-card-foreground transition-all duration-500 ease-in-out ${hidden ? '-translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'} max-w-full md:max-w-6xl mx-auto`}>
      <div className="px-6 py-2 md:py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Logo className="h-8 w-auto" />
            <span className="text-2xl font-bold text-black dark:text-white">{teacher?.display_name || PLATFORM_NAME}</span>
          </Link>
          {/* Sidebar Trigger and Profile Dropdown */}
          {isMobile ? (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-4 px-3" aria-label={t('navbar.openSidebar')}>
                <FaBars className="h-7 w-7" />
                </Button>
              </SheetTrigger>
                             <SheetContent side="right" className="w-full max-w-sm p-0 bg-background/95 backdrop-blur-xl border-l border-border/40">
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
              
              <LanguageSwitcher />

              <Separator orientation="vertical" className="h-8 mx-2" />

              <ThemeToggle buttonClassName="glass hover-glow px-3 py-2 hover:bg-primary-500/20 focus:bg-primary/20 active:bg-primary/20 transition-colors group" iconClassName="group-hover:text-primary-500 transition-colors" />
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
                        <BookOpen className="h-4 w-auto" />
                        {t('sidebar.myCourses')}
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <button
                        className="w-full flex items-center gap-2 justify-start px-2 py-1.5 rounded hover:bg-accent transition text-sm"
                        onClick={() => { setDropdownOpen(false); navigate('/student/notifications'); }}
                      >
                        <Bell className="h-4 w-4" />
                        {t('sidebar.notifications')}
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
                      {t('navbar.logout')}
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Separator orientation="vertical" className="h-8 mx-2" />

              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={t('navbar.openSidebar')} className='px-3'>
                  <FaBars className="h-7 w-7" />
                  </Button>
                </SheetTrigger>
                                 <SheetContent side="right" className="w-full max-w-sm p-0 bg-background/95 backdrop-blur-xl border-l border-border/40">
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
  iconBg?: string;
  iconColor?: string;
}

function NavbarSidebarContent({ user, navLinks, handleLogout, setSheetOpen, isActive }: { user: User | null, navLinks: NavLinkItem[], handleLogout: () => void, setSheetOpen?: (open: boolean) => void, isActive: (path: string) => boolean }) {
  const { t } = useTranslation('navigation');
  const { teacher } = useTenant();
  const { theme, setTheme } = useTheme();
  
  // Helper functions
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  const stripTenantFromEmail = (email: string) => {
    if (!email) return '';
    return email.split('@')[0];
  };
  
  const closeMoreMenu = () => {
    if (setSheetOpen) setSheetOpen(false);
  };
  
  // Sidebar items with styling
  const sidebarItems = navLinks.map((link) => ({
    ...link,
    iconBg: "bg-primary/10",
    iconColor: "text-primary"
  }));
  
  return (
    <div className="flex flex-col h-full">
      {/* Modernized Header */}
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">More Options</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full bg-muted/50" 
          onClick={closeMoreMenu}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
             {/* Stylish Theme Selector */}
       <div className="mx-4 p-3 rounded-xl bg-muted/50 backdrop-blur-sm border border-border/40">
         <div className="font-medium text-sm mb-2 text-muted-foreground">Choose Theme</div>
         <div className="grid grid-cols-3 gap-2">
           <Button
             variant={theme === 'light' ? 'default' : 'outline'}
             size="sm"
             onClick={() => setTheme('light')}
             className="h-9 rounded-lg"
           >
             <Sun className="h-4 w-4 mr-1.5" />
             Light
           </Button>
           <Button
             variant={theme === 'dark' ? 'default' : 'outline'}
             size="sm"
             onClick={() => setTheme('dark')}
             className="h-9 rounded-lg"
           >
             <Moon className="h-4 w-4 mr-1.5" />
             Dark
           </Button>
           <Button
             variant={theme === 'system' ? 'default' : 'outline'}
             size="sm"
             onClick={() => setTheme('system')}
             className="h-9 rounded-lg"
           >
             <Laptop className="h-4 w-4 mr-1.5" />
             Auto
           </Button>
         </div>
       </div>
       
               {/* Stylish Language Selector */}
        <SidebarLanguageSelector className="mt-3" />
      
      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto px-2">
        <div className="py-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link 
              key={item.to}
              to={item.to} 
              className="flex items-center justify-between p-3 hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors"
              onClick={closeMoreMenu}
            >
              <div className="flex items-center">
                <span className={cn("p-2 rounded-lg mr-3", item.iconBg)}>
                  <item.icon className={cn("h-5 w-5", item.iconColor)} />
                </span>
                <span className="font-medium">{item.label}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
      
      <Separator className="my-2" />
      
             {/* Profile Card - for both authenticated and non-authenticated users */}
       <div className="p-3">
         {user ? (
           <Link 
             to="/" 
             className="flex items-center space-x-3 p-2.5 bg-muted/60 hover:bg-primary/10 dark:hover:bg-primary/20 rounded-xl transition-colors border border-border/40"
             onClick={closeMoreMenu}
           >
             <Avatar className="h-10 w-10 border-2 border-primary/20">
               <AvatarImage src={user.avatar_url} alt={user.full_name || "User"} />
               <AvatarFallback className="bg-primary/10 text-primary">
                 {getInitials(user.full_name || "")}
               </AvatarFallback>
             </Avatar>
             <div className="flex-1 min-w-0">
               <p className="font-medium truncate text-sm">{user.full_name || "User"}</p>
               <p className="text-xs text-muted-foreground truncate">{stripTenantFromEmail(user.email) || "user@example.com"}</p>
               {/* <p className="text-xs text-primary mt-0.5">View Profile</p> */}
             </div>
             <ChevronRight className="h-4 w-4 text-muted-foreground" />
           </Link>
         ) : (
           <div className="p-2.5 bg-muted/60 rounded-xl border border-border/40">
             <div className="flex items-center mb-2.5">
                               <Avatar className="h-9 w-9 mr-2.5 border border-border/40">
                   <AvatarFallback className="bg-muted/80">
                     <UserIcon className="h-4 w-4 text-muted-foreground" />
                   </AvatarFallback>
                 </Avatar>
               <div>
                 <p className="font-medium text-sm">Not signed in</p>
                 <p className="text-xs text-muted-foreground">Sign in to view your profile</p>
               </div>
             </div>
             <div className="grid grid-cols-2 gap-1.5">
               <Button
                 variant="default"
                 size="sm"
                 asChild
                 className="w-full h-8 text-xs"
                 onClick={closeMoreMenu}
               >
                 <Link to="/auth/login">Sign In</Link>
               </Button>
               <Button
                 variant="outline"
                 size="sm"
                 asChild
                 className="w-full h-8 text-xs"
                 onClick={closeMoreMenu}
               >
                 <Link to="/auth/signup">Sign Up</Link>
               </Button>
             </div>
           </div>
         )}
       </div>
      
             {/* Sign Out Button - show only if authenticated */}
       {user && (
         <div className="p-3 pt-0">
           <Button
             variant="outline"
             size="sm"
             onClick={() => {
               handleLogout();
               closeMoreMenu();
             }}
             className="w-full flex items-center justify-center h-9 rounded-lg border-dashed"
           >
             <LogOut className="h-4 w-4 mr-2 text-destructive" />
             <span className="text-destructive">Sign Out</span>
           </Button>
         </div>
       )}
    </div>
  );
}
