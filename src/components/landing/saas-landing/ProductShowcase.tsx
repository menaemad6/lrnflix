import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

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
      className="bg-gradient-to-t from-[#acbae8] to-white flex flex-col items-center pb-24 relative overflow-hidden"
    >
      <div className="flex flex-col items-center font-medium mt-24 px-8 mx-auto md:w-[550px] lg:w-[630px] xl:w-[700px] 2xl:w-[800px]">
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
      
      {/* Container with proper constraints to prevent overflow */}
      <div className="relative w-full max-w-7xl mx-auto px-4 lg:px-8">
        <div className="relative">
          {/* Pyramid - positioned responsively */}
          <motion.img
            src="/assests/pyramid.png"
            alt="Pyramid Image"
            className="absolute hidden md:block z-20 w-48 h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 2xl:w-72 2xl:h-72
                     md:-right-8 lg:-right-12 xl:-right-16 2xl:-right-20
                     md:-top-12 lg:-top-16 xl:-top-20 2xl:-top-24"
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
          
          {/* Main Product Image */}
          <img 
            src="/assests/Product Image.png" 
            alt="Product Image" 
            className="px-1 relative z-10 w-full max-w-6xl mx-auto" 
          />
          
          {/* Tube - positioned responsively */}
          <motion.img
            src="/assests/tube.png"
            alt="Tube Image"
            className="absolute hidden md:block z-20 w-48 h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 2xl:w-72 2xl:h-72
                     md:-left-8 lg:-left-12 xl:-left-16 2xl:-left-20
                     md:top-48 lg:top-56 xl:top-64 2xl:top-72"
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
    </div>
  );
};

export default ProductShowcase;
