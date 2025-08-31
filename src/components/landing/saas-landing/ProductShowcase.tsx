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

export default ProductShowcase;
