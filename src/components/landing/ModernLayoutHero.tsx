import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Home, Grid3X3, FileText, Users, Bell, Play, Instagram, Linkedin, Youtube, ArrowRight, Book, HelpCircle, LogIn, UserPlus, Video, LogOut, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
// Import new reusable components
import FeaturesDropdown from '@/components/landing/ModernLayoutHero/FeaturesDropdown';
import HeroImageSection from '@/components/landing/ModernLayoutHero/HeroImageSection';
import StatsOverlay from '@/components/landing/ModernLayoutHero/StatsOverlay';
import FloatingExpertCard from '@/components/landing/ModernLayoutHero/FloatingExpertCard';
import InfoBox from '@/components/landing/ModernLayoutHero/InfoBox';
import HeroBottomSection from '@/components/landing/ModernLayoutHero/HeroBottomSection';
import SocialIcons from '@/components/landing/ModernLayoutHero/SocialIcons';
import TeamAvatars from '@/components/landing/ModernLayoutHero/TeamAvatars';
import RightPanelNavigation from '@/components/landing/ModernLayoutHero/RightPanelNavigation';
import RightPanelCards from '@/components/landing/ModernLayoutHero/RightPanelCards';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import WalletCard from '@/components/student/WalletCardDesign';
import { PLATFORM_NAME } from '@/data/constants';

const HERO_ANIMATION_DELAY = 1.2; // seconds, matches hero image animation
const NAVBAR_EXTRA_DELAY = 0.5;

// Animation variants
const heroTextVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 80, damping: 12, delay: HERO_ANIMATION_DELAY + 0.2 } },
};
const statsVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 80, damping: 14, delay: HERO_ANIMATION_DELAY + 0.5 + custom * 0.15 },
  }),
};
const floatingCardVariants: Variants = {
  hidden: { opacity: 0, x: 60, scale: 0.95 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 90, damping: 10, delay: HERO_ANIMATION_DELAY + 0.8 } },
};
const infoBoxVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 70, damping: 14, delay: HERO_ANIMATION_DELAY + 1 } },
};
const ctaVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 120, damping: 10, delay: HERO_ANIMATION_DELAY + 1.2 } },
};
const socialVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 100, damping: 12, delay: HERO_ANIMATION_DELAY + 1.3 + custom * 0.1 },
  }),
};
const avatarsVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, x: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    scale: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 12, delay: HERO_ANIMATION_DELAY + 1.5 + custom * 0.08 },
  }),
};
const rightCardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 80, damping: 14, delay: HERO_ANIMATION_DELAY + 1.1 + custom * 0.18 },
  }),
};

const navBarVariants = {
  hidden: { opacity: 0, scale: 0.7, x: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 80,
      damping: 16,
      delay: HERO_ANIMATION_DELAY + NAVBAR_EXTRA_DELAY, // extra delay for nav
      when: 'beforeChildren',
      staggerChildren: 0.08,
    },
  },
};
const navIconVariants = {
  hidden: (i: number) => ({
    opacity: 0,
    x: 0,
    scale: 0.7,
  }),
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 14,
      delay: HERO_ANIMATION_DELAY + NAVBAR_EXTRA_DELAY + 0.08 * i,
    },
  }),
};

const featuresDropdownVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 120,
      damping: 14,
      delay: HERO_ANIMATION_DELAY + 0.1,
    },
  },
};

