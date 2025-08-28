import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { getTopCourses, getFeaturedInstructors } from '@/lib/queries';
import { PLATFORM_NAME } from '@/data/constants';
import { 
  FaArrowRight, 
  FaLinkedin, 
  FaPinterest, 
  FaTiktok, 
  FaTwitter, 
  FaYoutube,
  FaCheck,
  FaBars,
  FaStar,
  FaUsers,
  FaPlay,
  FaRegistered
} from 'react-icons/fa';
import { 
  GoBell, 
  GoGoal 
} from 'react-icons/go';
import { LuLeaf } from 'react-icons/lu';
import { MdLockOutline, MdOutlineArrowOutward } from 'react-icons/md';
import { IoMdCheckmark } from 'react-icons/io';
import { AiFillInstagram } from 'react-icons/ai';
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
import IphoneShowcaseSection from '../home/IphoneShowcaseSection';
import { LogInIcon, LogOut } from 'lucide-react';


// Type definitions
interface ButtonProps {
  text: string;
  onClick?: () => void;
}

interface TestimonialData {
  id: number;
  text: string;
  name: string;
  handle: string;
  avatar: string;
}

interface CourseData {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  price: number;
  profiles?: {
    full_name: string;
  };
  enrollments?: Array<{
    count: number;
  }>;
}



// Local Button Component (renamed to avoid conflict)
const LocalButton: React.FC<ButtonProps> = ({ text , onClick}) => {
  return (
    <button className="text-white bg-black py-2 px-4 rounded-sm cursor-pointer" onClick={onClick}>
      {text}
    </button>
  );
};



const TopLine: React.FC = () => {
  return (
    <div className="bg-black text-white p-3 text-sm text-center cursor-pointer h-12 flex items-center justify-center">
          <span className="hidden sm:inline pr-2 opacity-80">
            🚀 First AI-powered gamified learning platform in Egypt
          </span>
          <span className="pr-1">
            <Link to="/auth/signup">
            Start learning for free <FaArrowRight className="inline h-2 w-2" />
            </Link>
          </span>
    </div>
  )
}


