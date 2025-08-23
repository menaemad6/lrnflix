import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimation, useInView, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useInView as useInViewHook } from 'react-intersection-observer';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getFeaturedInstructors, getTopCourses } from '@/lib/queries';
import {
  ArrowRight,
  Star,
  Sparkles,
  Brain,
  Target,
  Rocket,
  PlayCircle,
  Award,
  ChevronRight,
  TrendingUp,
  GraduationCap,
  Lightbulb,
  Clock,
  CheckCircle2,
  Flame,
  Crown,
  Infinity,
  Zap,
  Bot,
  Gamepad2,
  Video,
  Shield,
  Globe,
  Users,
  BookOpen,
  Trophy,
  Calendar,
  MessageSquare,
  Headphones,
  Play,
  Eye,
  Cpu
} from 'lucide-react';
import ModernLayoutHero from './ModernLayoutHero';
import HeroSection from '../home/HeroSection';
import FeaturedInstructorsSkeleton from "./skeletons/FeaturedInstructorsSkeleton";
import TopCoursesSkeleton from "./skeletons/TopCoursesSkeleton";


interface Instructor {
    user_id: string;
    display_name: string;
    profile_image_url: string;
    specialization: string;
    bio: string;
    slug: string;
    social_links: {
      twitter?: string;
      linkedin?: string;
      github?: string;
    };
  }
  
  interface Course {
    id: string;
    title: string;
    description: string;
    cover_image_url: string;
    price: number;
    profiles: {
      full_name: string;
    };
    enrollments: {
      count: number;
    }[];
  }

