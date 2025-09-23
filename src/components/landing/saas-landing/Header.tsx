import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import type { RootState } from '@/store/store';
import { PLATFORM_NAME } from '@/data/constants';
import { FaBars } from 'react-icons/fa';
import { LogInIcon, LogOut } from 'lucide-react';
import MobileNavigation from '@/components/landing/saas-landing/MobileNavigation';

// Header Component
const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const userRole = user?.role || 'student';
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  
  // Add scroll effect for navbar background
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Debug logging
  console.log('Header render - isScrolled:', isScrolled);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const heroHeight = window.innerHeight - 112; // 7rem = 112px
      const shouldBeScrolled = scrollPosition > heroHeight;
      console.log('Scroll handler:', { scrollPosition, heroHeight, shouldBeScrolled });
      setIsScrolled(shouldBeScrolled);
    };

    // Check initial scroll position
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    setIsMobileNavOpen(false);
  };

  const closeMobileNav = () => {
    setIsMobileNavOpen(false);
    // Re-enable body scroll
    document.body.style.overflow = 'unset';
  };

  const openMobileNav = () => {
    setIsMobileNavOpen(true);
    // Disable body scroll when mobile nav is open
    document.body.style.overflow = 'hidden';
  };

  // Cleanup effect to restore body scroll when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const getAuthButton = () => {
    if (isAuthenticated) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 p-2 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar_url || undefined} />
                <AvatarFallback>
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className={`hidden sm:inline text-sm font-medium transition-colors duration-300 ${
                isScrolled ? 'text-black' : 'text-white'
              }`}>
                {user?.full_name || user?.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center justify-start p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                <p className="text-xs leading-none text-muted-foreground capitalize">
                  {userRole}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            {userRole === 'student' && (
              <>
                <DropdownMenuItem onClick={() => navigate('/student/dashboard')}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/student/courses')}>
                  My Courses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/student/chapters')}>
                  My Chapters
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/student/groups')}>
                  Learning Groups
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/student/transactions')}>
                  Invoices
                </DropdownMenuItem>
              </>
            )}
            {userRole === 'teacher' && (
              <>
                <DropdownMenuItem onClick={() => navigate('/teacher/dashboard')}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/teacher/courses')}>
                  My Courses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/teacher/chapters')}>
                  My Chapters
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/teacher/groups')}>
                  Learning Groups
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/teacher/analytics')}>
                  Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/teacher/codes')}>
                  Wallet Codes
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <div className="flex items-center space-x-3">
        <Button 
          variant="ghost" 
          className={`transition-colors duration-300 ${
            isScrolled ? 'text-black' : 'text-white'
          }`}
          onClick={() => navigate('/auth/login')}
        >
          Sign In
        </Button>
        <Button 
          onClick={() => navigate('/auth/signup')}
          className="bg-black py-2 px-4 rounded-sm cursor-pointer"
        >
          Start Learning
        </Button>
      </div>
    );
  };

  const getNavLinks = () => {
    const linkClass = `transition-colors duration-300 ${
      isScrolled 
        ? 'text-black hover:text-gray-700' 
        : 'text-white hover:text-gray-200'
    }`;
    
    if (!isAuthenticated) {
      return (
        <>
          <li><Link to="/courses" className={linkClass}>Courses</Link></li>
          <li><Link to="/chapters" className={linkClass}>Chapters</Link></li>
          <li><Link to="/teachers" className={linkClass}>Instructors</Link></li>
        </>
      );
    }

    // Authenticated user navigation
    if (userRole === 'student') {
      return (
        <>
          <li><Link to="/student/dashboard" className={linkClass}>Dashboard</Link></li>
          <li><Link to="/student/courses" className={linkClass}>My Courses</Link></li>
          <li><Link to="/student/chapters" className={linkClass}>Chapters</Link></li>
          <li><Link to="/student/groups" className={linkClass}>Groups</Link></li>
          <li><Link to="/courses" className={linkClass}>Browse Courses</Link></li>
        </>
      );
    }

    if (userRole === 'teacher') {
      return (
        <>
          <li><Link to="/teacher/dashboard" className={linkClass}>Dashboard</Link></li>
          <li><Link to="/teacher/courses" className={linkClass}>My Courses</Link></li>
          <li><Link to="/teacher/chapters" className={linkClass}>Chapters</Link></li>
          <li><Link to="/teacher/groups" className={linkClass}>Groups</Link></li>
          <li><Link to="/teacher/analytics" className={linkClass}>Analytics</Link></li>
        </>
      );
    }

    return null;
  };

  return (
    <header 
      className={`flex justify-between items-center px-6 py-4 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out h-16 ${
        isScrolled 
          ? 'bg-gradient-to-r from-[#E0E7FD] to-[#FDFEFF] shadow-md backdrop-blur-md' 
          : 'bg-transparent'
      }`}
      style={{
        backgroundColor: isScrolled ? undefined : 'transparent',
        backdropFilter: isScrolled ? undefined : 'none'
      }}
    >
      <Link to="/" className="cursor-pointer flex items-center space-x-2">
        <img src="/assests/logo.png" alt="Logo" className="h-8 w-auto"/>
        <span className={`font-semibold text-xl transition-colors duration-300 ${
          isScrolled ? 'text-black' : 'text-white'
        }`}>{PLATFORM_NAME}</span>
      </Link>
      
      <button 
        onClick={openMobileNav}
        className="block md:hidden p-2 hover:bg-black/5 rounded-lg transition-colors"
        aria-label="Open mobile menu"
      >
        <FaBars className={`h-6 w-6 transition-colors duration-300 ${
          isScrolled ? 'text-black' : 'text-white'
        }`} />
      </button>
      
      <nav className="hidden md:block">
        <ul className="flex gap-6 items-center">
          {getNavLinks()}
          {getAuthButton()}
        </ul>
      </nav>

      {/* Mobile Navigation Overlay */}
      {isMobileNavOpen && (
        <MobileNavigation 
          isOpen={isMobileNavOpen}
          onClose={closeMobileNav}
          isAuthenticated={isAuthenticated}
          userRole={userRole}
          user={user}
          onLogout={handleLogout}
        />
      )}
    </header>
  );
};

export default Header;