// Header Component
const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const userRole = user?.role || 'student';
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

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
              <span className="hidden sm:inline text-sm font-medium text-black">
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
                  Wallet
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
          className='text-black'
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
    if (!isAuthenticated) {
      return (
        <>
          <li><Link to="/courses" className='text-black hover:text-gray-700 transition-colors'>Courses</Link></li>
          <li><Link to="/chapters" className='text-black hover:text-gray-700 transition-colors'>Chapters</Link></li>
          <li><Link to="/teachers" className='text-black hover:text-gray-700 transition-colors'>Instructors</Link></li>

        </>
      );
    }

    // Authenticated user navigation
    if (userRole === 'student') {
      return (
        <>
          <li><Link to="/student/dashboard" className='text-black hover:text-gray-700 transition-colors'>Dashboard</Link></li>
          <li><Link to="/student/courses" className='text-black hover:text-gray-700 transition-colors'>My Courses</Link></li>
          <li><Link to="/student/chapters" className='text-black hover:text-gray-700 transition-colors'>Chapters</Link></li>
          <li><Link to="/student/groups" className='text-black hover:text-gray-700 transition-colors'>Groups</Link></li>
          <li><Link to="/courses" className='text-black hover:text-gray-700 transition-colors'>Browse Courses</Link></li>
        </>
      );
    }

    if (userRole === 'teacher') {
      return (
        <>
          <li><Link to="/teacher/dashboard" className='text-black hover:text-gray-700 transition-colors'>Dashboard</Link></li>
          <li><Link to="/teacher/courses" className='text-black hover:text-gray-700 transition-colors'>My Courses</Link></li>
          <li><Link to="/teacher/chapters" className='text-black hover:text-gray-700 transition-colors'>Chapters</Link></li>
          <li><Link to="/teacher/groups" className='text-black hover:text-gray-700 transition-colors'>Groups</Link></li>
          <li><Link to="/teacher/analytics" className='text-black hover:text-gray-700 transition-colors'>Analytics</Link></li>
        </>
      );
    }

    return null;
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 backdrop-blur-md sticky top-0 z-30 bg-gradient-to-r from-[#E0E7FD] to-[#FDFEFF] shadow-md h-16">
      <Link to="/" className="cursor-pointer flex items-center space-x-2">
        <img src="/assests/logo.png" alt="Logo" className="h-8 w-auto"/>
        <span className="text-black font-semibold text-xl">{PLATFORM_NAME}</span>
      </Link>
      
      <button 
        onClick={openMobileNav}
        className="block md:hidden p-2 hover:bg-black/5 rounded-lg transition-colors"
        aria-label="Open mobile menu"
      >
        <FaBars className="h-6 w-6 text-black" />
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

// Mobile Navigation Component
const MobileNavigation: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  userRole: string;
  user: RootState['auth']['user'];
  onLogout: () => void;
}> = ({ isOpen, onClose, isAuthenticated, userRole, user, onLogout }) => {
  const navigate = useNavigate();

  const getMobileNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { label: 'Browse Courses', action: () => { navigate('/courses'); onClose(); } },
        { label: 'Chapters', action: () => { navigate('/chapters'); onClose(); } },
        { label: 'Instructors', action: () => { navigate('/teachers'); onClose(); } },
      ];
    }

    if (userRole === 'student') {
      return [
        { label: 'Dashboard', action: () => navigate('/student/dashboard') },
        { label: 'My Courses', action: () => navigate('/student/courses') },
        { label: 'Chapters', action: () => navigate('/student/chapters') },
        { label: 'Groups', action: () => navigate('/student/groups') },
        { label: 'Browse Courses', action: () => navigate('/courses') },
        { label: 'Wallet', action: () => navigate('/student/transactions') }
      ];
    }

    if (userRole === 'teacher') {
      return [
        { label: 'Dashboard', action: () => navigate('/teacher/dashboard') },
        { label: 'My Courses', action: () => navigate('/teacher/courses') },
        { label: 'Chapters', action: () => navigate('/teacher/chapters') },
        { label: 'Groups', action: () => navigate('/teacher/groups') },
        { label: 'Analytics', action: () => navigate('/teacher/analytics') },
        { label: 'Wallet Codes', action: () => navigate('/teacher/codes') }
      ];
    }

    return [];
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 z-[9999]"
      />
      
      {/* Navigation Panel */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] flex flex-col bg-black"
        style={{ 
          height: '100vh', 
          width: '100vw'
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 flex-shrink-0">
          <Link to="/" onClick={onClose} className="cursor-pointer flex items-center space-x-2">
            <img src="/assests/logo.png" alt="Logo" className="h-8 w-auto"/>
            <span className="text-white font-semibold text-xl">{PLATFORM_NAME}</span>
          </Link>
          
          <button
            onClick={onClose}
            className="p-2 text-white"
            aria-label="Close mobile menu"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <span className="text-2xl font-bold">×</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-6 space-y-6">
            {/* Navigation Links */}
            <div className="">
              {getMobileNavLinks().map((link, index) => (
                <button
                  key={index}
                  onClick={link.action}
                  className="w-full text-left py-2 text-white text-3xl font-semibold hover:text-gray-300 transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Section - Fixed at bottom */}
        <div className="px-6 pb-6 mb-12">
          {isAuthenticated ? (
            <div className="bg-neutral-900 border border-neutral-600 p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-white font-bold text-lg">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-gray-300 text-sm">
                  {user?.email}
                </p>
              </div>
              
              <div className="border-t border-gray-700 pt-4 space-y-3">

                <button
                  onClick={onLogout}
                  className="w-full text-left text-white hover:text-gray-300 transition-colors flex items-center justify-between"
                >
                  Log Out
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-600 p-6 space-y-4">
                <button
                  onClick={() => { navigate('/auth/login'); onClose(); }}
                  className="w-full text-left text-white hover:text-gray-300 transition-colors flex items-center justify-between"
                >
                  Login
                  <LogOut className="h-5 w-5" />
                </button>
                <button
                  onClick={() => { navigate('/auth/signup'); onClose(); }}
                  className="w-full text-left text-white hover:text-gray-300 transition-colors flex items-center justify-between"
                >
                  Create New Account
                  <LogInIcon className="h-5 w-5" />
                </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Hero Component
const Hero: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const userRole = user?.role || 'student';

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });
  const translateY = useTransform(scrollYProgress, [0, 1], [150, -150]);
  // Enhanced parallax effects for Hero section
      // Cylinder: Cool scroll effect - moves to left bottom with bigger movement
    const cylinderTranslateY = useTransform(
      scrollYProgress, 
      [0, 0.25, 0.6, 1], 
      [-100, 50, 200, 300]
    );
    
    // Add horizontal movement for cylinder to go left with bigger movement
    const cylinderTranslateX = useTransform(
      scrollYProgress,
      [0, 0.25, 0.6, 1],
      [50, 0, -100, -200]
    );
  
  // Half-torus: Opposite movement pattern
  const halfTorusTranslateY = useTransform(
    scrollYProgress, 
    [0, 0.4, 0.8, 1], 
    [0, -200, 300, -100]
  );

  // Add rotation effects
  const cylinderRotate = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0, 25, -15]
  );

  const halfTorusRotate = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0, -30, 20]
  );

  // Add scale effects for depth
  const cylinderScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1, 1.15, 0.9]
  );

  const halfTorusScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1, 0.85, 1.1]
  );

  // Function to get CTA buttons based on authentication and role
  const getCTAButtons = () => {
    if (!isAuthenticated) {
      return (
        <>
          <Button 
            className="text-white bg-black py-2 px-4 rounded-sm cursor-pointer"
            onClick={() => navigate('/auth/signup')}
          >
            Start Learning Free
          </Button>
          <div 
            className="cursor-pointer hover:underline text-black"
            onClick={() => navigate('/courses')}
          >
             Browse Courses
            <FaArrowRight className="h-3 w-3 inline ml-2" />
          </div>
        </>
      );
    }

    if (userRole === 'student') {
      return (
        <>
          <Button 
            className="text-white bg-black py-2 px-4 rounded-sm cursor-pointer"
            onClick={() => navigate('/student/dashboard')}
          >
            Continue Learning
          </Button>
          <div 
            className="cursor-pointer hover:underline text-black"
            onClick={() => navigate('/courses')}
          >
            Browse Courses
            <FaArrowRight className="h-3 w-3 inline ml-2" />
          </div>
        </>
      );
    }

    if (userRole === 'teacher') {
      return (
        <>
          <Button 
            className="text-white bg-black py-2 px-4 rounded-sm cursor-pointer"
            onClick={() => navigate('/teacher/dashboard')}
          >
            Manage
          </Button>
          <div 
            className="cursor-pointer hover:underline text-black"
            onClick={() => navigate('/teacher/courses')}
          >
            Create Course
            <FaArrowRight className="h-3 w-3 inline ml-2" />
          </div>
        </>
      );
    }

    // Fallback for other roles
    return (
      <>
        <Button 
          className="text-white bg-black py-2 px-4 rounded-sm cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </Button>
        <div 
          className="cursor-pointer hover:underline text-black"
          onClick={() => navigate('/courses')}
        >
          Explore Platform
          <FaArrowRight className="h-3 w-3 inline ml-2" />
        </div>
      </>
    );
  };

  return (
    <section
      ref={heroRef}
      className="min-h-[calc(100vh-7rem)] md:h-[calc(100vh-7rem)] p-4 sm:p-8 md:p-10 lg:p-20 font-medium bg-gradient-to-tr from-[#001E80] via-[#e4eaff] overflow-x-clip md:items-center gap-3 relative flex items-center py-8 md:py-0"
    >
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full max-w-7xl mx-auto">
        <div className="w-full md:w-[478px] text-center md:text-left">
          <div className="text-black border-2 w-fit py-0.5 px-1.5 lg:text-lg rounded-sm border-slate-400/80 mx-auto md:mx-0">
            First in Egypt
          </div>
          <div className="text-5xl md:text-7xl font-black my-7 bg-gradient-to-b from-black to-[#002499] text-transparent bg-clip-text tracking-tighter">
            AI-Powered Learning
          </div>
          <div className="text-xl lg:text-2xl tracking-tighter opacity-85 text-black">
            Experience the future of education with Egypt's first AI-powered, gamified learning platform. 
            Personalized learning paths, multiplayer quizzes, and AI tutors that adapt to your style.
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 text-lg">
            {getCTAButtons()}
          </div>
        </div>

        <div className="pt-8 md:pt-0 md:h-[648px] md:w-[648px] relative flex justify-center md:justify-start">
          <motion.img
            src="/assests/cylinder.png"
            alt="Cylinder"
            className="hidden md:block md:absolute -left-8 -top-8 z-10"
            style={{
              translateY: cylinderTranslateY,
              translateX: cylinderTranslateX,
            }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
            }}
          />
          <motion.img
            src="/assests/Visual.png"
            alt="Hero Image"
            className="w-full h-auto max-w-[280px] sm:max-w-[350px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[648px] md:absolute md:h-full md:w-auto relative z-20 mx-auto md:mx-0"
            animate={{
              translateY: [-30, 30],
            }}
            transition={{
              repeat: Infinity,
              repeatType: "mirror",
              duration: 3,
              ease: "easeInOut",
            }}
          />
          <motion.img
            src="/assests/half-torus.png"
            alt="HalfTorus"
            className="hidden lg:block md:absolute left-[400px] top-[500px] z-10"
            style={{
              translateY: halfTorusTranslateY,
              rotate: halfTorusRotate,
              scale: halfTorusScale,
            }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 15,
            }}
          />
        </div>
      </div>
    </section>
  );
};

