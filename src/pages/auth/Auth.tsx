import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Apple, Play, X } from 'lucide-react';
import AuthForm from './AuthForm';
import AuthModal from '@/components/ui/AuthModal';
import { useRandomBackground } from "../../hooks/useRandomBackground";
import { PremiumCourseCard } from '@/components/courses/PremiumCourseCard';
import { PLATFORM_NAME } from '@/data/constants';
import { SEOHead } from '@/components/seo';

const cards = [
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

function useVerticalCarousel(cards, direction = 'down', speed = 1) {
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
  const bgClass = useRandomBackground();

  useEffect(() => {
    if (location.pathname.endsWith('/login')) setMode('login');
    else if (location.pathname.endsWith('/signup')) setMode('signup');
  }, [location.pathname]);

  const handleLegalLink = (tab: string) => {
    setActiveTab(tab);
    setShowLegalModal(true);
  };

  // Split cards for two carousels
  const leftCards = cards.filter((_, i) => i % 2 === 0);
  const rightCards = cards.filter((_, i) => i % 2 === 1);
  const [leftOffset, leftRef] = useVerticalCarousel(leftCards, 'down', 1);
  const [rightOffset, rightRef] = useVerticalCarousel(rightCards, 'up', 1);

  return (
    <>
      <SEOHead />
      <div className={bgClass + " h-screen min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-white to-[#fdeef7] overflow-hidden"}>
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
              Create Account
            </Button>
            <Button variant="outline" className="border border-border text-foreground font-semibold text-lg py-4 rounded-full w-full bg-background hover:bg-muted hover:text-primary transition-all" onClick={() => navigate('/auth/login')}>
              Sign In
            </Button>
          </div>
          <AuthModal open={location.pathname.includes('/auth/')} onOpenChange={(open) => {
            if (!open) {
              navigate('/');
            }
          }} className={mode === 'signup' ? 'p-0 max-w-xl' : 'p-0 max-w-lg'}>
            <AuthForm mode={mode} setMode={setMode} onClose={() => {
              navigate('/');
            }} />
          </AuthModal>
          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground mt-6 mb-0 text-center w-full">
            By continuing, you agree to our <button onClick={() => handleLegalLink('terms')} className="underline hover:text-primary">Terms</button> and <button onClick={() => handleLegalLink('privacy')} className="underline hover:text-primary">Privacy Policy</button>.
          </p>
        </div>
        {/* Footer */}
        <footer className="w-full mx-auto text-xs text-muted-foreground border-t border-border pt-6 pb-4 md:static fixed left-0 bottom-0 z-10" style={{background: 'inherit'}}>
          <div className="flex flex-row gap-6 mb-2 justify-center">
            <button onClick={() => handleLegalLink('terms')} className="hover:underline hover:text-primary">Terms</button>
            <span>|</span>
            <button onClick={() => handleLegalLink('privacy')} className="hover:underline hover:text-primary">Privacy</button>
            <span>|</span>
            <button onClick={() => handleLegalLink('help')} className="hover:underline hover:text-primary">Help Center</button>
            <span>|</span>
            <button onClick={() => handleLegalLink('contact')} className="hover:underline hover:text-primary">Contact</button>
          </div>
          <div className="text-xs text-muted-foreground text-center w-full">©2025 {PLATFORM_NAME} LMS</div>
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
            {leftCards.concat(leftCards).map((course, i) => (
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
            {rightCards.concat(rightCards).map((course, i) => (
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
      <Dialog open={showLegalModal} onOpenChange={setShowLegalModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Legal Information</DialogTitle>
          </DialogHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="terms">Terms of Service</TabsTrigger>
              <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
              <TabsTrigger value="help">Help Center</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>
            <div className="mt-4 max-h-[60vh] overflow-y-auto">
              <TabsContent value="terms" className="space-y-4">
                <h3 className="text-xl font-semibold">Terms of Service</h3>
                <p className="text-sm text-muted-foreground">Last updated: January 2025</p>
                <div className="space-y-3 text-sm">
                  <p>Welcome to {PLATFORM_NAME} LMS. By accessing our platform, you agree to these terms of service.</p>
                  <h4 className="font-semibold">1. Acceptance of Terms</h4>
                  <p>By using {PLATFORM_NAME} LMS, you accept and agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
                  <h4 className="font-semibold">2. User Accounts</h4>
                  <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                  <h4 className="font-semibold">3. Acceptable Use</h4>
                  <p>You agree not to use the service for any unlawful purpose or to violate any applicable laws or regulations.</p>
                  <h4 className="font-semibold">4. Intellectual Property</h4>
                  <p>All content on {PLATFORM_NAME} LMS is protected by copyright and other intellectual property laws.</p>
                  <h4 className="font-semibold">5. Termination</h4>
                  <p>We reserve the right to terminate or suspend your account at any time for violations of these terms.</p>
                </div>
              </TabsContent>
              <TabsContent value="privacy" className="space-y-4">
                <h3 className="text-xl font-semibold">Privacy Policy</h3>
                <p className="text-sm text-muted-foreground">Last updated: January 2025</p>
                <div className="space-y-3 text-sm">
                  <p>Your privacy is important to us. This policy describes how we collect, use, and protect your information.</p>
                  <h4 className="font-semibold">1. Information We Collect</h4>
                  <p>We collect information you provide directly to us, such as when you create an account, enroll in courses, or contact us.</p>
                  <h4 className="font-semibold">2. How We Use Your Information</h4>
                  <p>We use your information to provide and improve our services, communicate with you, and ensure platform security.</p>
                  <h4 className="font-semibold">3. Information Sharing</h4>
                  <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.</p>
                  <h4 className="font-semibold">4. Data Security</h4>
                  <p>We implement appropriate security measures to protect your personal information against unauthorized access.</p>
                  <h4 className="font-semibold">5. Your Rights</h4>
                  <p>You have the right to access, update, or delete your personal information at any time.</p>
                </div>
              </TabsContent>
              <TabsContent value="help" className="space-y-4">
                <h3 className="text-xl font-semibold">Help Center</h3>
                <div className="space-y-3 text-sm">
                  <h4 className="font-semibold">Getting Started</h4>
                  <p>Welcome to {PLATFORM_NAME} LMS! Here's how to get started with your learning journey.</p>
                  <h4 className="font-semibold">Creating an Account</h4>
                  <p>Click "Create Account" on the homepage and follow the simple registration process.</p>
                  <h4 className="font-semibold">Enrolling in Courses</h4>
                  <p>Browse our course catalog and click "Enroll Now" on any course that interests you.</p>
                  <h4 className="font-semibold">Accessing Your Courses</h4>
                  <p>Once enrolled, you can access your courses from your dashboard at any time.</p>
                  <h4 className="font-semibold">Technical Support</h4>
                  <p>If you encounter technical issues, please contact our support team for assistance.</p>
                  <h4 className="font-semibold">Payment Issues</h4>
                  <p>For payment-related questions, please check your account settings or contact billing support.</p>
                </div>
              </TabsContent>
              <TabsContent value="contact" className="space-y-4">
                <h3 className="text-xl font-semibold">Contact Us</h3>
                <div className="space-y-3 text-sm">
                  <p>We're here to help! Reach out to us through any of the following channels.</p>
                  <h4 className="font-semibold">Email Support</h4>
                  <p>General inquiries: <a href="mailto:support@learnx.com" className="text-primary hover:underline">support@learnx.com</a></p>
                  <p>Technical support: <a href="mailto:tech@learnx.com" className="text-primary hover:underline">tech@learnx.com</a></p>
                  <h4 className="font-semibold">Phone Support</h4>
                  <p>Monday - Friday, 9 AM - 6 PM EST</p>
                  <p>+1 (555) 123-4567</p>
                  <h4 className="font-semibold">Live Chat</h4>
                  <p>Available during business hours through our website chat widget.</p>
                  <h4 className="font-semibold">Response Time</h4>
                  <p>We typically respond to inquiries within 24 hours during business days.</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
};

export default Auth; 