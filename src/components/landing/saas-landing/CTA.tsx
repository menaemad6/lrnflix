import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { FaArrowRight } from 'react-icons/fa';
import type { RootState } from '@/store/store';

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

export default CTA;