// Brand Slide Component
const BrandSlide: React.FC = () => {
  return (
    <div className="pt-8 bg-white px-4 md:p-12 flex justify-center">
      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black,transparent)] w-[1200px]">
        <motion.div
          className="flex gap-14 flex-none items-center justify-center pr-14"
          animate={{
            translateX: "-50%",
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
          }}
        >
          <img src="/assests/logo-acme.png" alt="Cairo University" className="h-8 w-auto" />
          <img src="/assests/logo-apex.png" alt="Ain Shams University" className="h-8 w-auto" />
          <img src="/assests/logo-celestial.png" alt="Alexandria University" className="h-8 w-auto" />
          <img src="/assests/logo-echo.png" alt="Mansoura University" className="h-8 w-auto" />
          <img src="/assests/logo-pulse.png" alt="Zagazig University" className="h-8 w-auto" />
          <img src="/assests/logo-quantum.png" alt="Assiut University" className="h-8 w-auto" />

          <img src="/assests/logo-acme.png" alt="Cairo University" className="h-8 w-auto" />
          <img src="/assests/logo-apex.png" alt="Ain Shams University" className="h-8 w-auto" />
          <img src="/assests/logo-celestial.png" alt="Alexandria University" className="h-8 w-auto" />
          <img src="/assests/logo-echo.png" alt="Mansoura University" className="h-8 w-auto" />
          <img src="/assests/logo-pulse.png" alt="Zagazig University" className="h-8 w-auto" />
          <img src="/assests/logo-quantum.png" alt="Assiut University" className="h-8 w-auto" />
        </motion.div>
      </div>
    </div>
  );
};

// Product Showcase Component
const ProductShowcase: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Enhanced parallax effects with dramatic movement
  // Pyramid: Starts high, falls down fast, then rises up
  const pyramidTranslateY = useTransform(
    scrollYProgress, 
    [0, 0.3, 0.7, 1], 
    [0, 400, -200, 100]
  );
  
  // Tube: Starts low, rises up fast, then falls down
  const tubeTranslateY = useTransform(
    scrollYProgress, 
    [0, 0.3, 0.7, 1], 
    [0, -300, 200, -100]
  );

  // Add rotation for more dynamic effect
  const pyramidRotate = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0, 15, -10]
  );

  const tubeRotate = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0, -20, 15]
  );

  // Add scale effect for depth
  const pyramidScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1, 1.1, 0.95]
  );

  const tubeScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1, 0.9, 1.05]
  );

  return (
    <div
      ref={sectionRef}
      className="bg-gradient-to-t from-[#acbae8] to-white flex flex-col items-center pb-24 relative"
    >
      <div className="flex flex-col items-center font-medium mt-24 px-8 mx-auto md:w-[550px] lg:w-[630px]">
        <div className="text-black border-2 w-fit p-0.5 px-3 text-sm rounded-xl border-slate-300/80">
           AI-Powered Learning
        </div>
        <div className="text-3xl md:text-4xl lg:text-5xl py-6 font-bold tracking-tighter text-center bg-gradient-to-b from-black to-[#002499] text-transparent bg-clip-text">
          Revolutionary AI Tutor & Gamified Learning
        </div>

        <div className="text-center text-lg mb-8 md:text-xl text-black">
          Experience personalized learning with our AI tutor Hossam, multiplayer quiz games, 
          and intelligent content recommendations. The first platform of its kind in Egypt.
        </div>
      </div>
      <div className="relative">
        <motion.img
          src="/assests/pyramid.png"
          alt="Pyramid Image"
          className="absolute -right-24 -top-20 w-72 h-72 hidden md:block z-20"
          style={{
            translateY: pyramidTranslateY,
            rotate: pyramidRotate,
            scale: pyramidScale,
          }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
          }}
        />
        <img src="/assests/Product Image.png" alt="Product Image" className="px-1 relative z-10 w-full max-w-6xl mx-auto" />
        <motion.img
          src="/assests/tube.png"
          alt="Tube Image"
          className="absolute w-72 h-72 top-64 -left-28 hidden md:block z-20"
          style={{
            translateY: tubeTranslateY,
            rotate: tubeRotate,
            scale: tubeScale,
          }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
          }}
        />
      </div>


    </div>
  );
};

