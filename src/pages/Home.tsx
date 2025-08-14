import React, { useEffect, useRef, useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, useAnimation, useInView, useScroll, useTransform } from 'framer-motion';
import { useInView as useInViewHook } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BookOpen, 
  Users, 
  Trophy, 
  Zap, 
  ArrowRight, 
  Star,
  Sparkles,
  Brain,
  Target,
  Rocket,
  Mic,
  PlayCircle,
  Award,
  MessageSquare,
  Calendar,
  Globe,
  Shield,
  Headphones,
  Apple,
  Play
} from 'lucide-react';
import type { RootState } from '@/store/store';
import Threads from '@/components/react-bits/backgrounds/Threads/Threads';
import Silk from '@/components/react-bits/backgrounds/Silk/Silk';
import Hyperspeed from '@/components/react-bits/backgrounds/Hyperspeed/Hyperspeed';
import LiquidChrome from '@/components/react-bits/backgrounds/LiquidChrome/LiquidChrome';
import Aurora from '@/components/react-bits/backgrounds/Aurora/Aurora';
import Waves from '@/components/react-bits/backgrounds/Waves/Waves';
import HeroSection from '@/components/home/HeroSection.tsx';
const FeatureCardsSection = lazy(() => import('@/components/home/FeatureCardsSection'));
import IphoneShowcaseSection from '@/components/home/IphoneShowcaseSection';
import { useRandomBackground } from "../hooks/useRandomBackground";
import HyperspeedCardSection from '@/components/home/HyperspeedCardSection';
import { PLATFORM_NAME } from '@/data/constants';

// Morphing card component
const MorphingCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const width = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], ["100%", "95%", "90%", "85%"]);
  const borderRadius = useTransform(scrollYProgress, [0, 1], ["0px", "32px"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.98, 0.95]);

  return (
    <motion.div
      ref={ref}
      style={{ width, borderRadius, scale }}
      className={`overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Parallax section component
const ParallaxSection = ({ children, speed = 0.5, className = "" }: { 
  children: React.ReactNode, 
  speed?: number,
  className?: string 
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 100]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
};

// 3D floating elements
const FloatingElements3D = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${10 + i * 8}%`,
            top: `${20 + (i % 4) * 20}%`,
          }}
          animate={{
            y: [-30, 30, -30],
            x: [-20, 20, -20],
            rotateX: [0, 360],
            rotateY: [0, 180],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 8 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        >
          <div className={`w-${2 + (i % 3)} h-${2 + (i % 3)} bg-gradient-to-r from-emerald-400/30 to-teal-400/30 rounded-full blur-sm`} />
        </motion.div>
      ))}
    </div>
  );
};

// SVG animated logo/icon
const AnimatedLogo = () => {
  return (
    <motion.svg
      width="60"
      height="60"
      viewBox="0 0 60 60"
      className="text-emerald-400"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 2, ease: "easeInOut" }}
    >
      <motion.path
        d="M10 30 L25 15 L40 30 L25 45 Z M25 5 L50 30 L25 55 L0 30 Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 3, ease: "easeInOut" }}
      />
    </motion.svg>
  );
};

export const Home = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const bgClass = useRandomBackground();
  const cardBgClass = useRandomBackground();
  
  return (
    <div className={bgClass + " min-h-screen text-gray-900 dark:text-white relative overflow-hidden "}>
      
      {/* New Hero Section */}
      <HeroSection />



      {/* iPhone Showcase Section */}
      <IphoneShowcaseSection imageUrl = "/telda-iphone.png" imagePosition = "right"/>
      <IphoneShowcaseSection imageUrl = "/telda-card.png" imagePosition = "left"/>

      {/* Modern Hyperspeed Card Section */}
      <HyperspeedCardSection
        title="Experience Hyperspeed Learning"
        description="Dive into a futuristic learning journey with immersive visuals and seamless performance. Powered by next-gen graphics."
        
      />


      
      {/* New Animated Cards Section */}
      {/* <Suspense fallback={null}>
        <FeatureCardsSection />
      </Suspense> */}

      {/* How It Works Section */}

      {/* Interactive Stats Section */}


      {/* CTA Section with Advanced Effects */}
      <section className="py-32 relative">
        <motion.div
          className="container mx-auto px-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 mb-12 shadow-2xl"
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity }
            }}
          >
            <Rocket className="h-16 w-16 text-black" />
          </motion.div>

          <motion.h2
            className="text-6xl md:text-7xl font-light mb-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Ready to <span className="gradient-text font-medium">Transform</span> Education?
          </motion.h2>

          <motion.p
            className="text-2xl text-gray-300 max-w-4xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Join the revolution in education technology and create the future of learning
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            viewport={{ once: true }}
          >
            {!isAuthenticated ? (
              <Link to="/auth/signup">
                <motion.div
                  whileHover={{ scale: 1.05, rotateX: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="h-20 px-16 text-2xl rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold shadow-2xl hover:shadow-emerald-500/50 transition-all duration-500">
                    Launch Your Platform
                    <motion.div
                      animate={{ rotate: [0, 180, 360] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="ml-4 h-8 w-8" />
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
            ) : (
              <Link to="/courses">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="h-20 px-16 text-2xl rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold shadow-2xl hover:shadow-emerald-500/50 transition-all duration-500">
                    Explore Platform
                    <ArrowRight className="ml-4 h-8 w-8" />
                  </Button>
                </motion.div>
              </Link>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* Footer with Animated Elements */}
      <footer className="py-20 border-t border-white/10 relative">
        <div className="container mx-auto px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="flex justify-center mb-8"
              whileHover={{ scale: 1.1 }}
            >
              <AnimatedLogo />
            </motion.div>
            
            <h3 className="text-3xl font-semibold gradient-text mb-4">PLATFORM_NAME</h3>
            <p className="text-gray-400 text-lg mb-8">
              Revolutionizing education with AI-powered learning experiences
            </p>
            
            <motion.div
              className="flex justify-center space-x-8 text-gray-400"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {["Privacy", "Terms", "Support", "About"].map((item, index) => (
                <motion.a
                  key={item}
                  href="#"
                  className="hover:text-emerald-400 transition-colors duration-300"
                  whileHover={{ scale: 1.1, y: -2 }}
                >
                  {item}
                </motion.a>
              ))}
            </motion.div>
            
            <motion.p
              className="mt-12 text-gray-500"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              viewport={{ once: true }}
            >
              © 2024 {PLATFORM_NAME}. Crafted with passion for the future of education.
            </motion.p>
          </motion.div>
        </div>
      </footer>


    </div>
  );
};
