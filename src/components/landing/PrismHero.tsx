import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { FaArrowRight } from 'react-icons/fa';
import type { RootState } from '@/store/store';
import Prism from '@/components/react-bits/Prism/Prism';

const PrismHero: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const userRole = user?.role || 'student';

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });
  const translateY = useTransform(scrollYProgress, [0, 1], [150, -150]);

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
          <Button 
            variant="outline"
            className="text-black hover:text-black bg-white border-white hover:bg-white/90 py-2 px-4 rounded-sm cursor-pointer"
            onClick={() => navigate('/courses')}
          >
            Browse Courses
            <FaArrowRight className="h-3 w-3 inline ml-2" />
          </Button>
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
          <Button 
            variant="outline"
            className="text-black hover:text-black bg-white border-white hover:bg-white/90 py-2 px-4 rounded-sm cursor-pointer"
            onClick={() => navigate('/courses')}
          >
            Browse Courses
            <FaArrowRight className="h-3 w-3 inline ml-2" />
          </Button>
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
          <Button 
            variant="outline"
            className="text-black hover:text-black bg-white border-white hover:bg-white/90 py-2 px-4 rounded-sm cursor-pointer"
            onClick={() => navigate('/teacher/courses')}
          >
            Create Course
            <FaArrowRight className="h-3 w-3 inline ml-2" />
          </Button>
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
        <Button 
          variant="outline"
          className="text-black hover:text-black bg-white border-white hover:bg-white/90 py-2 px-4 rounded-sm cursor-pointer"
          onClick={() => navigate('/courses')}
        >
          Explore Platform
          <FaArrowRight className="h-3 w-3 inline ml-2" />
        </Button>
      </>
    );
  };

  return (
    <section
      ref={heroRef}
      className="min-h-screen pt-16 relative overflow-hidden bg-black"
    >
      {/* Full background Prism component */}
      <div className="absolute inset-0 w-full h-full bg-black">
        <Prism
          animationType="rotate"
          timeScale={0.5}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          noise={0}
          glow={1}
        />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-7rem)] md:h-[calc(100vh-7rem)] p-4 sm:p-8 md:p-10 lg:p-20">
        <div className="flex flex-col items-center justify-center gap-8 md:gap-16 w-full max-w-7xl mx-auto text-center">
          <div className="w-full max-w-[600px]">
            <div className="text-white border-2 w-fit py-0.5 px-1.5 lg:text-lg rounded-sm border-white/30 mx-auto">
              First in Egypt
            </div>
            <div className="text-5xl md:text-7xl font-black my-7 text-white tracking-tighter">
              AI-Powered Learning
            </div>
            <div className="text-xl lg:text-2xl tracking-tighter opacity-90 text-white">
              Experience the future of education with Egypt's first AI-powered, gamified learning platform. 
              Personalized learning paths, multiplayer quizzes, and AI tutors that adapt to your style.
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 text-lg">
              {getCTAButtons()}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrismHero;