// Product Card Component
const ProductCard: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Enhanced parallax effects for cube helixes with delay and bigger movement
  // Left helix (cube-helix 1): Goes up, then down, then to bottom left
  const leftHelixTranslateY = useTransform(
    scrollYProgress, 
    [0, 0.25, 0.55, 0.8, 1], 
    [120, 120, -80, 220, 520]
  );
  
  const leftHelixTranslateX = useTransform(
    scrollYProgress, 
    [0, 0.25, 0.55, 0.8, 1], 
    [0, 0, 0, -100, -300]
  );

  // Right helix (cube-helix): Goes up, then down, then to bottom right
  const rightHelixTranslateY = useTransform(
    scrollYProgress, 
    [0, 0.25, 0.55, 0.8, 1], 
    [120, 120, -80, 220, 520]
  );
  
  const rightHelixTranslateX = useTransform(
    scrollYProgress, 
    [0, 0.25, 0.55, 0.8, 1], 
    [0, 0, 0, 100, 300]
  );

  // Add rotation effects for dynamic movement with delay
  const leftHelixRotate = useTransform(
    scrollYProgress,
    [0, 0.25, 0.55, 0.8, 1],
    [0, 0, 45, -25, -35]
  );

  const rightHelixRotate = useTransform(
    scrollYProgress,
    [0, 0.25, 0.55, 0.8, 1],
    [0, 0, -60, 35, 50]
  );



  return (
    <div 
      ref={sectionRef}
      className="pb-28 flex flex-col items-center bg-gradient-to-t from-[#afbbe4] via-[#e4eaff] to-white relative overflow-x-hidden"
    >
      {/* Premium Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs for premium feel */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-blue-200/30 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-indigo-200/25 to-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-100/20 to-blue-100/15 rounded-full blur-3xl"></div>
      </div>

      <div className="flex flex-col items-center justify-center pt-28 px-12 pb-10 md:w-[600px] relative z-10">
        <div className="border-2 w-fit p-0.5 px-3 text-sm rounded-xl border-slate-300/80 text-black bg-white/80 backdrop-blur-sm shadow-lg">
           Complete Learning Platform
        </div>
        <div className="text-3xl md:text-4xl lg:text-5xl py-6 font-bold tracking-tighter text-center bg-gradient-to-b from-black to-[#002499] text-transparent bg-clip-text">
          Everything you need to learn and teach
        </div>

        <div className="text-center text-lg mb-8 md:text-xl text-black">
          From course creation to student management, our platform provides all the tools 
          needed for modern education. AI-powered insights, gamified learning, and comprehensive analytics.
        </div>
      </div>

      <div className="flex flex-col gap-16 pt-4 lg:flex-row justify-center items-center px-8 relative z-10">
        <div className="shadow-2xl rounded-xl flex justify-center items-center flex-col p-8 max-w-[400px] relative z-20 bg-white/90 backdrop-blur-md border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-105">
          <motion.img 
            src="/assests/cube-helix 1.png" 
            alt="Helix" 
            className="pb-4"
            style={{
              translateY: leftHelixTranslateY,
              translateX: leftHelixTranslateX,
              rotate: leftHelixRotate,
            }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
            }}
          />
          <div className="text-2xl font-bold pb-3 text-center text-black">
            Course Management
          </div>
          <div className="text-center text-black">
            Create, organize, and manage courses with rich content, multimedia support, 
            and AI-powered question generation for engaging learning experiences.
          </div>
        </div>

        <div className="shadow-2xl rounded-xl flex justify-center items-center flex-col p-8 max-w-[400px] relative z-20 bg-white/90 backdrop-blur-md border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-105">
          <motion.img 
            src="/assests/cube-helix.png" 
            alt="Cube" 
            className="pb-4"
            style={{
              translateY: rightHelixTranslateY,
              translateX: rightHelixTranslateX,
              rotate: rightHelixRotate,
            }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
            }}
          />
          <div className="text-2xl font-bold pb-3 text-center text-black">
            Student Analytics
          </div>
          <div className="text-center text-black">
            Track student progress, identify learning gaps, and provide personalized 
            recommendations with our advanced AI-powered analytics dashboard.
          </div>
        </div>
      </div>
    </div>
  );
};