// Premium Mouse Lighting Effect - Ultra Modern
const PremiumMouseLightingEffect = React.memo(() => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(true);
  const [intensity, setIntensity] = useState(1);
  const [isOverHero, setIsOverHero] = useState(false);
  const lastUpdateTime = useRef(Date.now());
  const smoothPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let animationFrame: number;
    
    const handleMouseMove = (e: MouseEvent) => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastUpdateTime.current;
      
      // Smooth interpolation for premium feel
      const lerpFactor = Math.min(deltaTime / 16, 1); // 60fps target
      smoothPosition.current.x += (e.clientX - smoothPosition.current.x) * lerpFactor * 0.8;
      smoothPosition.current.y += (e.clientY - smoothPosition.current.y) * lerpFactor * 0.8;
      
      // Check if over hero section
      const heroElement = document.querySelector('[data-hero-section]');
      if (heroElement) {
        const heroRect = heroElement.getBoundingClientRect();
        const overHero = e.clientY >= heroRect.top && e.clientY <= heroRect.bottom;
        setIsOverHero(overHero);
      }
      
      animationFrame = requestAnimationFrame(() => {
        setMousePosition({
          x: smoothPosition.current.x,
          y: smoothPosition.current.y
        });
      });
      
      lastUpdateTime.current = currentTime;
    };

    const handleMouseEnter = () => setIsActive(true);
    const handleMouseLeave = () => setIsActive(false);

    // Initialize smooth position
    smoothPosition.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

  // Dynamic intensity based on page sections
  useEffect(() => {
    const updateIntensity = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Reduce intensity in hero section
      if (scrollY < windowHeight) {
        setIntensity(0.3);
      } else {
        setIntensity(1);
      }
    };

    window.addEventListener('scroll', updateIntensity);
    updateIntensity();

    return () => window.removeEventListener('scroll', updateIntensity);
  }, []);

  if (!isActive || isOverHero) return null;

  return (
    <>
      {/* Primary Light Cone - Paper Illumination Effect */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-50"
        animate={{
          opacity: intensity * 0.15,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, 
            rgba(255, 255, 255, ${intensity * 0.08}), 
            rgba(0, 255, 136, ${intensity * 0.04}) 30%,
            transparent 70%)`,
          mixBlendMode: 'soft-light',
        }}
      />

      {/* Secondary Glow - Warm Paper Effect */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-49"
        animate={{
          opacity: intensity * 0.12,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, 
            rgba(255, 248, 220, ${intensity * 0.06}), 
            rgba(0, 255, 136, ${intensity * 0.03}) 40%,
            transparent 80%)`,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Pattern Illumination Layer */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-48"
        animate={{
          opacity: intensity * 0.1,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{
          background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, 
            rgba(0, 255, 136, ${intensity * 0.05}), 
            transparent 60%)`,
          mixBlendMode: 'screen',
        }}
      />

      {/* Subtle Ambient Light */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-47"
        animate={{
          opacity: intensity * 0.08,
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          background: `radial-gradient(1000px circle at ${mousePosition.x}px ${mousePosition.y}px, 
            rgba(255, 255, 255, ${intensity * 0.02}), 
            transparent 90%)`,
          mixBlendMode: 'soft-light',
        }}
      />
    </>
  );
});

// Revolutionary AI Neural Network Animation Component
const AINetworkBackground = React.memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const nodes: Array<{x: number, y: number, vx: number, vy: number, connections: number[]}> = [];
    const nodeCount = 50;
    
    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        connections: []
      });
    }
    
    // Create connections
    nodes.forEach((node, i) => {
      const nearbyNodes = nodes
        .map((n, j) => ({ node: n, index: j, distance: Math.hypot(n.x - node.x, n.y - node.y) }))
        .filter(n => n.distance < 150 && n.index !== i)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);
      
      node.connections = nearbyNodes.map(n => n.index);
    });
    
    let animationId: number;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update nodes
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));
      });
      
      // Draw connections
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.1)';
      ctx.lineWidth = 1;
      
      nodes.forEach((node, i) => {
        node.connections.forEach(connectionIndex => {
          const connectedNode = nodes[connectionIndex];
          if (connectedNode) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(connectedNode.x, connectedNode.y);
            ctx.stroke();
          }
        });
      });
      
      // Draw nodes
      nodes.forEach(node => {
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 4);
        gradient.addColorStop(0, 'rgba(34, 197, 94, 0.8)');
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0.2)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Add pulsing effect to some nodes
        if (Math.random() < 0.01) {
          ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ background: 'transparent' }}
    />
  );
});

// Revolutionary Hero Section with 3D Elements
const RevolutionaryHero = React.memo(() => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 400], [1, 0.9]);
  
  return (
    <motion.section 
      style={{ opacity, scale }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* AI Network Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900">
        <AINetworkBackground />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>
      
      {/* Floating AI Orbs */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [-30, 30, -30],
              x: [-20, 20, -20],
              rotate: [0, 360],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 6 + i * 0.5,
              repeatType: "loop",
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          >
            <div className="relative">
              <div className={`w-16 h-16 rounded-full ${
                i % 4 === 0 ? 'bg-gradient-to-r from-primary-400 to-secondary-400' :
                i % 4 === 1 ? 'bg-gradient-to-r from-primary-400 to-secondary-400' :
                i % 4 === 2 ? 'bg-gradient-to-r from-primary-400 to-secondary-400' :
                'bg-gradient-to-r from-primary-400 to-secondary-400'
              } opacity-20 blur-sm`} />
              <div className="absolute inset-0 flex items-center justify-center">
                {i % 4 === 0 ? <Brain className="h-6 w-6 text-primary-400" /> :
                 i % 4 === 1 ? <Bot className="h-6 w-6 text-primary-400" /> :
                 i % 4 === 2 ? <Gamepad2 className="h-6 w-6 text-primary-400" /> :
                 <Zap className="h-6 w-6 text-primary-400" />}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {/* Revolutionary Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mb-8"
          >
            <Badge className="revolutionary-badge text-primary-300 border-primary-500/30 px-8 py-3 text-lg font-bold backdrop-blur-sm">
              <Sparkles className="mr-3 h-5 w-5" />
              AI-Powered • Gamified • Revolutionary
              <Crown className="ml-3 h-5 w-5" />
            </Badge>
          </motion.div>

          {/* Mind-Blowing Headline */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1.2 }}
          >
            <h1 className="text-7xl md:text-9xl lg:text-[12rem] font-black mb-8 tracking-tight">
              <span className="block bg-gradient-to-r from-white via-primary-300 to-secondary-300 bg-clip-text text-transparent">
                LEARN
              </span>
              <motion.span
                animate={{ 
                  backgroundPosition: ['0%', '100%', '0%'],
                }}
                transition={{ duration: 4, repeatType: "loop" }}
                className="block bg-gradient-to-r from-primary via-primary-400 to-secondary-400 bg-[length:200%_100%] bg-clip-text text-transparent"
                style={{ backgroundSize: '200% 100%' }}
              >
                BEYOND
              </motion.span>
              <span className="block bg-gradient-to-r from-primary via-primary-400 to-secondary-400 bg-clip-text text-transparent">
                LIMITS
              </span>
            </h1>
          </motion.div>

          {/* Revolutionary Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="mb-12"
          >
            <p className="text-2xl md:text-4xl text-white/90 max-w-5xl mx-auto leading-relaxed font-light">
              The world's first <span className="font-bold text-primary">AI-Native</span> learning ecosystem that
              <br />
              <span className="font-bold text-primary">gamifies knowledge</span> and 
              <span className="font-bold text-primary"> transforms minds</span>
            </p>
          </motion.div>

          {/* AI Statistics Ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="mb-16"
          >
            <div className="flex flex-wrap justify-center gap-8 text-sm font-mono">
              {[
                { label: 'AI Responses/sec', value: '∞', icon: Bot },
                { label: 'Knowledge Points', value: '10M+', icon: Brain },
                { label: 'Active Minds', value: '250K+', icon: Users },
                { label: 'Success Rate', value: '98.7%', icon: Target }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeatType: "loop", delay: i * 0.5 }}
                  className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-full px-6 py-3 border border-white/10"
                >
                  <stat.icon className="h-4 w-4 text-primary" />
                  <span className="text-white/60">{stat.label}:</span>
                  <span className="text-primary font-bold">{stat.value}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Revolutionary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 1 }}
            className="flex flex-col sm:flex-row gap-8 justify-center items-center"
          >
            <Link to="/auth/signup">
              <motion.div
                whileHover={{ scale: 1.1, rotateY: 10 }}
                whileTap={{ scale: 0.95 }}
                className="group relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />
                <Button className="relative bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 text-black font-black px-16 py-8 text-2xl rounded-full shadow-2xl border-4 border-white/20">
                  <Rocket className="mr-4 h-8 w-8" />
                  ENTER THE MATRIX
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.3, 1]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeatType: "loop"
                    }}
                  >
                    <Sparkles className="ml-4 h-8 w-8" />
                  </motion.div>
                </Button>
              </motion.div>
            </Link>

            <motion.div
              whileHover={{ scale: 1.05, rotateY: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="outline" className="px-16 py-8 text-2xl rounded-full border-2 border-primary-500/50 text-primary hover:bg-primary-500/10 backdrop-blur-sm bg-white/5">
                <PlayCircle className="mr-4 h-8 w-8" />
                EXPERIENCE DEMO
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
});

// AI-Powered Features Showcase with 3D Cards
const AIFeaturesShowcase = React.memo(() => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-1, 1], [-5, 5]);
  const rotateY = useTransform(mouseX, [-1, 1], [-5, 5]);

  const features = [
    {
      id: 0,
      icon: Brain,
      title: "Neural Learning Engine",
      subtitle: "MIND ENHANCEMENT PROTOCOL",
      description: "AI that learns how YOU learn, adapting in real-time to your cognitive patterns",
      power: "340% faster retention",
      color: "#00ff88",
      particles: 120,
      demo: {
        title: "NEURAL SYNC ACTIVE",
        status: "Analyzing cognitive patterns...",
        metrics: ["Pattern Recognition: 94%", "Memory Optimization: 87%", "Focus Enhancement: 91%"]
      }
    },
    {
      id: 1,
      icon: Zap,
      title: "Quantum Knowledge Transfer",
      subtitle: "INSTANT MASTERY SYSTEM",
      description: "Download skills directly into your brain using quantum-entangled learning matrices",
      power: "Instant skill acquisition",
      color: "#ff0080",
      particles: 150,
      demo: {
        title: "QUANTUM LINK ESTABLISHED",
        status: "Transferring advanced calculus...",
        metrics: ["Transfer Rate: 99.7%", "Retention Lock: 100%", "Neural Integration: 95%"]
      }
    },
    {
      id: 2,
      icon: Eye,
      title: "Reality Augmentation",
      subtitle: "PERCEPTION AMPLIFIER",
      description: "See knowledge layers overlaid on reality through advanced AR neural interfaces",
      power: "360° enhanced perception",
      color: "#00ffff",
      particles: 200,
      demo: {
        title: "AR MATRIX ONLINE",
        status: "Overlaying knowledge layers...",
        metrics: ["Visual Processing: 98%", "Data Integration: 92%", "Reality Sync: 89%"]
      }
    },
    {
      id: 3,
      icon: Cpu,
      title: "Consciousness Expansion",
      subtitle: "MIND MULTIPLICATION CORE",
      description: "Multiply your consciousness across parallel learning dimensions simultaneously",
      power: "∞ parallel processing",
      color: "#ffaa00",
      particles: 180,
      demo: {
        title: "CONSCIOUSNESS MULTIPLIED",
        status: "Processing 47 subjects simultaneously...",
        metrics: ["Parallel Streams: 47", "Sync Efficiency: 96%", "Mind Load: 23%"]
      }
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isInteracting) {
        setActiveFeature((prev) => (prev + 1) % features.length);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isInteracting, features.length]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
    mouseY.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
  };

  return (
    <section className="py-32 relative overflow-hidden bg-black">
      {/* Holographic Grid Background - Darkened */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,136,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,136,0.08) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
          animate={{
            backgroundPosition: [
              '0px 0px, 0px 0px',
              '40px 40px, 40px 40px',
              '0px 0px, 0px 0px'
            ],
          }}
          transition={{
            duration: 25,
            repeatType: "loop",
            ease: "linear",
          }}
        />
      </div>

      {/* Neural Network Background */}
      <div className="absolute inset-0 opacity-15">
        <motion.svg 
          className="w-full h-full" 
          viewBox="0 0 1000 1000"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeatType: "loop" }}
        >
          {[...Array(50)].map((_, i) => {
            const cx = Math.random() * 1000;
            const cy = Math.random() * 1000;
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r="2"
                fill={features[activeFeature].color}
                style={{ 
                  opacity: 0.3 + Math.sin(Date.now() * 0.001 + i) * 0.3,
                  transform: `scale(${1 + Math.sin(Date.now() * 0.002 + i) * 0.5})`
                }}
              />
            );
          })}
          {[...Array(25)].map((_, i) => {
            const x1 = Math.random() * 1000;
            const y1 = Math.random() * 1000;
            const x2 = Math.random() * 1000;
            const y2 = Math.random() * 1000;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={features[activeFeature].color}
                strokeWidth="1"
                style={{ 
                  opacity: 0.1 + Math.sin(Date.now() * 0.0015 + i) * 0.2
                }}
              />
            );
          })}
        </motion.svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.h2 className="text-5xl md:text-7xl lg:text-9xl font-black mb-8 h-48 md:h-64 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={activeFeature}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-clip-text"
                style={{
                  backgroundImage: `linear-gradient(45deg, #ffffff, ${features[activeFeature].color}, #ffffff)`,
                  WebkitTextFillColor: "transparent",
                }}
              >
                SUPERHUMAN
                <br />
                <span 
                  className="bg-clip-text"
                  style={{
                    backgroundImage: `linear-gradient(45deg, ${features[activeFeature].color}, #00ff88, ${features[activeFeature].color})`,
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  COGNITION
                </span>
              </motion.span>
            </AnimatePresence>
          </motion.h2>
          <motion.p 
            className="text-2xl text-white/70 max-w-4xl mx-auto"
            animate={{ color: [`rgba(255,255,255,0.7)`, `${features[activeFeature].color}80`, `rgba(255,255,255,0.7)`] }}
            transition={{ duration: 3, repeatType: "loop" }}
          >
            Transcend human limitations. Unlock infinite potential.
          </motion.p>
        </motion.div>

        {/* Main Interactive Display */}
        <div 
          className="relative max-w-7xl mx-auto"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsInteracting(true)}
          onMouseLeave={() => setIsInteracting(false)}
        >
          {/* Central Holographic Display */}
          <motion.div
            className="relative h-auto md:h-[600px] rounded-3xl overflow-hidden"
            style={{
              background: `radial-gradient(circle at center, ${features[activeFeature].color}20 0%, transparent 70%)`,
              rotateX,
              rotateY,
              transformPerspective: '1000px'
            }}
          >
            {/* Hologram Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
            <motion.div
              className="absolute inset-0 border-2 rounded-3xl"
              style={{ borderColor: features[activeFeature].color }}
              animate={{
                boxShadow: [
                  `0 0 20px ${features[activeFeature].color}40`,
                  `0 0 60px ${features[activeFeature].color}80`,
                  `0 0 20px ${features[activeFeature].color}40`,
                ],
              }}
              transition={{ duration: 2, repeatType: "loop" }}
            />

            {/* Feature Content */}
            <div className="relative h-full flex items-center justify-center p-6 md:p-12">
              <div className="text-center space-y-4 md:space-y-8">
                {/* Animated Icon */}
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ 
                    rotate: { duration: 20, repeatType: "loop", ease: "linear" },
                    scale: { duration: 4, repeatType: "loop" }
                  }}
                  className="relative mx-auto w-24 h-24 md:w-32 md:h-32 mt-16"
                >
                  <div 
                    className="absolute inset-0 rounded-full blur-xl opacity-60"
                    style={{ backgroundColor: features[activeFeature].color }}
                  />
                  <div 
                    className="relative w-full h-full rounded-full flex items-center justify-center"
                    style={{ 
                      background: `linear-gradient(45deg, ${features[activeFeature].color}, transparent, ${features[activeFeature].color})`,
                      border: `2px solid ${features[activeFeature].color}`,
                    }}
                  >
                    {React.createElement(features[activeFeature].icon, { className: "h-12 w-12 md:h-16 md:w-16 text-white" })}
                  </div>
                </motion.div>

                {/* Feature Info */}
                <div className="space-y-4">
                  <motion.p 
                    className="text-xs md:text-sm font-mono tracking-widest uppercase"
                    style={{ color: features[activeFeature].color }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeatType: "loop" }}
                  >
                    {features[activeFeature].subtitle}
                  </motion.p>
                  <h3 className="text-3xl md:text-5xl font-black text-white">
                    {features[activeFeature].title}
                  </h3>
                  <p className="text-base md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                    {features[activeFeature].description}
                  </p>
                  <motion.div
                    className="inline-block px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-black text-base md:text-lg"
                    style={{ backgroundColor: features[activeFeature].color }}
                    animate={{ 
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        `0 0 20px ${features[activeFeature].color}60`,
                        `0 0 40px ${features[activeFeature].color}80`,
                        `0 0 20px ${features[activeFeature].color}60`,
                      ]
                    }}
                    transition={{ duration: 2, repeatType: "loop" }}
                  >
                    {features[activeFeature].power}
                  </motion.div>
                </div>

                {/* Live Demo Panel */}
                <motion.div
                  className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 md:p-6 border max-w-sm mx-auto"
                  style={{ borderColor: `${features[activeFeature].color}40` }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={activeFeature}
                  transition={{ delay: 0.5 }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: features[activeFeature].color }}
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeatType: "loop" }}
                      />
                      <span className="font-mono text-sm font-bold" style={{ color: features[activeFeature].color }}>
                        {features[activeFeature].demo.title}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm">
                      {features[activeFeature].demo.status}
                    </p>
                    <div className="space-y-2">
                      {features[activeFeature].demo.metrics.map((metric, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-white/60">{metric.split(':')[0]}:</span>
                          <motion.span
                            className="font-mono font-bold"
                            style={{ color: features[activeFeature].color }}
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 1.5, repeatType: "loop", delay: i * 0.2 }}
                          >
                            {metric.split(':')[1]}
                          </motion.span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Feature Navigation Orbs */}
          <div className="relative md:absolute -bottom-16 md:-bottom-10 left-0 right-0 mx-auto flex justify-center gap-4 md:gap-6 mt-8 md:mt-0">
            {features.map((feature, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  setActiveFeature(index);
                  setIsInteracting(true);
                  setTimeout(() => setIsInteracting(false), 3000);
                }}
                className="relative w-12 h-12 md:w-16 md:h-16 rounded-full border-2 transition-all duration-300"
                style={{
                  borderColor: activeFeature === index ? feature.color : 'rgba(255,255,255,0.3)',
                  backgroundColor: activeFeature === index ? `${feature.color}20` : 'transparent',
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                {React.createElement(feature.icon, { 
                  className: "h-6 w-6 md:h-8 md:w-8 mx-auto", 
                  style: { color: activeFeature === index ? feature.color : 'rgba(255,255,255,0.6)' }
                })}
                {activeFeature === index && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: feature.color }}
                    initial={{ scale: 1, opacity: 0.3 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1.5, repeatType: "loop" }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Power Metrics Bar */}
        <motion.div
          className="mt-20 max-w-4xl mx-auto hidden lg:block"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { label: "Neural Enhancement", value: "340%", icon: Brain },
              { label: "Processing Speed", value: "∞x", icon: Zap },
              { label: "Knowledge Retention", value: "100%", icon: Eye },
              { label: "Consciousness Level", value: "IX", icon: Cpu },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="text-center p-4 md:p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
                whileHover={{ 
                  scale: 1.05,
                  borderColor: features[activeFeature].color,
                  backgroundColor: `${features[activeFeature].color}10`
                }}
                transition={{ duration: 0.3 }}
              >
                {React.createElement(stat.icon, { className: "h-6 w-6 md:h-8 md:w-8 mx-auto mb-3", style: { color: features[activeFeature].color } })}
                <div className="text-xl md:text-3xl font-black mb-2" style={{ color: features[activeFeature].color }}>
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-white/70">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
});


