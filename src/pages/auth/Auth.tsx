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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('other');

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
            <DialogTitle className="text-2xl font-bold">{t('authModal.legalInformation')}</DialogTitle>
          </DialogHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="terms">{t('authModal.termsOfService')}</TabsTrigger>
              <TabsTrigger value="privacy">{t('authModal.privacyPolicy')}</TabsTrigger>
              <TabsTrigger value="help">{t('authModal.helpCenter')}</TabsTrigger>
              <TabsTrigger value="contact">{t('authModal.contactUs')}</TabsTrigger>
            </TabsList>
            <div className="mt-4 max-h-[60vh] overflow-y-auto">
              <TabsContent value="terms" className="space-y-4">
                <h3 className="text-xl font-semibold">{t('authModal.termsOfService')}</h3>
                <p className="text-sm text-muted-foreground">{t('authModal.lastUpdated')}</p>
                <div className="space-y-3 text-sm">
                  <p>{t('authModal.legalContent.terms.welcome')}</p>
                  <h4 className="font-semibold">1. Acceptance of Terms</h4>
                  <p>{t('authModal.legalContent.terms.acceptance')}</p>
                  <h4 className="font-semibold">2. User Accounts</h4>
                  <p>{t('authModal.legalContent.terms.userAccounts')}</p>
                  <h4 className="font-semibold">3. Acceptable Use</h4>
                  <p>{t('authModal.legalContent.terms.acceptableUse')}</p>
                  <h4 className="font-semibold">4. Intellectual Property</h4>
                  <p>{t('authModal.legalContent.terms.intellectualProperty')}</p>
                  <h4 className="font-semibold">5. Termination</h4>
                  <p>{t('authModal.legalContent.terms.termination')}</p>
                </div>
              </TabsContent>
              <TabsContent value="privacy" className="space-y-4">
                <h3 className="text-xl font-semibold">{t('authModal.privacyPolicy')}</h3>
                <p className="text-sm text-muted-foreground">{t('authModal.lastUpdated')}</p>
                <div className="space-y-3 text-sm">
                  <p>{t('authModal.legalContent.privacy.description')}</p>
                  <h4 className="font-semibold">1. Information We Collect</h4>
                  <p>{t('authModal.legalContent.privacy.informationCollection')}</p>
                  <h4 className="font-semibold">2. How We Use Your Information</h4>
                  <p>{t('authModal.legalContent.privacy.informationUsage')}</p>
                  <h4 className="font-semibold">3. Information Sharing</h4>
                  <p>{t('authModal.legalContent.privacy.informationSharing')}</p>
                  <h4 className="font-semibold">4. Data Security</h4>
                  <p>{t('authModal.legalContent.privacy.dataSecurity')}</p>
                  <h4 className="font-semibold">5. Your Rights</h4>
                  <p>{t('authModal.legalContent.privacy.yourRights')}</p>
                </div>
              </TabsContent>
              <TabsContent value="help" className="space-y-4">
                <h3 className="text-xl font-semibold">{t('authModal.helpCenter')}</h3>
                <div className="space-y-3 text-sm">
                  <h4 className="font-semibold">Getting Started</h4>
                  <p>{t('authModal.legalContent.help.gettingStarted')}</p>
                  <h4 className="font-semibold">Creating an Account</h4>
                  <p>{t('authModal.legalContent.help.creatingAccount')}</p>
                  <h4 className="font-semibold">Enrolling in Courses</h4>
                  <p>{t('authModal.legalContent.help.enrollingInCourses')}</p>
                  <h4 className="font-semibold">Accessing Your Courses</h4>
                  <p>{t('authModal.legalContent.help.accessingCourses')}</p>
                  <h4 className="font-semibold">Technical Support</h4>
                  <p>{t('authModal.legalContent.help.technicalSupport')}</p>
                  <h4 className="font-semibold">Payment Issues</h4>
                  <p>{t('authModal.legalContent.help.paymentIssues')}</p>
                </div>
              </TabsContent>
              <TabsContent value="contact" className="space-y-4">
                <h3 className="text-xl font-semibold">{t('authModal.contactUs')}</h3>
                <div className="space-y-3 text-sm">
                  <p>{t('authModal.legalContent.contact.description')}</p>
                  <h4 className="font-semibold">{t('authModal.legalContent.contact.emailSupport')}</h4>
                  <p>{t('authModal.legalContent.contact.generalInquiries')}: <a href="mailto:support@learnx.com" className="text-primary hover:underline">support@learnx.com</a></p>
                  <p>{t('authModal.legalContent.contact.technicalSupport')}: <a href="mailto:tech@learnx.com" className="text-primary hover:underline">tech@learnx.com</a></p>
                  <h4 className="font-semibold">{t('authModal.legalContent.contact.phoneSupport')}</h4>
                  <p>{t('authModal.legalContent.contact.businessHours')}</p>
                  <p>{t('authModal.legalContent.contact.phoneNumber')}</p>
                  <h4 className="font-semibold">{t('authModal.legalContent.contact.liveChat')}</h4>
                  <p>{t('authModal.legalContent.contact.liveChatDescription')}</p>
                  <h4 className="font-semibold">{t('authModal.legalContent.contact.responseTime')}</h4>
                  <p>{t('authModal.legalContent.contact.responseTimeDescription')}</p>
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