// Testimonials Component
const Testimonials: React.FC = () => {
  const testimonials: TestimonialData[] = [
    {
      id: 1,
      text: "Lrnflix has completely transformed how I teach. The AI-powered question generation saves me hours, and my students love the gamified learning experience.",
      name: "Dr. Ahmed Hassan",
      handle: "Computer Science Professor",
      avatar: "/assests/avatar-1.png"
    },
    {
      id: 2,
      text: "As Egypt's first AI-powered learning platform, Lrnflix has set a new standard for educational technology. The multiplayer quizzes make learning fun and competitive.",
      name: "Sarah Mahmoud",
      handle: "High School Teacher",
      avatar: "/assests/avatar-6.png"
    },
    {
      id: 3,
      text: "The AI tutor Hossam is incredible! It's like having a personal tutor available 24/7. This platform is exactly what Egypt's education system needed.",
      name: "Omar El-Sayed",
      handle: "University Student",
      avatar: "/assests/avatar-3.png"
    },
    {
      id: 4,
      text: "I've tried many learning platforms, but Lrnflix's gamification features and AI insights are unmatched. It's revolutionizing education in Egypt.",
      name: "Fatima Ali",
      handle: "Educational Consultant",
      avatar: "/assests/avatar-7.png"
    },
    {
      id: 5,
      text: "The personalized learning paths and AI recommendations have helped my students improve dramatically. This is the future of education.",
      name: "Dr. Karim Mostafa",
      handle: "Engineering Professor",
      avatar: "/assests/avatar-2.png"
    },
    {
      id: 6,
      text: "Finally, an Egyptian platform that competes with international standards! The AI-powered features and gamified learning make studying enjoyable.",
      name: "Layla Ahmed",
      handle: "Medical Student",
      avatar: "/assests/avatar-5.png"
    },
    {
      id: 7,
      text: "Lrnflix's multiplayer quiz system has created a competitive learning environment that motivates my students to study harder and perform better.",
      name: "Prof. Hana Ibrahim",
      handle: "Mathematics Department",
      avatar: "/assests/avatar-4.png"
    },
    {
      id: 8,
      text: "The platform's ability to generate questions from PDFs using AI is groundbreaking. It saves me countless hours while maintaining quality.",
      name: "Dr. Youssef Khalil",
      handle: "Physics Professor",
      avatar: "/assests/avatar-8.png"
    },
    {
      id: 9,
      text: "As a student, I love how Lrnflix adapts to my learning style. The AI tutor and personalized recommendations have made studying much more effective.",
      name: "Mariam Hassan",
      handle: "Business Student",
      avatar: "/assests/avatar-9.png"
    }
  ];

  const renderTestimonial = (testimonial: TestimonialData) => (
    <div key={testimonial.id} className="shadow-xl w-[310px] rounded-2xl p-8">
      <div className="font-medium pb-4 text-black">{testimonial.text}</div>
      <div className="flex items-center gap-3">
        <img src={testimonial.avatar} alt="Avatar" className="h-12 w-12" />
        <div>
          <div className="font-semibold text-black">{testimonial.name}</div>
          <div className="text-black">{testimonial.handle}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pt-20 bg-white">
      <div className="flex flex-col items-center px-28 pb-16">
        <div className="text-black border-2 w-fit p-0.5 px-3 text-sm rounded-xl font-semibold border-slate-300/80">
          Testimonials
        </div>
        <div className="text-4xl lg:text-5xl pt-6 font-bold tracking-tighter text-center bg-gradient-to-b from-black to-[#002499] text-transparent bg-clip-text">
          What our users say
        </div>
      </div>
      <div className="overflow-hidden [mask-image:linear-gradient(to_top,transparent,black,transparent)] h-[750px] mb-12 md:mb-28 lg:mb-36">
        <motion.div
          animate={{
            translateY: "-50%",
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
          }}
        >
          <div className="flex items-center justify-center overflow-x-hidden pb-4 gap-4">
            <div className="hidden md:block">
              {renderTestimonial(testimonials[0])}
              <div className="my-6">{renderTestimonial(testimonials[1])}</div>
              {renderTestimonial(testimonials[2])}
            </div>

            <div>
              {renderTestimonial(testimonials[3])}
              <div className="my-6">{renderTestimonial(testimonials[4])}</div>
              {renderTestimonial(testimonials[5])}
            </div>

            <div className="hidden md:block">
              {renderTestimonial(testimonials[6])}
              {renderTestimonial(testimonials[7])}
              {renderTestimonial(testimonials[8])}
            </div>
          </div>

          <div className="flex items-center justify-center overflow-x-hidden gap-4">
            <div className="hidden md:block">
              {renderTestimonial(testimonials[0])}
              <div className="my-6">{renderTestimonial(testimonials[1])}</div>
              {renderTestimonial(testimonials[2])}
            </div>

            <div>
              {renderTestimonial(testimonials[3])}
              <div className="my-6">{renderTestimonial(testimonials[4])}</div>
              {renderTestimonial(testimonials[5])}
            </div>

            <div className="hidden md:block">
              {renderTestimonial(testimonials[6])}
              {renderTestimonial(testimonials[7])}
              {renderTestimonial(testimonials[8])}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Pricing Component
const Pricing: React.FC = () => {
  return (
    <div className="mb-8 bg-white pt-4">
      <div className="flex flex-col items-center font-medium mt-16 mb-12 px-12 mx-auto max-w-[550px]">
        <div className="text-black border-2 w-fit p-0.5 px-3 text-sm rounded-xl border-slate-300/80">
         Affordable Learning
        </div>
        <div className="text-3xl md:text-4xl lg:text-5xl py-6 font-bold tracking-tighter text-center bg-gradient-to-b from-black to-[#002499] text-transparent bg-clip-text">
          Choose your learning plan
        </div>

        <div className="text-center text-lg mb-8 md:text-xl text-black">
          Start your AI-powered learning journey with our flexible pricing plans. 
          From free access to premium features, we have options for every learner and educator.
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center lg:items-end justify-center pb-20 gap-8">
        <div className="shadow-xl border-gray-100 border-2 rounded-2xl p-8">
          <div className="font-bold text-gray-500">Student</div>
          <div className="py-8">
            <span className="font-extrabold text-5xl text-black">$0</span>
            <span className="font-semibold text-gray-600">/month</span>
          </div>
          <button className="text-white mb-8 bg-black py-1.5 w-full rounded-lg cursor-pointer">
            Start learning free
          </button>
          <div className="flex flex-col gap-6">
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2 text-black" /> Access to free courses
            </div>
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2 text-black" /> Basic AI tutor access
            </div>
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2 text-black" /> Multiplayer quiz games
            </div>
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2" /> Community discussions
            </div>
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2 text-black" /> Basic support
            </div>
          </div>
        </div>

        <div className="shadow-2xl border-2 rounded-2xl p-8 bg-black text-white">
          <div className="flex justify-between items-center">
            <div className="font-bold text-gray-500">Premium</div>
            <div className="border-2 w-fit p-0.5 px-3 text-xs rounded-xl border-slate-300/20 bg-gradient-to-r from-pink-500  via-lime-600 to-sky-400 text-transparent bg-clip-text font-bold tracking-tighter">
              Most Popular
            </div>
          </div>
          <div className="py-8">
            <span className="font-extrabold text-5xl">$9</span>
            <span className="font-semibold text-gray-600">/month</span>
          </div>
          <button className="text-black font-medium mb-8 bg-white py-1.5 w-full rounded-lg cursor-pointer">
            Upgrade now
          </button>
          <div className="flex flex-col gap-6">
            <div>
              <IoMdCheckmark className="inline mr-2" /> Unlimited course access
            </div>
            <div>
              <IoMdCheckmark className="inline mr-2" /> Advanced AI tutor features
            </div>
            <div>
              <IoMdCheckmark className="inline mr-2" /> Priority quiz matchmaking
            </div>
            <div>
              <IoMdCheckmark className="inline mr-2" /> Advanced analytics
            </div>
            <div>
              <IoMdCheckmark className="inline mr-2" /> Priority support
            </div>
            <div>
              <IoMdCheckmark className="inline mr-2" /> Custom learning paths
            </div>
            <div>
              <IoMdCheckmark className="inline mr-2" /> Export certificates
            </div>
          </div>
        </div>
        <div className="shadow-xl border-gray-100 border-2 rounded-2xl p-8">
          <div className="font-bold text-gray-500">Institution</div>
          <div className="py-8">
            <span className="font-extrabold text-5xl text-black">$29</span>
            <span className="font-semibold text-gray-600">/month</span>
          </div>
          <button className="text-white mb-8 bg-black py-1.5 w-full rounded-lg cursor-pointer">
            Contact sales
          </button>
          <div className="flex flex-col gap-6">
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2 text-black" /> Unlimited students
            </div>
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2 text-black" /> Advanced course management
            </div>
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2 text-black" /> AI-powered insights
            </div>
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2" /> Custom branding
            </div>
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2 text-black" /> Dedicated support
            </div>
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2 text-black" /> Advanced security
            </div>
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2" />
              API access
            </div>
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2 text-black" />
              White-label solution
            </div>
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2 text-black" />
              Training & onboarding
            </div>
            <div className='text-black'>
              <IoMdCheckmark className="inline mr-2 text-black" />
              Custom integrations
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// CTA Component
const CTA: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const userRole = user?.role || 'student';

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Enhanced parallax effects for CTA section
  // Star: Dramatic fall and rise effect
  const starTranslateY = useTransform(
    scrollYProgress, 
    [0, 0.3, 0.7, 1], 
    [0, 250, -180, 120]
  );
  
  // Helix: Opposite movement pattern
  const helixTranslateY = useTransform(
    scrollYProgress, 
    [0, 0.3, 0.7, 1], 
    [0, -200, 250, -150]
  );

  // Add rotation effects
  const starRotate = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0, 45, -30]
  );

  const helixRotate = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0, -60, 40]
  );

  // Add scale effects for depth
  const starScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1, 1.2, 0.8]
  );

  const helixScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1, 0.75, 1.15]
  );

  // Function to get CTA buttons based on authentication and role
  const getCTAButtons = () => {
    if (!isAuthenticated) {
      return (
        <>
          <Button 
            className="text-white bg-black py-2 px-4 rounded-sm cursor-pointer"
            onClick={() => navigate('/auth/signup')}
          >
            Start Learning Free
          </Button>
          <div 
            className="font-semibold cursor-pointer hover:underline text-black"
            onClick={() => navigate('/auth/signup')}
          >
            Explore Features
            <FaArrowRight className="h-3 w-3 inline ml-2" />
          </div>
        </>
      );
    }

    if (userRole === 'student') {
      return (
        <>
          <Button 
            className="text-white bg-black py-2 px-4 rounded-sm cursor-pointer"
            onClick={() => navigate('/student/dashboard')}
          >
            Continue Learning
          </Button>
          <div 
            className="font-semibold cursor-pointer hover:underline text-black"
            onClick={() => navigate('/student/courses')}
          >
            Browse Courses
            <FaArrowRight className="h-3 w-3 inline ml-2" />
          </div>
        </>
      );
    }

    if (userRole === 'teacher') {
      return (
        <>
          <Button 
            className="text-white bg-black py-2 px-4 rounded-sm cursor-pointer"
            onClick={() => navigate('/teacher/dashboard')}
          >
            Manage Courses
          </Button>
          <div 
            className="font-semibold cursor-pointer hover:underline text-black"
            onClick={() => navigate('/teacher/courses')}
          >
            Create Course
            <FaArrowRight className="h-3 w-3 inline ml-2" />
          </div>
        </>
      );
    }

    // Fallback for other roles
    return (
      <>
        <Button 
          className="text-white bg-black py-2 px-4 rounded-sm cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </Button>
        <div 
          className="font-semibold cursor-pointer hover:underline text-black"
          onClick={() => navigate('/courses')}
        >
          Explore Platform
          <FaArrowRight className="h-3 w-3 inline ml-2" />
        </div>
      </>
    );
  };

  return (
    <div
      ref={sectionRef}
      className="flex flex-col items-center pt-28 pb-24 px-14 bg-gradient-to-t from-[#afbbe4] to-white overflow-x-clip relative"
    >
      <div className="max-w-[570px] flex flex-col items-center relative">
        <motion.img
          src="/assests/emojistar 1.png"
          alt="Star"
          className="absolute -left-[345px] -top-28 pr-6 hidden md:block z-10"
          style={{
            translateY: starTranslateY,
            rotate: starRotate,
            scale: starScale,
          }}
          transition={{
            type: "spring",
            stiffness: 110,
            damping: 18,
          }}
        />
        <motion.img
          src="/assests/helix2 1.png"
          alt="Helix"
          className="absolute -right-80 -top-6 hidden md:block z-10"
          style={{
            translateY: helixTranslateY,
            rotate: helixRotate,
            scale: helixScale,
          }}
          transition={{
            type: "spring",
            stiffness: 110,
            damping: 18,
          }}
        />
        <div className="text-4xl md:text-5xl lg:text-6xl py-6 font-bold tracking-tighter text-center bg-gradient-to-b from-black to-[#002499] text-transparent bg-clip-text relative z-20">
          Start your AI learning journey today
        </div>

        <div className="text-center text-lg mb-8 md:text-xl text-black relative z-20">
          Join thousands of students and educators already using Egypt's first AI-powered, 
          gamified learning platform. Experience the future of education.
        </div>

        <div className="flex items-center gap-4 mt-4 text-lg relative z-20">
          {getCTAButtons()}
        </div>
      </div>
    </div>
  );
};