const ModernLayoutHero: React.FC = () => {
  const navigate = useNavigate();
  // Get user and authentication state from Redux
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const userRole = user?.role;

  // Social icons data
  const socialIcons = [
    { href: 'https://instagram.com', icon: <Instagram className="w-5 h-5 text-primary-foreground" /> },
    { href: 'https://linkedin.com', icon: <Linkedin className="w-5 h-5 text-primary-foreground" /> },
    { href: 'https://youtube.com', icon: <Youtube className="w-5 h-5 text-primary-foreground" /> },
  ];
  // Team avatars data
  const teamAvatars = [
    `url('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80')`,
    `url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80')`,
    `url('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80')`,
  ];
  // Stats data
  const stats = [
    { stat: '2K+', label: 'Active Learners' },
    { stat: '200+', label: 'Courses Delivered' },
  ];

  // Right panel nav items based on authentication and userRole
  let rightNav = [
    { to: '/', icon: <Home className="w-5 h-5 text-primary-foreground" />, className: 'w-16 h-16 bg-primary rounded-full flex items-center justify-center hover:bg-primary/80 cursor-pointer' },
  ];
  if (!isAuthenticated) {
    rightNav = rightNav.concat([
      { to: '/auth/login', icon: <LogIn className="w-5 h-5 text-muted-foreground" />, className: 'w-16 h-16 hover:bg-muted rounded-full flex items-center justify-center cursor-pointer' },
      { to: '/auth/signup', icon: <UserPlus className="w-5 h-5 text-muted-foreground" />, className: 'w-16 h-16 hover:bg-muted rounded-full flex items-center justify-center cursor-pointer' },
    ]);
  } else if (userRole === 'student') {
    rightNav = rightNav.concat([
      { to: '/student/dashboard', icon: <LayoutDashboard className="w-5 h-5 text-muted-foreground" />, className: 'w-16 h-16 hover:bg-muted rounded-full flex items-center justify-center cursor-pointer' },
      { to: '/courses', icon: <Video className="w-5 h-5 text-muted-foreground" />, className: 'w-16 h-16 hover:bg-muted rounded-full flex items-center justify-center cursor-pointer' },
      { to: '/chapters', icon: <FileText className="w-5 h-5 text-muted-foreground" />, className: 'w-16 h-16 hover:bg-muted rounded-full flex items-center justify-center cursor-pointer' },
      { to: '/questions', icon: <HelpCircle className="w-5 h-5 text-muted-foreground" />, className: 'w-16 h-16 hover:bg-muted rounded-full flex items-center justify-center cursor-pointer' },
    ]);
  } else if (userRole === 'teacher') {
    rightNav = rightNav.concat([
      { to: '/teacher/dashboard', icon: <Book className="w-5 h-5 text-muted-foreground" />, className: 'w-16 h-16 hover:bg-muted rounded-full flex items-center justify-center cursor-pointer' },
      { to: '/teacher/courses', icon: <FileText className="w-5 h-5 text-muted-foreground" />, className: 'w-16 h-16 hover:bg-muted rounded-full flex items-center justify-center cursor-pointer' },
      { to: '/teacher/groups', icon: <Users className="w-5 h-5 text-muted-foreground" />, className: 'w-16 h-16 hover:bg-muted rounded-full flex items-center justify-center cursor-pointer' },
      { to: '/questions', icon: <HelpCircle className="w-5 h-5 text-muted-foreground" />, className: 'w-16 h-16 hover:bg-muted rounded-full flex items-center justify-center cursor-pointer' },
    ]);
  }

  // Right panel cards
  const rightCards = [
    // Green Glass Box
    <div key="green" className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-8 backdrop-blur-sm">
      <h3 className="text-2xl font-bold text-white mb-4">
        Transforming Online Learning
      </h3>
      <p className="text-white/80 text-sm mb-6 leading-relaxed">
        Interactive courses, real-time feedback, and a vibrant community. {PLATFORM_NAME} LMS brings together students and educators for a seamless digital learning experience.
      </p>
      <Button
        variant="outline"
        className="rounded-full border border-white text-white hover:bg-white/20 hover:text-white transition-colors px-6 bg-transparent"
      >
        Learn More
      </Button>,
    </div>,
    // Video Preview Card
    <div key="video" className="relative rounded-3xl overflow-hidden shadow-lg">
      <div
        className="h-48 bg-cover bg-center relative"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-card/90 dark:bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
            <Play className="w-8 h-8 text-foreground ml-1" />
          </div>
        </div>
      </div>
    </div>,
    // Dark Bottom Card
    <div key="dark" className="bg-gradient-to-br from-muted to-muted-foreground/80 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 text-foreground dark:text-white">
      <h3 className="text-xl font-bold mb-4">
        Your Pathway to Success
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed dark:text-gray-300">
        Our platform adapts to your learning style, offering personalized recommendations and progress tracking to help you achieve your goals.
      </p>
    </div>,
  ];

  // Build navLinksText for dropdown (same as rightNav, but with text labels)
  let navLinksText = [
    { to: '/', label: 'Home' },
  ];
  if (!isAuthenticated) {
    navLinksText = navLinksText.concat([
      { to: '/auth/login', label: 'Sign In' },
      { to: '/auth/signup', label: 'Sign Up' },
    ]);
  } else if (userRole === 'student') {
    navLinksText = navLinksText.concat([
      { to: '/courses', label: 'Courses' },
      { to: '/chapters', label: 'Chapters' },
      { to: '/student/groups', label: 'Groups' },
      { to: '/questions', label: 'Questions' },
    ]);
  } else if (userRole === 'teacher') {
    navLinksText = navLinksText.concat([
      { to: '/teacher/dashboard', label: 'Dashboard' },
      { to: '/teacher/courses', label: 'Courses' },
      { to: '/teacher/groups', label: 'Groups' },
      { to: '/questions', label: 'Questions' },
    ]);
  }

  return (
    <section className="relative h-screen max-h-screen bg-background dark:bg-background overflow-hidden">
      <div className="flex h-full">
        {/* Left Panel */}
        <div className="relative w-[73%] flex flex-col">
          {/* Products Button - Top Left */}
          <div className="absolute top-8 left-8 z-20">
            <motion.div
              variants={featuresDropdownVariants}
              initial="hidden"
              animate="visible"
            >
              <FeaturesDropdown links={navLinksText} />
            </motion.div>
          </div>
          {/* Hero Image with overlays */}
          <HeroImageSection>
            <motion.div
              className="absolute inset-0 flex items-center justify-start pl-16"
              variants={heroTextVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="text-white z-10">
                <h1 className="text-6xl font-bold leading-tight mb-4">
                  {PLATFORM_NAME} LMS<br />
                  Empowering Modern<br />
                  Education
                </h1>
              </div>
            </motion.div>
            <StatsOverlay stats={stats} variants={statsVariants} />
          </HeroImageSection>
          <FloatingExpertCard variants={floatingCardVariants} />
          <InfoBox variants={infoBoxVariants}>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {PLATFORM_NAME} is a next-generation Learning Management System designed to make education accessible, engaging, and effective. Track your progress, join live classes, collaborate with peers, and unlock your full potential with our intuitive platform.
            </p>
          </InfoBox>
          <HeroBottomSection
            cta={
              <motion.div variants={ctaVariants} initial="hidden" animate="visible">
                <Button
                  className="px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-full text-lg font-semibold hover:from-primary/90 hover:to-primary/90 shadow-lg"
                  onClick={() => navigate('/courses')}
                >
                  Explore Courses
                </Button>
              </motion.div>
            }
            socialIcons={<SocialIcons icons={socialIcons} variants={socialVariants} />}
            avatars={
              <div className="flex items-center gap-3 ml-8">
                <TeamAvatars avatars={teamAvatars} variants={avatarsVariants} />
                <motion.div variants={ctaVariants} initial="hidden" animate="visible">
                  <Button
                    variant="outline"
                    className="ml-3 rounded-full border border-primary text-primary hover:bg-primary/10 hover:text-primary transition-colors dark:border-white dark:text-white dark:hover:bg-white/20 dark:hover:text-white"
                    onClick={() => navigate('/teachers')}
                  >
                    Meet Our Educators
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              </div>
            }
          />
        </div>
        {/* Right Panel */}
        <div className="w-[27%] bg-background dark:bg-background relative flex flex-col">
          <div className="absolute top-4 right-8 z-20">
            <motion.div
              className="flex items-center gap-8 xl:gap-16 xxl:gap-24 bg-card/90 dark:bg-card/80 backdrop-blur-sm rounded-full p-2 shadow-lg"
              variants={navBarVariants}
              initial="hidden"
              animate="visible"
            >
              {rightNav.map((item, i) => (
                <Link key={i} to={item.to}>
                  <motion.div
                    className={item.className}
                    custom={i}
                    variants={navIconVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {item.icon}
                  </motion.div>
                </Link>
              ))}
              {isAuthenticated && (
                <motion.div
                  custom={rightNav.length}
                  variants={navIconVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-16 h-16 hover:bg-muted rounded-full flex items-center justify-center cursor-pointer focus:outline-none z-30">
                        <Avatar className="h-10 w-10">
                          {user?.avatar_url ? (
                            <AvatarImage src={user.avatar_url} alt={user?.full_name || user?.email || 'User'} />
                          ) : (
                            <AvatarFallback className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-lg uppercase focus:ring-2 focus:ring-primary/40">
                              {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-4 mt-5">
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
                          { userRole === 'student' && <div className="mt-2"><WalletCard wallet={user?.wallet} /></div> }
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <button
                          className="w-full flex items-center gap-2 justify-start px-2 py-1.5 rounded hover:bg-accent transition text-sm"
                          onClick={() => navigate(`${userRole === 'student' ? '/student' : '/teacher'}/courses`)}
                        >
                          <Users className="h-4 w-4" />
                          My Courses
                        </button>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <button
                          className="w-full flex items-center gap-2 justify-start px-2 py-1.5 rounded hover:bg-accent transition text-sm"
                          onClick={() => navigate(`${userRole === 'student' ? '/student' : '/teacher'}/notifications`)}
                        >
                          <Bell className="h-4 w-4" />
                          My Notifications
                        </button>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <button
                          onClick={() => { supabase.auth.signOut(); navigate('/'); }}
                          className="w-full mt-2 flex items-center gap-2 text-destructive font-semibold py-2 px-2 rounded hover:bg-destructive/10 transition"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              )}
            </motion.div>
          </div>
          <RightPanelCards cards={rightCards} variants={rightCardVariants} />
        </div>
      </div>
    </section>
  );
};

export default ModernLayoutHero;