import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

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

export default ProductCard;