// TopCourses Component
const TopCourses: React.FC = () => {
  const { data: courses, isLoading, isError } = useQuery<CourseData[]>({
    queryKey: ['topCourses'],
    queryFn: getTopCourses,
    initialData: [],
  });
  const navigate = useNavigate();
  const coursesRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: coursesRef,
    offset: ["start start", "end end"],
  });

  // Horizontal scroll effect - courses move left as user scrolls down (faster movement)
  const translateX = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const translateXRight = useTransform(scrollYProgress, [0, 1], [0, 300]);

  if (isLoading) {
    return (
      <div className="pt-20 bg-white">
        <div className="flex flex-col items-center font-medium px-8 mx-auto md:w-[550px] lg:w-[630px]">
          <div className="text-black border-2 w-fit p-0.5 px-3 text-sm rounded-xl border-slate-300/80">
            Top Courses
          </div>
          <div className="text-3xl md:text-4xl lg:text-5xl py-6 font-bold tracking-tighter text-center bg-gradient-to-b from-black to-[#002499] text-transparent bg-clip-text">
            Discover Our Most Popular Courses
          </div>
          <div className="text-center text-lg mb-8 md:text-xl text-black">
            Loading amazing courses...
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pt-20 bg-white">
        <div className="flex flex-col items-center font-medium px-8 mx-auto md:w-[550px] lg:w-[630px]">
          <div className="text-black border-2 w-fit p-0.5 px-3 text-sm rounded-xl border-slate-300/80">
            Top Courses
          </div>
          <div className="text-3xl md:text-4xl lg:text-5xl py-6 font-bold tracking-tighter text-center bg-gradient-to-b from-black to-[#002499] text-transparent bg-clip-text">
            Discover Our Most Popular Courses
          </div>
          <div className="text-center text-lg mb-8 md:text-xl text-red-600">
            Error loading courses. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={coursesRef} className="pt-20 bg-white relative overflow-hidden">
      {/* Premium Background Patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Geometric Pattern Grid */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(90deg, #002499 1px, transparent 1px),
              linear-gradient(180deg, #002499 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Floating Geometric Shapes */}
        <div className="absolute top-32 left-20 w-24 h-24 border border-blue-200/20 rotate-45 opacity-30"></div>
        <div className="absolute top-48 right-32 w-16 h-16 bg-blue-100/20 rounded-full opacity-40"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 border-2 border-indigo-200/15 rotate-12 opacity-25"></div>
        <div className="absolute bottom-48 right-1/4 w-28 h-28 bg-purple-100/15 transform rotate-45 opacity-30"></div>
        
        {/* Large Pattern Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-100/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-50/8 rounded-full blur-3xl"></div>
        
        {/* Animated Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl"
          animate={{
            y: [-10, 10, -10],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-200/15 rounded-full blur-2xl"
          animate={{
            y: [10, -10, 10],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="flex flex-col items-center font-medium px-8 mx-auto md:w-[550px] lg:w-[630px] relative z-10">
        <div className="text-black border-2 w-fit p-0.5 px-3 text-sm rounded-xl border-slate-300/80">
          Top Courses
        </div>
        <div className="text-3xl md:text-4xl lg:text-5xl py-6 font-bold tracking-tighter text-center bg-gradient-to-b from-black to-[#002499] text-transparent bg-clip-text">
          Discover Our Most Popular Courses
        </div>
        <div className="text-center text-lg mb-8 md:text-xl text-black">
          Join thousands of learners who have already transformed their skills with our most popular courses
        </div>
      </div>

      {/* Horizontal Carousel Container */}
      <div className="relative pb-20">
        {/* Left fade gradient */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        
        {/* Right fade gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Carousel */}
        <motion.div
          className="flex gap-8 px-28"
          style={{ translateX }}
        >
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              onClick={() => navigate(`/courses/${course.id}`)}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative bg-white shadow-3xl border-2 border-gray-300 overflow-hidden min-w-[420px] max-w-[420px] cursor-pointer"
            >
              {/* Premium Thumbnail Section */}
              <div className="relative h-72 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                {course.cover_image_url ? (
                  <img
                    src={course.cover_image_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <FaPlay className="text-5xl text-gray-400" />
                  </div>
                )}
                
                {/* Premium overlay with sophisticated gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent" />
                
                {/* Premium badge with enhanced styling */}
                <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md text-gray-900 px-5 py-3 text-sm font-bold shadow-xl border border-gray-300">
                  {course.price === 0 ? 'Free' : `$${course.price}`}
                </div>
              </div>

              {/* Hierarchical Content Section */}
              <div className="p-10 bg-white">
                {/* Course Title - Primary Hierarchy */}
                <h3 className="text-3xl font-bold text-gray-900 mb-6 line-clamp-2 leading-tight tracking-tight">
                  {course.title}
                </h3>

                {/* Instructor Name - Secondary Hierarchy */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white text-base font-bold shadow-xl">
                    {course.profiles?.full_name?.[0] || 'I'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                      Instructor
                    </span>
                    <span className="text-xl font-bold text-gray-800">
                      {course.profiles?.full_name || 'Course Instructor'}
                    </span>
                  </div>
                </div>



              </div>

            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* View All Courses CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.4 }}
        className="flex justify-center pb-16 relative z-10"
      >
        <Button 
          className="text-white bg-black py-2 px-4 rounded-sm cursor-pointer"
          onClick={() => navigate('/courses')}
        >
          View All Courses
        </Button>

      </motion.div>
    </div>
  );
};

// Top Instructors Component
const TopInstructors: React.FC = () => {
  const navigate = useNavigate();
  const instructorsRef = useRef<HTMLDivElement>(null);
  const { data: instructors, isLoading, isError } = useQuery({
    queryKey: ['featuredInstructors'],
    queryFn: getFeaturedInstructors,
  });

  // Horizontal scroll effect - instructors move right as user scrolls down (same speed as courses, opposite direction)
  const { scrollYProgress } = useScroll({
    target: instructorsRef,
    offset: ["start start", "end end"]
  });
  
  const translateX = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const translateXRight = useTransform(scrollYProgress, [0, 1], [0, -100]);

  if (isLoading) {
    return (
      <div className="pt-20 bg-white">
        <div className="flex flex-col items-center font-medium px-8 mx-auto md:w-[550px] lg:w-[630px]">
          <div className="text-black border-2 w-fit p-0.5 px-3 text-sm rounded-xl border-slate-300/80">
            Top Instructors
          </div>
          <div className="text-3xl md:text-4xl lg:text-5xl py-6 font-bold tracking-tighter text-center bg-gradient-to-b from-black to-[#002499] text-transparent bg-clip-text">
            Learn from Expert Instructors
          </div>
          <div className="text-center text-lg mb-8 md:text-xl text-black">
            Loading amazing instructors...
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pt-20 bg-white">
        <div className="flex flex-col items-center font-medium px-8 mx-auto md:w-[550px] lg:w-[630px]">
          <div className="text-black border-2 w-fit p-0.5 px-3 text-sm rounded-xl border-slate-300/80">
            Top Instructors
          </div>
          <div className="text-3xl md:text-4xl lg:text-5xl py-6 font-bold tracking-tighter text-center bg-gradient-to-b from-black to-[#002499] text-transparent bg-clip-text">
            Learn from Expert Instructors
          </div>
          <div className="text-center text-lg mb-8 md:text-xl text-red-600">
            Error loading instructors. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={instructorsRef} className="pt-20 bg-white relative overflow-hidden">
      {/* Premium Background Patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Geometric Pattern Grid */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(90deg, #002499 1px, transparent 1px),
              linear-gradient(180deg, #002499 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Floating Geometric Shapes */}
        <div className="absolute top-32 left-20 w-24 h-24 border border-blue-200/20 rotate-45 opacity-30"></div>
        <div className="absolute top-48 right-32 w-16 h-16 bg-blue-100/20 rounded-full opacity-40"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 border-2 border-indigo-200/15 rotate-12 opacity-25"></div>
        <div className="absolute bottom-48 right-1/4 w-28 h-28 bg-purple-100/15 transform rotate-45 opacity-30"></div>
        
        {/* Large Pattern Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-100/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-50/8 rounded-full blur-3xl"></div>
        
        {/* Animated Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl"
          animate={{
            y: [-10, 10, -10],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-200/15 rounded-full blur-2xl"
          animate={{
            y: [10, -10, 10],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="flex flex-col items-center font-medium px-8 mx-auto md:w-[550px] lg:w-[630px] relative z-10">
        <div className="text-black border-2 w-fit p-0.5 px-3 text-sm rounded-xl border-slate-300/80">
          Top Instructors
        </div>
        <div className="text-3xl md:text-4xl lg:text-5xl py-6 font-bold tracking-tighter text-center bg-gradient-to-b from-black to-[#002499] text-transparent bg-clip-text">
          Learn from Expert Instructors
        </div>
        <div className="text-center text-lg mb-8 md:text-xl text-black">
          Discover world-class instructors who are passionate about sharing their knowledge and expertise
        </div>
      </div>

      {/* Horizontal Carousel Container */}
      <div className="relative pb-20">
        {/* Left fade gradient */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        
        {/* Right fade gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Carousel */}
        <motion.div
          className="flex gap-8 px-28"
          style={{ translateX }}
        >
          {instructors?.map((instructor, index) => (
            <motion.div
              key={instructor.user_id}
              onClick={() => navigate(`/teachers/${instructor.slug}`)}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative bg-white shadow-3xl border-2 border-gray-300 overflow-hidden min-w-[420px] max-w-[420px] cursor-pointer"
            >
              {/* Premium Thumbnail Section */}
              <div className="relative h-72 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                {instructor.profile_image_url ? (
                  <img
                    src={instructor.profile_image_url}
                    alt={instructor.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                      {instructor.display_name?.[0] || 'I'}
                    </div>
                  </div>
                )}
                
                {/* Premium overlay with sophisticated gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent" />
                
                {/* Premium badge with enhanced styling */}
                <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md text-gray-900 px-5 py-3 text-sm font-bold shadow-xl border border-gray-300">
                  Expert
                </div>
              </div>

              {/* Hierarchical Content Section */}
              <div className="p-10 bg-white">
                {/* Instructor Name - Primary Hierarchy */}
                <h3 className="text-3xl font-bold text-gray-900 mb-6 line-clamp-2 leading-tight tracking-tight">
                  {instructor.display_name}
                </h3>

                {/* Specialization - Secondary Hierarchy */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white text-base font-bold shadow-xl">
                    <FaUsers className="text-xl" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                      Specialization
                    </span>
                    <span className="text-xl font-bold text-gray-800">
                      {instructor.specialization || 'General Education'}
                    </span>
                  </div>
                </div>

                {/* Bio - Tertiary Hierarchy */}
                {instructor.bio && (
                  <div className="mb-8">
                    <p className="text-gray-600 text-lg leading-relaxed line-clamp-3">
                      {instructor.bio}
                    </p>
                  </div>
                )}

                {/* Social Links - Quaternary Hierarchy */}
                {instructor.social_links && Object.keys(instructor.social_links).length > 0 && (
                  <div className="flex gap-3">
                    {Object.entries(instructor.social_links).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        {platform === 'linkedin' && <FaLinkedin className="text-lg" />}
                        {platform === 'twitter' && <FaTwitter className="text-lg" />}
                        {platform === 'youtube' && <FaYoutube className="text-lg" />}
                        {platform === 'instagram' && <AiFillInstagram className="text-lg" />}
                        {platform === 'website' && <MdOutlineArrowOutward className="text-lg" />}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* View All Instructors CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.4 }}
        className="flex justify-center pb-16 relative z-10"
      >
        <Button 
          className="text-white bg-black py-2 px-4 rounded-sm cursor-pointer"
          onClick={() => navigate('/teachers')}
        >
          View All Instructors
        </Button>
      </motion.div>
    </div>
  );
};

// Footer Component
const Footer: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row bg-black text-white p-16 gap-8 justify-between md:px-20 xl:px-44">
      <div className="flex flex-col gap-8 text-gray-300/85 max-w-[300px]">
        <div className="flex items-center space-x-3">
          <img src="/assests/logo.png" alt="Logo" className="cursor-pointer h-12 w-12" />
          <span className="text-white font-semibold text-2xl">{PLATFORM_NAME}</span>
        </div>
        <div>
          Egypt's first AI-powered learning platform developed by{" "}
          <div className="font-semibold text-white hover:underline text-lg">
            <a href="https://mina-emad.com">
              Mena Emad <MdOutlineArrowOutward className="inline" />
            </a>
          </div>
        </div>
        <div className="flex gap-4 text-2xl cursor-pointer">
          <FaTwitter className="hover:scale-125" />
          <AiFillInstagram className="hover:scale-125" />
          <FaPinterest className="hover:scale-125" />
          <FaLinkedin className="hover:scale-125" />
          <FaTiktok className="hover:scale-125" />
          <FaYoutube className="hover:scale-125" />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="font-bold text-lg">Platform</div>
        <div className="cursor-pointer text-gray-300/85">AI Tutor</div>
        <div className="cursor-pointer text-gray-300/85">Gamified Learning</div>
        <div className="cursor-pointer text-gray-300/85">Course Management</div>
        <div className="cursor-pointer text-gray-300/85">Analytics</div>
        <div className="cursor-pointer text-gray-300/85">Pricing</div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="font-bold text-lg">Company</div>
        <div className="cursor-pointer text-gray-300/85">About</div>
        <div className="cursor-pointer text-gray-300/85">Blog</div>
        <div className="cursor-pointer text-gray-300/85">Careers</div>
        <div className="cursor-pointer text-gray-300/85">Mission</div>
        <div className="cursor-pointer text-gray-300/85">Press</div>
        <div className="cursor-pointer text-gray-300/85">Contact</div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="font-bold text-lg">Resources</div>
        <div className="cursor-pointer text-gray-300/85">Help Center</div>
        <div className="cursor-pointer text-gray-300/85">Community</div>
        <div className="cursor-pointer text-gray-300/85">Tutorials</div>
        <div className="cursor-pointer text-gray-300/85">API Docs</div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="font-bold text-lg">Legal</div>
        <div className="cursor-pointer text-gray-300/85">Privacy </div>
        <div className="cursor-pointer text-gray-300/85">Terms</div>
        <div className="cursor-pointer text-gray-300/85">Security</div>
      </div>
    </div>
  );
};

// Main Landing Page Component
const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white gap-0">
      <TopLine />
      <Header />
      <Hero />
      <BrandSlide />

      <ProductShowcase />

      <TopCourses />
      <TopInstructors />
      <ProductCard />
      {/* <IphoneShowcaseSection leftTextTop="Transform" leftTextBottom="Education." /> */}
      <Testimonials />

      {/* <Pricing /> */}
      <CTA />
      <Footer />
    </div>
  );
};

export default LandingPage;
