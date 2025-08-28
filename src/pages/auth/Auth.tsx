import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Apple, Play, X } from 'lucide-react';
import AuthForm from './AuthForm';
import AuthModal from '@/components/ui/AuthModal';
import { useRandomBackground } from "../../hooks/useRandomBackground";
import { PremiumCourseCard } from '@/components/courses/PremiumCourseCard';
import { PLATFORM_NAME } from '@/data/constants';
import { SEOHead } from '@/components/seo';
import { useTranslation } from 'react-i18next';
import PoliciesModal from '@/components/landing/PoliciesModal';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';

// Fallback dummy data when no real courses are available
const fallbackCards = [
  {
    title: 'Intro to Biology',
    author: 'Dr. Jane Smith',
    desc: 'Explore the basics of biology, from cells to ecosystems.',
    category: 'Science',
    thumbnail: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
    tags: ['Free', 'Popular'],
  },
  {
    title: 'Quiz: React Basics',
    author: 'Alex Hammond',
    desc: 'Test your knowledge of React fundamentals.',
    category: 'Web Dev',
    thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80',
    tags: ['New'],
  },
  {
    title: 'Modern Algebra',
    author: 'Prof. Alan Turing',
    desc: 'Dive into algebraic structures and problem solving.',
    category: 'Mathematics',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    tags: ['Free'],
  },
  {
    title: 'Quiz: Python Loops',
    author: 'Sara Lee',
    desc: 'Challenge yourself with Python loop questions.',
    category: 'Programming',
    thumbnail: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    tags: ['Popular'],
  },
  {
    title: 'History 101',
    author: 'Dr. Emily Carter',
    desc: 'A journey through world history and civilizations.',
    category: 'History',
    thumbnail: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    tags: ['New'],
  },
  {
    title: 'Quiz: CSS Flexbox',
    author: 'Chris Coyier',
    desc: 'How well do you know Flexbox? Take the quiz!',
    category: 'Web Dev',
    thumbnail: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    tags: ['Free'],
  },
];

// Interface for real course data
interface RealCourse {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  cover_image_url: string | null;
  price: number;
  enrollment_code: string | null;
  created_at: string;
  instructor_id: string;
  profiles?: {
    full_name: string;
  };
}

// Interface for processed course data
interface ProcessedCourse {
  title: string;
  author: string;
  desc: string;
  category: string;
  thumbnail: string;
  tags: string[];
}

function useVerticalCarousel(cards: ProcessedCourse[], direction = 'down', speed = 1) {
  const [offset, setOffset] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => {
        const max = cards.length * 260; // card height + gap
        let next = prev + (direction === 'down' ? speed : -speed);
        if (next > max) next = 0;
        if (next < 0) next = max;
        return next;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [cards.length, direction, speed]);
  return [offset, ref];
}

