
import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Play, ArrowRight, Brain, Trophy } from 'lucide-react';

interface HeroSectionProps {
  heroRef: React.RefObject<HTMLElement>;
  heroInView: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ heroRef, heroInView }) => {
  const { scrollYProgress } = useScroll();
  const heroParallax = useTransform(scrollYProgress, [0, 0.3], [0, -50]);
  const float1Y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const float2Y = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const float3Y = useTransform(scrollYProgress, [0, 1], [0, -150]);

  // Typewriter effect
  const [displayedText, setDisplayedText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const fullText = "Egypt's First AI-Gamified LMS";

  useEffect(() => {
    if (textIndex < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(fullText.slice(0, textIndex + 1));
        setTextIndex(textIndex + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [textIndex, fullText]);

  // 3D Floating Objects
  const FloatingObject = ({ children, delay = 0, ...props }) => (
    <motion.div
      animate={{
        y: [-20, 20, -20],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
      {...props}
    >
      {children}
    </motion.div>
  );

  // Background particles
  const BackgroundParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full opacity-30"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  return (
    <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Enhanced 3D Abstract Background Objects */}
      <div className="absolute inset-0 z-0">
        {/* Large Floating Sphere */}
        <motion.div 
          style={{ y: float1Y }}
          className="absolute top-20 right-20 w-80 h-80 opacity-20"
        >
          <FloatingObject delay={0}>
            <div className="w-full h-full rounded-full bg-gradient-to-br from-white/20 via-gray-400/30 to-white/20 backdrop-blur-3xl border border-white/5 shadow-2xl"></div>
          </FloatingObject>
        </motion.div>

        {/* Medium Glassmorphism Cube */}
        <motion.div 
          style={{ y: float2Y }}
          className="absolute bottom-32 left-16 w-64 h-64 opacity-15"
        >
          <FloatingObject delay={2}>
            <div className="w-full h-full transform rotate-12 bg-gradient-to-tr from-white/10 via-gray-300/20 to-white/10 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-xl"></div>
          </FloatingObject>
        </motion.div>

        {/* Small Geometric Shapes */}
        <motion.div 
          style={{ y: float3Y }}
          className="absolute top-1/2 left-1/4 w-40 h-40 opacity-10"
        >
          <FloatingObject delay={4}>
            <div className="w-full h-full transform rotate-45 bg-gradient-to-br from-gray-200/50 to-gray-500/50 rounded-2xl backdrop-blur-sm shadow-lg"></div>
          </FloatingObject>
        </motion.div>

        {/* Futuristic Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24px,rgba(255,255,255,0.03)_25px,rgba(255,255,255,0.03)_26px,transparent_27px),linear-gradient(rgba(255,255,255,0.03)_24px,transparent_25px,transparent_26px,rgba(255,255,255,0.03)_27px)] bg-[25px_25px]" />
        </div>

        {/* Background Particles */}
        <BackgroundParticles />
      </div>

      {/* Hero Content - Centered Layout */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 text-center">
        <motion.div 
          style={{ y: heroParallax }}
          className="space-y-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: heroInView ? 1 : 0, y: heroInView ? 0 : 100 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Animated Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: heroInView ? 1 : 0, scale: heroInView ? 1 : 0.8 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-white/70">🇪🇬 Made in Egypt</span>
            </motion.div>

            {/* Main Headline with Typewriter */}
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-8xl xl:text-9xl font-black leading-tight">
                <span className="block bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
                  {displayedText}
                </span>
                <motion.span 
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="inline-block w-1 h-16 lg:h-20 xl:h-24 bg-white ml-2"
                />
              </h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: heroInView ? 1 : 0, y: heroInView ? 0 : 30 }}
                transition={{ delay: 3.5, duration: 0.8 }}
                className="text-xl lg:text-2xl text-gray-400 max-w-4xl mx-auto leading-relaxed"
              >
                Transform education with AI-powered personalization and game-like engagement. 
                Built for the modern Egyptian classroom.
              </motion.p>
            </div>

            {/* Enhanced CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: heroInView ? 1 : 0, y: heroInView ? 0 : 30 }}
              transition={{ delay: 4.2, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button 
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 25px 50px -12px rgba(255, 255, 255, 0.25)"
                }}
                whileTap={{ scale: 0.95 }}
                className="group relative bg-white text-black px-8 py-4 text-lg font-semibold rounded-xl overflow-hidden transition-all duration-300"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center">
                  <Play className="mr-3 w-5 h-5" />
                  See It Live
                  <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
              
              <motion.button 
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: "rgba(255, 255, 255, 0.05)"
                }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white px-8 py-4 text-lg font-semibold rounded-xl hover:bg-white hover:text-black transition-all duration-300"
              >
                Watch Demo
              </motion.button>
            </motion.div>
          </motion.div>

          {/* 3D Demo Card - Centered */}
          <motion.div
            initial={{ opacity: 0, y: 100, rotateX: 30 }}
            animate={{ 
              opacity: heroInView ? 1 : 0, 
              y: heroInView ? 0 : 100,
              rotateX: heroInView ? 0 : 30
            }}
            transition={{ duration: 1.2, delay: 1 }}
            className="relative max-w-4xl mx-auto mt-16"
          >
            {/* 3D Tilted Demo Card with Glass Effect */}
            <div className="relative transform rotate-2 hover:rotate-0 transition-transform duration-700 perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl"></div>
              <div className="relative p-8 lg:p-12">
                
                {/* Demo Content */}
                <div className="aspect-video bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl border border-white/20 flex items-center justify-center overflow-hidden">
                  <div className="text-center space-y-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="w-20 h-20 mx-auto"
                    >
                      <Brain className="w-full h-full text-white/60" />
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-bold text-white/80">Interactive Demo</h3>
                      <p className="text-white/60">Live platform preview</p>
                    </div>
                  </div>
                </div>
                
                {/* Demo Features */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/5">
                    <span className="text-sm font-medium text-white/70">AI Tutor Active</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-400">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/5">
                    <span className="text-sm font-medium text-white/70">Students Engaged</span>
                    <span className="text-sm font-bold text-white">2,547</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Achievement Badge */}
            <motion.div
              className="absolute -top-6 -right-6 bg-white/10 border border-white/20 rounded-2xl p-4 shadow-xl backdrop-blur-sm"
              animate={{
                y: [-10, 10, -10],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Trophy className="w-8 h-8 text-yellow-400" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