// Revolutionary Elite Instructors Showcase with Mind-Bending Animations
const FeaturedInstructors = React.memo(() => {
    const { data: instructors, isLoading, isError } = useQuery({
        queryKey: ['featuredInstructors'],
        queryFn: getFeaturedInstructors,
        initialData: [],
      });

  const [activeInstructor, setActiveInstructor] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const motionMouseX = useMotionValue(0.5);
  const motionMouseY = useMotionValue(0.5);

  const rotateY = useTransform(motionMouseX, [0, 1], [-10, 10]);
  const rotateX = useTransform(motionMouseY, [0, 1], [10, -10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect();
      motionMouseX.set((e.clientX - rect.left) / rect.width);
      motionMouseY.set((e.clientY - rect.top) / rect.height);
    }
  };

  // Auto-rotate active instructor
  useEffect(() => {
    if (!isHovering && instructors.length > 0) {
      const interval = setInterval(() => {
        setActiveInstructor((prev) => (prev + 1) % instructors.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [instructors.length, isHovering]);
    
      if (isError) {
        return <div>Error fetching instructors</div>;
      }

  const specializationColors = {
    'AI & Machine Learning': { primary: '#00ff88', secondary: '#00cc66', particles: '#88ffaa' },
    'Web Development': { primary: '#ff0080', secondary: '#cc0066', particles: '#ff88cc' },
    'Data Science': { primary: '#0080ff', secondary: '#0066cc', particles: '#88ccff' },
    'Cybersecurity': { primary: '#ff8000', secondary: '#cc6600', particles: '#ffaa88' },
    'Mobile Development': { primary: '#8000ff', secondary: '#6600cc', particles: '#cc88ff' },
    'DevOps': { primary: '#00ffff', secondary: '#00cccc', particles: '#88ffff' },
    default: { primary: '#00ff88', secondary: '#00cc66', particles: '#88ffaa' }
  };

  const getInstructorColors = (specialization: string) => {
    return specializationColors[specialization as keyof typeof specializationColors] || specializationColors.default;
  };

    return (
    <section 
      ref={sectionRef}
      className="py-32 relative overflow-hidden bg-black"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Holographic Grid Background - Darkened */}
      <div className="absolute inset-0 opacity-8">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,136,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,136,0.06) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
          animate={{
            backgroundPosition: [
              '0px 0px, 0px 0px',
              '60px 60px, 60px 60px',
              '0px 0px, 0px 0px'
            ],
          }}
          transition={{
            duration: 30,
            repeatType: "loop",
            ease: "linear",
          }}
        />
      </div>

      {/* Morphing Background Gradient */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: instructors.length > 0 
            ? `radial-gradient(circle at ${motionMouseX.get() * 100}% ${motionMouseY.get() * 100}%, ${getInstructorColors(instructors[activeInstructor]?.specialization).primary}20, transparent 70%)`
            : 'radial-gradient(circle at 50% 50%, #00ff8820, transparent 70%)'
        }}
        transition={{ duration: 0.8 }}
      />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Revolutionary Title */}
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
          <motion.h2 className="text-5xl md:text-7xl lg:text-9xl font-black mb-8 h-48 md:h-64 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={activeInstructor}
                initial={{ opacity: 0, rotateX: -90 }}
                animate={{ opacity: 1, rotateX: 0 }}
                exit={{ opacity: 0, rotateX: 90 }}
                transition={{ duration: 0.8 }}
                className="bg-clip-text"
                style={{
                  backgroundImage: instructors.length > 0 
                    ? `linear-gradient(45deg, #ffffff, ${getInstructorColors(instructors[activeInstructor]?.specialization).primary}, #ffffff)`
                    : 'linear-gradient(45deg, #ffffff, #00ff88, #ffffff)',
                  WebkitTextFillColor: "transparent",
                }}
              >
                LEGENDARY
                        <br />
                <span 
                  className="bg-clip-text"
                  style={{
                    backgroundImage: instructors.length > 0
                      ? `linear-gradient(45deg, ${getInstructorColors(instructors[activeInstructor]?.specialization).primary}, ${getInstructorColors(instructors[activeInstructor]?.specialization).secondary}, ${getInstructorColors(instructors[activeInstructor]?.specialization).primary})`
                      : 'linear-gradient(45deg, #00ff88, #00cc66, #00ff88)',
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  MENTORS
                        </span>
              </motion.span>
            </AnimatePresence>
          </motion.h2>
          <motion.p 
            className="text-2xl text-white/70 max-w-4xl mx-auto"
            animate={{
              color: instructors.length > 0 
                ? getInstructorColors(instructors[activeInstructor]?.specialization).primary + '70'
                : '#ffffff70'
            }}
            transition={{ duration: 0.8 }}
          >
            Elite masters who've shaped the digital universe
          </motion.p>
                </motion.div>

                {isLoading ? <FeaturedInstructorsSkeleton /> : (
          <div className="relative">
            {/* Main Instructor Display - Holographic Style */}
            {instructors.length > 0 && (
                        <motion.div
                className="flex flex-col lg:flex-row items-center justify-center gap-16 mb-20"
                key={activeInstructor}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
              >
                {/* 3D Instructor Avatar */}
                            <motion.div 
                  className="relative group perspective-1000"
                  style={{
                    rotateY,
                    rotateX,
                  }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                >
                  
                  
                  {/* Main Avatar */}
                  <motion.div
                    className="relative w-80 h-80 rounded-full overflow-hidden border-8 shadow-2xl"
                    style={{
                      borderColor: getInstructorColors(instructors[activeInstructor]?.specialization).primary,
                      boxShadow: `0 0 80px ${getInstructorColors(instructors[activeInstructor]?.specialization).primary}40`,
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      rotateZ: 5,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <motion.img 
                      src={instructors[activeInstructor]?.profile_image_url} 
                      alt={instructors[activeInstructor]?.display_name}
                      className="object-cover w-full h-full"

                      animate={{
                        filter: `hue-rotate(${Math.sin(Date.now() * 0.001) * 30}deg) saturate(1.2)`,
                      }}
                    />
                    <div 
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: `radial-gradient(circle, transparent 40%, ${getInstructorColors(instructors[activeInstructor]?.specialization).primary}60)`,
                      }}
                    />
                            </motion.div>
                </motion.div>

                {/* Instructor Info Panel */}
                <motion.div
                  className="flex-1 max-w-2xl text-center lg:text-left"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.3 }}
                >
                  <motion.h3 
                    className="text-6xl font-black mb-4"
                    style={{
                      color: getInstructorColors(instructors[activeInstructor]?.specialization).primary,
                    }}
                    animate={{
                      textShadow: `0 0 30px ${getInstructorColors(instructors[activeInstructor]?.specialization).primary}60`,
                    }}
                  >
                    {instructors[activeInstructor]?.display_name}
                  </motion.h3>
                  
                  <motion.div
                    className="inline-block px-8 py-3 rounded-full mb-6 font-bold text-xl"
                    style={{
                      background: `linear-gradient(45deg, ${getInstructorColors(instructors[activeInstructor]?.specialization).primary}20, ${getInstructorColors(instructors[activeInstructor]?.specialization).secondary}20)`,
                      border: `2px solid ${getInstructorColors(instructors[activeInstructor]?.specialization).primary}60`,
                      color: getInstructorColors(instructors[activeInstructor]?.specialization).primary,
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {instructors[activeInstructor]?.specialization}
                  </motion.div>

                  <motion.p 
                    className="text-2xl text-white/80 mb-8 leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    {instructors[activeInstructor]?.bio}
                  </motion.p>

                  <motion.button
                        className="px-8 py-4 rounded-full font-bold text-black text-lg"
                        style={{
                          background: `linear-gradient(45deg, ${getInstructorColors(instructors[activeInstructor].specialization).primary}, ${getInstructorColors(instructors[activeInstructor].specialization).secondary})`,
                        }}
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: `0 10px 40px ${getInstructorColors(instructors[activeInstructor].specialization).primary}40`,
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          console.log(instructors[activeInstructor].slug);
                          navigate(`/teachers/${instructors[activeInstructor].slug}`);
                        }}
                      >
                        <Rocket className="inline mr-2 h-5 w-5" />
                        VIEW ALL COURSES
                      </motion.button>

                  {/* Social Links as Floating Badges */}
                  {instructors[activeInstructor]?.social_links && (
                    <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                      {Object.entries(instructors[activeInstructor].social_links).map(([key, value], i) => (
                                    value && (
                          <motion.div
                            key={key}
                            className="px-6 py-3 rounded-full font-bold cursor-pointer"
                            style={{
                              background: `linear-gradient(45deg, ${getInstructorColors(instructors[activeInstructor]?.specialization).primary}, ${getInstructorColors(instructors[activeInstructor]?.specialization).secondary})`,
                              color: '#000000',
                            }}
                            whileHover={{ 
                              scale: 1.1, 
                              y: -5,
                              boxShadow: `0 10px 30px ${getInstructorColors(instructors[activeInstructor]?.specialization).primary}40`,
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + i * 0.05 }}
                          >
                                            {key.toUpperCase()}
                          </motion.div>
                                    )
                                ))}
                            </div>
                  )}
                        </motion.div>
              </motion.div>
            )}

            {/* Instructor Navigation Dots */}
            <motion.div
              className="flex justify-center gap-6 mb-16"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              viewport={{ once: true }}
            >
              {instructors.map((instructor: Instructor, index) => (
                <motion.button
                  key={index}
                  className="w-6 h-6 rounded-full border-2 cursor-pointer transition-all duration-300"
                  style={{
                    backgroundColor: index === activeInstructor 
                      ? getInstructorColors(instructor.specialization).primary
                      : 'transparent',
                    borderColor: getInstructorColors(instructor.specialization).primary,
                    boxShadow: index === activeInstructor 
                      ? `0 0 20px ${getInstructorColors(instructor.specialization).primary}60`
                      : 'none',
                  }}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActiveInstructor(index)}
                />
              ))}
            </motion.div>

            {/* Mini Instructor Preview Grid */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6"
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, staggerChildren: 0.1 }}
              viewport={{ once: true }}
            >
              {instructors.map((instructor: Instructor, index) => (
                <motion.div
                  key={index}
                  className={`relative group cursor-pointer transition-all duration-500 ${
                    index === activeInstructor ? 'scale-110' : 'scale-100 opacity-70'
                  }`}
                  whileHover={{ scale: 1.2, y: -10 }}
                  onClick={() => setActiveInstructor(index)}
                >
                  <motion.div
                    className="w-20 h-20 rounded-full overflow-hidden border-3 mx-auto"
                    style={{
                      borderColor: getInstructorColors(instructor.specialization).primary,
                      boxShadow: index === activeInstructor 
                        ? `0 0 30px ${getInstructorColors(instructor.specialization).primary}60`
                        : `0 0 15px ${getInstructorColors(instructor.specialization).primary}30`,
                    }}
                    animate={{
                      rotate: index === activeInstructor ? [0, 5, -5, 0] : 0,
                    }}
                    transition={{
                      duration: 2,
                      repeat: index === activeInstructor ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                  >
                    <img 
                      src={instructor.profile_image_url} 
                      alt={instructor.display_name}
                      className="object-cover w-full h-full"
                    />
                  </motion.div>
                  <motion.p 
                    className="text-center mt-2 text-sm font-bold"
                    style={{
                      color: index === activeInstructor 
                        ? getInstructorColors(instructor.specialization).primary
                        : '#ffffff80'
                    }}
                  >
                    {instructor.display_name.split(' ')[0]}
                  </motion.p>
                </motion.div>
              ))}
            </motion.div>
                </div>
                )}
            </div>
        </section>
    );
});

// Revolutionary Holographic Courses Showcase - MIND-BLOWING EDITION
const TopCoursesSection = React.memo(() => {
    const { data: courses, isLoading, isError } = useQuery({
        queryKey: ['topCourses'],
        queryFn: getTopCourses,
        initialData: [],
      });
  const navigate = useNavigate();
  const [activeCourse, setActiveCourse] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [hologramMode, setHologramMode] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const motionMouseX = useMotionValue(0.5);
  const motionMouseY = useMotionValue(0.5);

  const rotateY = useTransform(motionMouseX, [0, 1], [-7.5, 7.5]);
  const rotateX = useTransform(motionMouseY, [0, 1], [7.5, -7.5]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect();
      motionMouseX.set((e.clientX - rect.left) / rect.width);
      motionMouseY.set((e.clientY - rect.top) / rect.height);
    }
  };

  // Auto-rotate active course
  useEffect(() => {
    if (!isInteracting && courses.length > 0) {
      const interval = setInterval(() => {
        setActiveCourse((prev) => (prev + 1) % courses.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [courses.length, isInteracting]);

    if (isError) {
        return <div>Error fetching courses</div>;
    }

  const courseCategories = {
    'AI & Machine Learning': { primary: '#ff0080', secondary: '#cc0066', glow: '#ff88cc', icon: Brain },
    'Web Development': { primary: '#00ff88', secondary: '#00cc66', glow: '#88ffaa', icon: Globe },
    'Data Science': { primary: '#0080ff', secondary: '#0066cc', glow: '#88ccff', icon: TrendingUp },
    'Mobile Development': { primary: '#8000ff', secondary: '#6600cc', glow: '#cc88ff', icon: Video },
    'Cybersecurity': { primary: '#ff8000', secondary: '#cc6600', glow: '#ffaa88', icon: Shield },
    'DevOps': { primary: '#00ffff', secondary: '#00cccc', glow: '#88ffff', icon: Cpu },
    default: { primary: '#00ff88', secondary: '#00cc66', glow: '#88ffaa', icon: BookOpen }
  };

  const getCourseColors = (courseTitle: string) => {
    // Simple category detection based on course title
    if (courseTitle.toLowerCase().includes('ai') || courseTitle.toLowerCase().includes('machine learning')) {
      return courseCategories['AI & Machine Learning'];
    } else if (courseTitle.toLowerCase().includes('web') || courseTitle.toLowerCase().includes('react') || courseTitle.toLowerCase().includes('javascript')) {
      return courseCategories['Web Development'];
    } else if (courseTitle.toLowerCase().includes('data') || courseTitle.toLowerCase().includes('analytics')) {
      return courseCategories['Data Science'];
    } else if (courseTitle.toLowerCase().includes('mobile') || courseTitle.toLowerCase().includes('ios') || courseTitle.toLowerCase().includes('android')) {
      return courseCategories['Mobile Development'];
    } else if (courseTitle.toLowerCase().includes('security') || courseTitle.toLowerCase().includes('cyber')) {
      return courseCategories['Cybersecurity'];
    } else if (courseTitle.toLowerCase().includes('devops') || courseTitle.toLowerCase().includes('docker') || courseTitle.toLowerCase().includes('kubernetes')) {
      return courseCategories['DevOps'];
    }
    return courseCategories.default;
  };

    return (
    <section 
      ref={sectionRef}
      className="py-32 relative overflow-hidden bg-black"
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Holographic Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,136,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,136,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
          animate={{
            backgroundPosition: [
              '0px 0px, 0px 0px',
              '50px 50px, 50px 50px',
              '0px 0px, 0px 0px'
            ],
          }}
          transition={{
            duration: 20,
            repeatType: "loop",
            ease: "linear",
          }}
        />
      </div>

      {/* Dynamic Energy Field */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: courses.length > 0 
            ? `radial-gradient(circle at ${motionMouseX.get() * 100}% ${motionMouseY.get() * 100}%, ${getCourseColors(courses[activeCourse]?.title || '').primary}15, transparent 60%)`
            : 'radial-gradient(circle at 50% 50%, #00ff8815, transparent 60%)'
        }}
        transition={{ duration: 1 }}
      />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Revolutionary Title */}
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
          <motion.h2 className="text-5xl md:text-7xl lg:text-9xl font-black mb-8 h-48 md:h-64 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={activeCourse}
                initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                transition={{ duration: 1 }}
                className="bg-clip-text"
                style={{
                  backgroundImage: courses.length > 0 
                    ? `linear-gradient(45deg, #ffffff, ${getCourseColors(courses[activeCourse]?.title || '').primary}, #ffffff)`
                    : 'linear-gradient(45deg, #ffffff, #00ff88, #ffffff)',
                  WebkitTextFillColor: "transparent",
                }}
              >
                QUANTUM
                        <br />
                <span 
                  className="bg-clip-text"
                  style={{
                    backgroundImage: courses.length > 0
                      ? `linear-gradient(45deg, ${getCourseColors(courses[activeCourse]?.title || '').primary}, ${getCourseColors(courses[activeCourse]?.title || '').secondary}, ${getCourseColors(courses[activeCourse]?.title || '').primary})`
                      : 'linear-gradient(45deg, #00ff88, #00cc66, #00ff88)',
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  MASTERY
                        </span>
              </motion.span>
            </AnimatePresence>
          </motion.h2>
          <motion.p 
            className="text-2xl text-white/70 max-w-4xl mx-auto mb-8"
            animate={{
              color: courses.length > 0 
                ? getCourseColors(courses[activeCourse]?.title || '').primary + '70'
                : '#ffffff70'
            }}
            transition={{ duration: 1 }}
          >
            Transcendent knowledge experiences that reshape reality
          </motion.p>
          
          {/* Hologram Mode Toggle */}
          <motion.button
            onClick={() => setHologramMode(!hologramMode)}
            className="px-8 py-3 rounded-full font-bold text-lg border-2 transition-all duration-300"
            style={{
              borderColor: courses.length > 0 ? getCourseColors(courses[activeCourse]?.title || '').primary : '#00ff88',
              color: courses.length > 0 ? getCourseColors(courses[activeCourse]?.title || '').primary : '#00ff88',
              backgroundColor: hologramMode ? (courses.length > 0 ? getCourseColors(courses[activeCourse]?.title || '').primary + '20' : '#00ff8820') : 'transparent',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Eye className="inline mr-2 h-5 w-5" />
            {hologramMode ? 'HOLOGRAM ACTIVE' : 'ACTIVATE HOLOGRAM'}
          </motion.button>
                </motion.div>

                {isLoading ? <TopCoursesSkeleton /> : (
          <div className="relative">
            {/* Main Course Holographic Display */}
            {courses.length > 0 && (
                        <motion.div
                className="mb-20"
                key={activeCourse}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2 }}
              >
                <div className="flex flex-col lg:flex-row items-center justify-center gap-16">
                  {/* 3D Course Visualization */}
                  <motion.div 
                    className="relative group perspective-1000"
                    style={{
                      rotateY,
                      rotateX,
                    }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  >


                    {/* Course Preview Container */}
                    <motion.div
                      className="relative w-96 h-96 rounded-3xl overflow-hidden shadow-2xl"
                      style={{
                        background: `linear-gradient(135deg, ${getCourseColors(courses[activeCourse].title).primary}20, ${getCourseColors(courses[activeCourse].title).secondary}20)`,
                        border: `3px solid ${getCourseColors(courses[activeCourse].title).primary}60`,
                        boxShadow: `0 0 100px ${getCourseColors(courses[activeCourse].title).primary}40`,
                      }}
                      whileHover={{ 
                        scale: 1.05,
                        rotateZ: 2,
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      {/* Course Cover Image */}
                      <motion.div
                        className="absolute inset-0"
                        animate={{
                          filter: hologramMode 
                            ? `hue-rotate(${Math.sin(Date.now() * 0.002) * 60}deg) saturate(1.5) contrast(1.2)`
                            : 'none',
                        }}
                      >
                        {courses[activeCourse].cover_image_url && (
                          <img 
                            src={courses[activeCourse].cover_image_url} 
                            alt={courses[activeCourse].title}
                            className="object-cover w-full h-full opacity-70"
                          />
                        )}
                        <div 
                          className="absolute inset-0 opacity-30"
                          style={{
                            background: `radial-gradient(circle, transparent 30%, ${getCourseColors(courses[activeCourse].title).primary}60)`,
                          }}
                        />
                      </motion.div>

                      {/* Holographic Overlay Effects */}
                      {hologramMode && (
                        <>
                          <motion.div
                            className="absolute inset-0 opacity-20"
                            style={{
                              background: `repeating-linear-gradient(
                                0deg,
                                transparent,
                                transparent 2px,
                                ${getCourseColors(courses[activeCourse].title).primary} 2px,
                                ${getCourseColors(courses[activeCourse].title).primary} 4px
                              )`,
                            }}
                            animate={{
                              backgroundPosition: ['0px 0px', '0px 20px'],
                            }}
                            transition={{
                              duration: 2,
                              repeatType: "loop",
                              ease: "linear",
                            }}
                          />
                          <motion.div
                            className="absolute inset-0 opacity-10"
                            style={{
                              background: `radial-gradient(circle at ${motionMouseX.get() * 100}% ${motionMouseY.get() * 100}%, ${getCourseColors(courses[activeCourse].title).glow}, transparent 50%)`,
                            }}
                          />
                        </>
                      )}

                      {/* Course Icon */}
                      <motion.div
                        className="absolute top-6 right-6 w-16 h-16 rounded-full flex items-center justify-center"
                        style={{
                          background: `linear-gradient(45deg, ${getCourseColors(courses[activeCourse].title).primary}, ${getCourseColors(courses[activeCourse].title).secondary})`,
                          boxShadow: `0 0 30px ${getCourseColors(courses[activeCourse].title).primary}60`,
                        }}
                        animate={{
                          rotate: [0, 360],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          rotate: { duration: 10, repeatType: "loop", ease: "linear" },
                          scale: { duration: 3, repeatType: "loop", ease: "easeInOut" },
                        }}
                      >
                        {React.createElement(getCourseColors(courses[activeCourse].title).icon, { className: "h-8 w-8 text-black" })}
                      </motion.div>
                    </motion.div>
                  </motion.div>

                  {/* Course Information Panel */}
                  <motion.div
                    className="flex-1 max-w-2xl text-center lg:text-left"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.3 }}
                  >
                    <motion.h3 
                      className="text-4xl md:text-6xl font-black mb-6"
                      style={{
                        color: getCourseColors(courses[activeCourse].title).primary,
                      }}
                      animate={{
                        textShadow: `0 0 40px ${getCourseColors(courses[activeCourse].title).primary}60`,
                      }}
                    >
                      {courses[activeCourse].title}
                    </motion.h3>
                    
                    <motion.div
                      className="flex items-center justify-center lg:justify-start gap-3 mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <motion.div
                        className="w-12 h-12 rounded-full overflow-hidden border-2"
                        style={{ borderColor: getCourseColors(courses[activeCourse].title).primary }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <div 
                          className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
                          style={{ background: `linear-gradient(45deg, ${getCourseColors(courses[activeCourse].title).primary}, ${getCourseColors(courses[activeCourse].title).secondary})` }}
                        >
                          {courses[activeCourse].profiles.full_name.charAt(0)}
                        </div>
                      </motion.div>
                      <div>
                        <p className="text-white font-bold text-lg">{courses[activeCourse].profiles.full_name}</p>
                        {/* <p className="text-white/60 text-sm">Course Architect</p> */}
                      </div>
                    </motion.div>

                    <motion.p 
                      className="text-xl text-white/80 mb-8 leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      {courses[activeCourse].description || "A transformative journey into the depths of knowledge, designed to elevate your skills to extraordinary heights."}
                    </motion.p>

                    {/* Course Stats */}
                    <motion.div
                      className="flex flex-wrap justify-center lg:justify-start gap-6 mb-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                    >
                      {[
                        { icon: Star, label: "Rating", value: "4.9", color: "#ffd700" },
                        // { icon: Users, label: "Students", value: `${courses[activeCourse].enrollments[0]?.count || 0}`, color: getCourseColors(courses[activeCourse].title).primary },
                        { icon: Trophy, label: "Level", value: "Expert", color: getCourseColors(courses[activeCourse].title).secondary },
                      ].map((stat, i) => (
                        <motion.div
                          key={i}
                          className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm"
                          style={{
                            background: `${stat.color}20`,
                            border: `1px solid ${stat.color}40`,
                          }}
                          whileHover={{ 
                            scale: 1.05,
                            backgroundColor: `${stat.color}30`,
                          }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.05 }}
                        >
                          {React.createElement(stat.icon, { className: "h-5 w-5", style: { color: stat.color } })}
                          <div>
                            <div className="font-bold text-white text-lg">{stat.value}</div>
                            <div className="text-xs text-white/60">{stat.label}</div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Course Price & CTA */}
                    <motion.div
                      className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <motion.div
                        className="text-4xl font-black"
                        style={{ color: getCourseColors(courses[activeCourse].title).primary }}
                        animate={{
                          scale: [1, 1.05, 1],
                        }}
                        transition={{ duration: 2, repeatType: "loop", ease: "easeInOut" }}
                      >
                        {courses[activeCourse].price || 99} EGP
                      </motion.div>
                      <motion.button
                        className="px-8 py-4 rounded-full font-bold text-black text-lg"
                        style={{
                          background: `linear-gradient(45deg, ${getCourseColors(courses[activeCourse].title).primary}, ${getCourseColors(courses[activeCourse].title).secondary})`,
                        }}
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: `0 10px 40px ${getCourseColors(courses[activeCourse].title).primary}40`,
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          navigate(`/courses/${courses[activeCourse].id}`);
                        }}
                      >
                        <Rocket className="inline mr-2 h-5 w-5" />
                        MASTER NOW
                      </motion.button>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Course Navigation Orbs */}
            <motion.div
              className="flex justify-center gap-4 mb-16"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              viewport={{ once: true }}
            >
              {courses.map((course: Course, index) => (
                <motion.button
                            key={index}
                  className="w-8 h-8 rounded-full border-2 cursor-pointer transition-all duration-300"
                  style={{
                    backgroundColor: index === activeCourse 
                      ? getCourseColors(course.title).primary
                      : 'transparent',
                    borderColor: getCourseColors(course.title).primary,
                    boxShadow: index === activeCourse 
                      ? `0 0 30px ${getCourseColors(course.title).primary}60`
                      : 'none',
                  }}
                  whileHover={{ scale: 1.4 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActiveCourse(index)}
                />
              ))}
            </motion.div>

            {/* Course Grid Preview */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, staggerChildren: 0.05 }}
              viewport={{ once: true }}
            >
              {courses.map((course: Course, index) => (
                <motion.div
                  key={index}
                  className={`relative group cursor-pointer transition-all duration-500 ${
                    index === activeCourse ? 'scale-105 z-10' : 'scale-100 opacity-80'
                  }`}
                  whileHover={{ scale: 1.1, y: -10 }}
                  onClick={() => setActiveCourse(index)}
                >
                  <motion.div
                    className="relative w-full h-48 rounded-2xl overflow-hidden border-3 backdrop-blur-sm"
                    style={{
                      borderColor: getCourseColors(course.title).primary,
                      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.7) 100%), url(${course.cover_image_url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      boxShadow: index === activeCourse 
                        ? `0 0 40px ${getCourseColors(course.title).primary}60`
                        : `0 0 20px ${getCourseColors(course.title).primary}30`,
                    }}
                    animate={{
                      borderColor: index === activeCourse 
                        ? [getCourseColors(course.title).primary, getCourseColors(course.title).secondary, getCourseColors(course.title).primary]
                        : getCourseColors(course.title).primary,
                    }}
                    transition={{
                      duration: 2,
                      repeat: index === activeCourse ? Number.POSITIVE_INFINITY : 0,
                      ease: "easeInOut",
                    }}
                  >
                    {/* Course Mini Preview */}
                    <div className="absolute inset-0 flex flex-col justify-between p-4">
                                        <div className="flex justify-between items-start">
                        <motion.div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            background: `linear-gradient(45deg, ${getCourseColors(course.title).primary}, ${getCourseColors(course.title).secondary})`,
                          }}
                          animate={{
                            rotate: index === activeCourse ? [0, 360] : 0,
                          }}
                          transition={{
                            duration: 4,
                            repeat: index === activeCourse ? Number.POSITIVE_INFINITY : 0,
                            ease: "linear",
                          }}
                        >
                          {React.createElement(getCourseColors(course.title).icon, { className: "h-4 w-4 text-black" })}
                        </motion.div>
                        <div className="text-right">
                          <div className="text-white font-bold text-sm" >{course.price || 99} EGP</div>
                                            </div>
                                        </div>
                      <div>
                        <h4 
                          className="text-white font-bold text-sm mb-1 line-clamp-2"
                          style={{
                            color: index === activeCourse ? getCourseColors(course.title).primary : '#ffffff',
                          }}
                        >
                          {course.title}
                        </h4>
                        <p className="text-white/60 text-xs">{course.profiles.full_name}</p>
                                    </div>
                                        </div>

                    {/* Holographic Effect */}
                    {index === activeCourse && hologramMode && (
                      <motion.div
                        className="absolute inset-0 opacity-20"
                        style={{
                          background: `repeating-linear-gradient(
                            45deg,
                            transparent,
                            transparent 2px,
                            ${getCourseColors(course.title).primary} 2px,
                            ${getCourseColors(course.title).primary} 4px
                          )`,
                        }}
                        animate={{
                          backgroundPosition: ['0px 0px', '20px 20px'],
                        }}
                        transition={{
                          duration: 3,
                          repeatType: "loop",
                          ease: "linear",
                        }}
                      />
                    )}
                  </motion.div>
                  <motion.p 
                    className="text-center mt-2 text-xs font-bold"
                    style={{
                      color: index === activeCourse 
                        ? getCourseColors(course.title).primary
                        : '#ffffff60'
                    }}
                  >
                    {course.title.length > 30 ? course.title.substring(0, 30) + '...' : course.title}
                  </motion.p>
                        </motion.div>
                    ))}
            </motion.div>
                </div>
                )}
            </div>
        </section>
    );
});

// Final Revolutionary CTA - Ultra Modern Interactive Experience
const RevolutionaryCTA = React.memo(() => {
  const [isHovering, setIsHovering] = useState(false);
  const [energyLevel, setEnergyLevel] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-1, 1], [-8, 8]);
  const rotateY = useTransform(mouseX, [-1, 1], [8, -8]);

  const phases = [
    {
      title: "TRANSCEND",
      subtitle: "REALITY",
      color: "#00ff88",
      description: "Break through the boundaries of traditional learning",
      power: "UNLIMITED POTENTIAL"
    },
    {
      title: "EVOLVE",
      subtitle: "CONSCIOUSNESS", 
      color: "#ff0080",
      description: "Upgrade your mind to superhuman capabilities",
      power: "INFINITE GROWTH"
    },
    {
      title: "DOMINATE",
      subtitle: "KNOWLEDGE",
      color: "#00ffff", 
      description: "Master any skill in record-breaking time",
      power: "INSTANT MASTERY"
    },
    {
      title: "ASCEND",
      subtitle: "BEYOND",
      color: "#ffaa00",
      description: "Join the elite who've unlocked their true potential", 
      power: "GODMODE ACTIVATED"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhase((prev) => (prev + 1) % phases.length);
      setEnergyLevel((prev) => (prev + 25) % 100);
    }, 3000);
    return () => clearInterval(interval);
  }, [phases.length]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
    mouseY.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
  };

  const currentPhaseData = phases[currentPhase];

  return (
    <section 
      className="py-32 relative overflow-hidden bg-black min-h-screen flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Dynamic Energy Field Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at ${50 + mouseX.get() * 20}% ${50 + mouseY.get() * 20}%, ${currentPhaseData.color}40 0%, transparent 70%)`,
          }}
          animate={{
            scale: isHovering ? 1.2 : 1,
            opacity: isHovering ? 0.4 : 0.2,
          }}
          transition={{ duration: 0.8 }}
        />
      </div>

      {/* Neural Network Grid */}
      <motion.div
        className="absolute inset-0 opacity-10"
        animate={{
          backgroundPosition: [
            '0px 0px, 0px 0px',
            '60px 60px, 60px 60px',
            '0px 0px, 0px 0px'
          ],
        }}
        transition={{
          duration: 20,
          repeatType: "loop",
          ease: "linear",
        }}
        style={{
          backgroundImage: `
            linear-gradient(${currentPhaseData.color}20 1px, transparent 1px),
            linear-gradient(90deg, ${currentPhaseData.color}20 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Main Holographic Display */}
          <motion.div
            className="relative"
            style={{
              transform: `perspective(1200px)`,
              rotateX,
              rotateY,
            }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          >
            {/* Central Energy Core */}
            <motion.div
              className="relative w-80 h-80 md:w-96 md:h-96 mx-auto mb-12"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 25,
                repeatType: "loop",
                ease: "linear",
              }}
            >
              {/* Outer Energy Rings */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 opacity-30"
                  style={{
                    borderColor: currentPhaseData.color,
                    transform: `scale(${1 + i * 0.15})`,
                  }}
                  animate={{
                    rotate: [0, i % 2 === 0 ? 360 : -360],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    rotate: {
                      duration: 15 + i * 3,
                      repeatType: "loop",
                      ease: "linear",
                    },
                    opacity: {
                      duration: 3,
                      repeatType: "loop",
                      delay: i * 0.5,
                    },
                  }}
                />
              ))}

              {/* Central Power Core */}
              <motion.div
                className="absolute inset-8 rounded-full flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle, ${currentPhaseData.color}40 0%, ${currentPhaseData.color}10 50%, transparent 100%)`,
                  border: `3px solid ${currentPhaseData.color}`,
                }}
                animate={{
                  boxShadow: [
                    `0 0 50px ${currentPhaseData.color}60`,
                    `0 0 100px ${currentPhaseData.color}80, 0 0 150px ${currentPhaseData.color}40`,
                    `0 0 50px ${currentPhaseData.color}60`,
                  ],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeatType: "loop",
                }}
              >
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    rotate: { duration: 10, repeatType: "loop", ease: "linear" },
                    scale: { duration: 4, repeatType: "loop" },
                  }}
                >
                  <Infinity className="h-24 w-24 md:h-32 md:w-32 text-white" />
                </motion.div>
              </motion.div>

              {/* Energy Pulses */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: currentPhaseData.color }}
                animate={{
                  scale: [1, 2, 1],
                  opacity: [0, 0.3, 0],
                }}
                transition={{
                  duration: 3,
                  repeatType: "loop",
                }}
              />
            </motion.div>

            {/* Dynamic Text Display */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhase}
                initial={{ opacity: 0, y: 100, rotateX: 90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -100, rotateX: -90 }}
                transition={{ duration: 1, ease: "backOut" }}
                className="text-center space-y-8"
              >
                {/* Phase Title */}
                <div className="space-y-2">
                  <motion.h2 
                    className="text-6xl md:text-8xl lg:text-9xl font-black leading-none"
                    style={{
                      background: `linear-gradient(45deg, ${currentPhaseData.color}, #ffffff, ${currentPhaseData.color})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundSize: "200% 200%",
                    }}
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 3,
                      repeatType: "loop",
                    }}
                  >
                    {currentPhaseData.title}
                  </motion.h2>
                  <motion.h3 
                    className="text-4xl md:text-6xl font-black"
                    style={{ color: currentPhaseData.color }}
                    animate={{
                      textShadow: [
                        `0 0 20px ${currentPhaseData.color}60`,
                        `0 0 40px ${currentPhaseData.color}80`,
                        `0 0 20px ${currentPhaseData.color}60`,
                      ],
                    }}
                    transition={{ duration: 2, repeatType: "loop" }}
                  >
                    {currentPhaseData.subtitle}
                  </motion.h3>
                </div>

                {/* Description */}
                <motion.p
                  className="text-xl md:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed"
                  animate={{
                    color: [`rgba(255,255,255,0.8)`, `${currentPhaseData.color}`, `rgba(255,255,255,0.8)`],
                  }}
                  transition={{ duration: 4, repeatType: "loop" }}
                >
                  {currentPhaseData.description}
                </motion.p>

                {/* Power Level Display */}
                <motion.div
                  className="inline-block px-8 py-4 rounded-full font-black text-2xl text-black"
                  style={{ backgroundColor: currentPhaseData.color }}
                  animate={{
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      `0 0 30px ${currentPhaseData.color}60`,
                      `0 0 60px ${currentPhaseData.color}80`,
                      `0 0 30px ${currentPhaseData.color}60`,
                    ],
                  }}
                  transition={{ duration: 2, repeatType: "loop" }}
                >
                  {currentPhaseData.power}
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Interactive CTA Button */}
            <motion.div
              className="mt-16 flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 1 }}
              viewport={{ once: true }}
            >
              <Link to="/auth/signup">
                <motion.div
                  className="group relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onHoverStart={() => setIsHovering(true)}
                  onHoverEnd={() => setIsHovering(false)}
                >
                  {/* Energy Aura */}
                  <motion.div
                    className="absolute -inset-4 rounded-full opacity-60"
                    style={{ backgroundColor: currentPhaseData.color }}
                    animate={{
                      scale: isHovering ? [1, 1.5, 1] : [1, 1.2, 1],
                      opacity: isHovering ? [0.6, 0.9, 0.6] : [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 2, repeatType: "loop" }}
                  />
                  
                  {/* Main Button */}
                  <Button 
                    className="relative px-16 py-8 text-2xl md:text-3xl font-black rounded-full text-black transition-all duration-500"
                    style={{
                      background: `linear-gradient(45deg, ${currentPhaseData.color}, #ffffff, ${currentPhaseData.color})`,
                      backgroundSize: "300% 300%",
                      border: `3px solid ${currentPhaseData.color}`,
                    }}
                  >
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 8,
                        repeatType: "loop",
                        ease: "linear",
                      }}
                    >
                      <Rocket className="mr-4 h-8 w-8" />
                    </motion.div>
                    UNLEASH POTENTIAL
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        duration: 3,
                        repeatType: "loop",
                      }}
                    >
                      <Crown className="ml-4 h-8 w-8" />
                    </motion.div>
                  </Button>

                  {/* Hover Effect Particles */}
                  {isHovering && (
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(20)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: currentPhaseData.color,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                          }}
                          animate={{
                            x: [0, (Math.random() - 0.5) * 200],
                            y: [0, (Math.random() - 0.5) * 200],
                            opacity: [1, 0],
                            scale: [0, 1.5, 0],
                          }}
                          transition={{
                            duration: 1.5,
                            ease: "easeOut",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              </Link>
            </motion.div>

            {/* Phase Indicators */}
            <div className="flex justify-center gap-4 mt-12">
              {phases.map((phase, index) => (
                <motion.div
                  key={index}
                  className="w-4 h-4 rounded-full border-2 cursor-pointer"
                  style={{
                    borderColor: currentPhase === index ? phase.color : 'rgba(255,255,255,0.3)',
                    backgroundColor: currentPhase === index ? phase.color : 'transparent',
                  }}
                  animate={{
                    scale: currentPhase === index ? [1, 1.3, 1] : 1,
                  }}
                  transition={{ duration: 2, repeatType: "loop" }}
                  onClick={() => setCurrentPhase(index)}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Energy Level Indicator */}
      <motion.div
        className="absolute bottom-8 right-8 text-right"
        initial={{ opacity: 0, x: 100 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5 }}
        viewport={{ once: true }}
      >
        <div className="text-sm font-mono text-white/60 mb-2">ENERGY LEVEL</div>
        <motion.div
          className="text-4xl font-black"
          style={{ color: currentPhaseData.color }}
          animate={{ 
            textShadow: [
              `0 0 10px ${currentPhaseData.color}60`,
              `0 0 20px ${currentPhaseData.color}80`,
              `0 0 10px ${currentPhaseData.color}60`,
            ]
          }}
          transition={{ duration: 2, repeatType: "loop" }}
        >
          {energyLevel}%
        </motion.div>
        <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden mt-2">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: currentPhaseData.color }}
            animate={{ width: `${energyLevel}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>
    </section>
  );
});

// Main Ultra Modern Landing Component
const UltraModernLanding = () => {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden ultra-modern-landing">


      {/* Premium Mouse Lighting Effect */}
      <PremiumMouseLightingEffect />
      
      {/* Show ModernLayoutHero on large screens and up, RevolutionaryHero on smaller screens */}
      <div className="hidden lg:block" data-hero-section>
        <ModernLayoutHero />
      </div>
      <div className="block lg:hidden" data-hero-section>
        <HeroSection />
        {/* <RevolutionaryHero /> */}
      </div>
      <AIFeaturesShowcase />

      <FeaturedInstructors />
      <TopCoursesSection />
      <RevolutionaryCTA />
    </div>
  );
};

export default UltraModernLanding;