const Auth: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [activeTab, setActiveTab] = useState('terms');
  const [courses, setCourses] = useState<ProcessedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const bgClass = useRandomBackground();
  const { t } = useTranslation('other');
  const { teacher } = useTenant();

  // Fetch courses based on tenant status
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      let coursesQuery = supabase
        .from('courses')
        .select(`
          *,
          profiles!courses_instructor_id_fkey(full_name)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(12); // Limit to 12 courses for performance

      // If there's a tenant, fetch only their courses
      if (teacher?.user_id) {
        coursesQuery = coursesQuery.eq('instructor_id', teacher.user_id);
      }

      const { data: coursesData, error: coursesError } = await coursesQuery;

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        // Fallback to dummy data on error
        setCourses(fallbackCards);
        return;
      }

      if (coursesData && coursesData.length > 0) {
        // Process real course data to match the expected format
        const processedCourses: ProcessedCourse[] = coursesData.map((course: RealCourse) => ({
          title: course.title,
          author: course.profiles?.full_name || 'Course Instructor',
          desc: course.description || 'No description available',
          category: course.category || 'General',
          thumbnail: course.cover_image_url || 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
          tags: [course.price === 0 ? 'Free' : 'Premium', 'Active'],
        }));
        
        // Only use fallback data if there are NO courses at all
        setCourses(processedCourses);
      } else {
        // No courses found, use fallback data
        setCourses(fallbackCards);
      }
    } catch (error) {
      console.error('Error in fetchCourses:', error);
      // Fallback to dummy data on error
      setCourses(fallbackCards);
    } finally {
      setLoading(false);
    }
  }, [teacher?.user_id]);

  // Fetch courses on component mount and when tenant changes
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    if (location.pathname.endsWith('/login')) setMode('login');
    else if (location.pathname.endsWith('/signup')) setMode('signup');
  }, [location.pathname]);

  const handleLegalLink = (tab: string) => {
    setActiveTab(tab);
    setShowLegalModal(true);
  };

  // Split cards for two carousels, ensuring both have courses
  const leftCards = courses.filter((_, i) => i % 2 === 0);
  const rightCards = courses.filter((_, i) => i % 2 === 1);
  
  // Handle course distribution for carousels
  let finalLeftCards = leftCards;
  let finalRightCards = rightCards;
  
  if (courses.length === 1) {
    // Single course: show it in both carousels
    finalLeftCards = [courses[0]];
    finalRightCards = [courses[0]];
  } else if (courses.length > 0) {
    if (leftCards.length === 0 && rightCards.length > 0) {
      // If left is empty, move half of right to left
      const half = Math.ceil(rightCards.length / 2);
      finalLeftCards = rightCards.slice(0, half);
      finalRightCards = rightCards.slice(half);
    } else if (rightCards.length === 0 && leftCards.length > 0) {
      // If right is empty, move half of left to right
      const half = Math.ceil(leftCards.length / 2);
      finalRightCards = leftCards.slice(0, half);
      finalLeftCards = leftCards.slice(half);
    }
  }
  
  const [leftOffset, leftRef] = useVerticalCarousel(finalLeftCards, 'down', 1);
  const [rightOffset, rightRef] = useVerticalCarousel(finalRightCards, 'up', 1);

  return (
    <>
      <SEOHead />
      <div className={bgClass + " h-screen min-h-screen flex flex-col md:flex-row  overflow-hidden"}>
      {/* Left Column */}
      <div className="w-full h-screen md:w-1/2 bg-transparent flex flex-col min-h-0 relative">
        <div className="flex-1 w-full max-w-lg mx-auto flex flex-col items-start pt-16 px-2 gap-8 min-h-0">
          {/* Logo */}
          <Link to="/">
          <div className="flex items-center mb-8">
            <span className="text-4xl font-extrabold tracking-tight text-primary">{PLATFORM_NAME}</span>
            <span className="text-4xl font-extrabold tracking-tight text-primary">.</span>
          </div>
          </Link>
          {/* Heading */}
          <h1 className="text-5xl md:text-6xl font-black text-foreground mb-8 leading-tight">
            Your knowledge.<br />Your future.
          </h1>
          {/* Buttons or Forms */}
          <div className="flex flex-col gap-4 w-full">
            <Button className="bg-primary hover:bg-primary/80 text-primary-foreground font-bold text-lg py-4 rounded-full w-full shadow-md transition-all" onClick={() => navigate('/auth/signup')}>
            {t('authModal.createAccount')}
            </Button>
            <Button variant="outline" className="border border-border text-foreground font-semibold text-lg py-4 rounded-full w-full bg-background hover:bg-muted hover:text-primary transition-all" onClick={() => navigate('/auth/login')}>
              {t('authModal.signIn')}
            </Button>
          </div>
          <AuthModal open={location.pathname.includes('/auth/')} onOpenChange={(open) => {
            if (!open) {
              navigate('/auth');
            }
          }} className={mode === 'signup' ? 'p-0 max-w-xl' : 'p-0 max-w-lg'}>
            <AuthForm mode={mode} setMode={setMode} onClose={() => {
              navigate('/auth');
            }} />
          </AuthModal>
          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground mt-6 mb-0 text-center w-full">
            {t('authModal.byContinuing')} <button onClick={() => handleLegalLink('terms')} className="underline hover:text-primary">{t('authModal.terms')}</button> {t('authModal.and')} <button onClick={() => handleLegalLink('privacy')} className="underline hover:text-primary">{t('authModal.privacy')}</button>.
          </p>
        </div>
        {/* Footer */}
        <footer className="w-full mx-auto text-xs text-muted-foreground border-t border-border pt-6 pb-4 md:static fixed left-0 bottom-0 z-10" style={{background: 'inherit'}}>
          <div className="flex flex-row gap-6 mb-2 justify-center">
            <button onClick={() => handleLegalLink('terms')} className="hover:underline hover:text-primary">{t('authModal.footerLinks.terms')}</button>
            <span>|</span>
            <button onClick={() => handleLegalLink('privacy')} className="hover:underline hover:text-primary">{t('authModal.footerLinks.privacy')}</button>
            <span>|</span>
            <button onClick={() => handleLegalLink('help')} className="hover:underline hover:text-primary">{t('authModal.footerLinks.helpCenter')}</button>
            <span>|</span>
            <button onClick={() => handleLegalLink('contact')} className="hover:underline hover:text-primary">{t('authModal.footerLinks.contact')}</button>
          </div>
          <div className="text-xs text-muted-foreground text-center w-full">{t('authModal.copyright')}</div>
        </footer>
      </div>
      {/* Right Column: Two vertical carousels */}
      <div className="hidden md:flex w-full md:w-1/2 gap-4 px-4 h-screen items-stretch">
        {/* Left Carousel - Hidden on md, visible on xl */}
        <div className="hidden xl:flex flex-1 overflow-hidden relative h-full">
          <div
            ref={leftRef as React.RefObject<HTMLDivElement>}
            className="flex flex-col gap-6 absolute top-0 left-0 w-full"
            style={{ transform: `translateY(-${leftOffset}px)` }}
          >
            {finalLeftCards.concat(finalLeftCards).map((course, i) => (
              <PremiumCourseCard
                key={i}
                id={String(i)}
                title={course.title}
                description={course.desc}
                category={course.category}
                status={course.tags[0] || 'Active'}
                instructor_name={course.author}
                enrollment_count={Math.floor(Math.random() * 1000)}
                is_enrolled={false}
                enrollment_code={"DEMO" + i}
                cover_image_url={course.thumbnail}
                created_at={new Date().toISOString()}
                price={Math.floor(Math.random() * 100) + 10}
                isHovering={false}
                onPreview={() => {}}
                onEnroll={() => {}}
                avatar_url={undefined}
              />
            ))}
          </div>
        </div>
        {/* Right Carousel - Centered on md, right side on xl */}
        <div className="flex-1 overflow-hidden relative h-full">
          <div
            ref={rightRef as React.RefObject<HTMLDivElement>}
            className="flex flex-col gap-6 absolute top-0 left-0 w-full"
            style={{ transform: `translateY(-${rightOffset}px)` }}
          >
            {finalRightCards.concat(finalRightCards).map((course, i) => (
              <PremiumCourseCard
                key={i}
                id={String(i)}
                title={course.title}
                description={course.desc}
                category={course.category}
                status={course.tags[0] || 'Active'}
                instructor_name={course.author}
                enrollment_count={Math.floor(Math.random() * 1000)}
                is_enrolled={false}
                enrollment_code={"DEMO" + i}
                cover_image_url={course.thumbnail}
                created_at={new Date().toISOString()}
                price={Math.floor(Math.random() * 100) + 10}
                isHovering={false}
                onPreview={() => {}}
                onEnroll={() => {}}
                avatar_url={undefined}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Legal Modal */}
      <PoliciesModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        initialTab={activeTab}
      />
      </div>
    </>
  );
};

export default Auth; 