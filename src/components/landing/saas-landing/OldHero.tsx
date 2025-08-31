import { Button } from "@/components/ui/button";
import { RootState } from "@/store/store";
import { useScroll, useTransform , motion } from "framer-motion";
import { useRef } from "react";
import { FaArrowRight } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

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