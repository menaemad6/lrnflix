
import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useInView as useInViewHook } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Play,
  Gamepad2,
  Video,
  Bot,
  ChevronRight,
  TrendingUp,
  GraduationCap,
  Lightbulb,
  Clock,
  CheckCircle2,
  Flame,
  Crown,
  Infinity,
  Eye,
  Volume2,
  VolumeX,
  Layers,
  Cpu,
  Atom,
  Zap as ZapIcon,
  type LucideIcon
} from 'lucide-react';

// Floating particle system
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-100, 100, -100],
            x: [-50, 50, -50],
            scale: [0.5, 1.5, 0.5],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 8 + Math.random() * 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 4,
          }}
        >
          <div className={`w-1 h-1 bg-gradient-to-r from-emerald-400/40 to-cyan-400/40 rounded-full blur-sm`} />
        </motion.div>
      ))}
    </div>
  );
};

// Cinematic Hero Section
const CinematicHero = () => {
  const { scrollY } = useScroll();
  const [soundEnabled, setSoundEnabled] = useState(false);
  const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -300]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 0.8]);

  return (
    <motion.section 
      style={{ opacity, scale }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-slate-900 to-black"
    >
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_70%)]" />
      
      {/* Floating Particles */}
      <FloatingParticles />
      
      {/* Sound Toggle */}
      <motion.button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="absolute top-8 right-8 z-50 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {soundEnabled ? (
          <Volume2 className="h-5 w-5 text-white" />
        ) : (
          <VolumeX className="h-5 w-5 text-white" />
        )}
      </motion.button>

      {/* Main Hero Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Kinetic Typography */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="mb-8"
        >
          <motion.h1
            className="text-7xl md:text-9xl lg:text-[12rem] font-black mb-8 tracking-tighter leading-none"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            <motion.span
              animate={{ 
                backgroundPosition: ['0%', '100%'],
                textShadow: ['0 0 20px rgba(16,185,129,0.5)', '0 0 40px rgba(16,185,129,0.8)', '0 0 20px rgba(16,185,129,0.5)']
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="bg-gradient-to-r from-white via-emerald-400 to-cyan-400 bg-clip-text text-transparent bg-[length:200%_100%]"
            >
              THE
            </motion.span>
            <br />
            <motion.span
              animate={{ 
                scale: [1, 1.05, 1],
                filter: ['blur(0px)', 'blur(1px)', 'blur(0px)']
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-white"
            >
              FUTURE
            </motion.span>
            <br />
            <motion.span
              animate={{ 
                rotateX: [0, 5, 0],
                rotateY: [0, 2, 0]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
            >
              LEARNS
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1.5 }}
            className="text-2xl md:text-3xl text-white/80 max-w-4xl mx-auto mb-16 font-light tracking-wide"
          >
            Step into an AI-powered dimension where learning transcends limits and 
            <span className="text-emerald-400 font-medium"> transforms lives globally</span>
          </motion.p>
        </motion.div>

        {/* Magnetic CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="relative group"
        >
          <Link to="/auth/signup">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative inline-block"
            >
              {/* Glowing background */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              
              <Button 
                size="lg" 
                className="relative bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold px-16 py-8 text-xl rounded-full border-2 border-white/20 hover:border-white/40 transition-all duration-300 shadow-2xl"
              >
                <span className="relative z-10">Enter The Future</span>
                <motion.div
                  animate={{ rotate: [0, 180, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="ml-4"
                >
                  <Atom className="h-6 w-6" />
                </motion.div>
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Floating Course Preview Cards */}
        <motion.div style={{ y: y1 }} className="absolute top-20 left-10 opacity-70">
          <Card className="backdrop-blur-lg bg-white/10 border-white/20 w-72 p-6 shadow-2xl">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">Neural Networks</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-white/80">4.9 • 2.3k minds</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div style={{ y: y2 }} className="absolute top-60 right-10 opacity-70">
          <Card className="backdrop-blur-lg bg-white/10 border-white/20 w-72 p-6 shadow-2xl">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">Quantum Computing</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-white/80">4.8 • 1.8k pioneers</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.section>
  );
};

// Immersive Feature Timeline
const FeatureTimeline = () => {
  const features = [
    {
      icon: Bot,
      title: "AI Neural Assistant",
      description: "Your personal learning companion that adapts to your mind and accelerates your growth exponentially.",
      gradient: "from-blue-500 via-purple-500 to-pink-500",
      bgColor: "from-blue-500/10 to-purple-500/10"
    },
    {
      icon: Gamepad2,
      title: "Hyper-Gamified Universe",
      description: "Enter learning dimensions where every challenge unlocks new abilities and achievements.",
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      bgColor: "from-emerald-500/10 to-teal-500/10"
    },
    {
      icon: Eye,
      title: "Immersive Reality Learning",
      description: "Experience knowledge through cinematic visuals and interactive 3D environments.",
      gradient: "from-purple-500 via-pink-500 to-red-500",
      bgColor: "from-purple-500/10 to-pink-500/10"
    },
    {
      icon: Award,
      title: "Quantum Certificates",
      description: "Blockchain-verified achievements that prove your mastery to the world.",
      gradient: "from-orange-500 via-red-500 to-pink-500",
      bgColor: "from-orange-500/10 to-red-500/10"
    }
  ];

  return (
    <section className="py-32 bg-gradient-to-b from-black via-slate-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)]" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
          className="text-center mb-32"
        >
          <h2 className="text-6xl md:text-8xl font-black mb-8 text-white tracking-tighter">
            TRANSCEND
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              REALITY
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto font-light">
            Experience learning technologies that reshape how humans acquire knowledge
          </p>
        </motion.div>

        <div className="space-y-40">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -200 : 200 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`flex ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} items-center gap-20`}
              >
                {/* Feature Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotateY: 15 }}
                  className={`w-80 h-80 rounded-3xl bg-gradient-to-br ${feature.bgColor} backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl`}
                >
                  <div className={`w-32 h-32 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center shadow-2xl`}>
                    <IconComponent className="h-16 w-16 text-white" />
                  </div>
                </motion.div>

                {/* Feature Content */}
                <div className="flex-1 text-white">
                  <motion.h3
                    className="text-5xl md:text-6xl font-bold mb-8 tracking-tight"
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 50 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    {feature.title}
                  </motion.h3>
                  <motion.p
                    className="text-xl md:text-2xl text-white/80 leading-relaxed font-light mb-8"
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 50 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    viewport={{ once: true }}
                  >
                    {feature.description}
                  </motion.p>
                  <motion.div
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 50 }}
                    transition={{ duration: 1, delay: 0.7 }}
                    viewport={{ once: true }}
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 px-8 py-4 text-lg rounded-full backdrop-blur-sm"
                    >
                      Experience Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Cinematic Teachers Showcase
const TeachersShowcase = () => {
  const teachers = [
    {
      name: "Dr. Aria Chen",
      subject: "Quantum AI",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400",
      rating: 4.9,
      students: "25.3k",
      quote: "Building the neural future",
      specialty: "Quantum Computing"
    },
    {
      name: "Prof. Marcus Webb",
      subject: "Neural Networks",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
      rating: 4.8,
      students: "31.2k",
      quote: "Code is the new language",
      specialty: "Machine Learning"
    },
    {
      name: "Dr. Luna Rodriguez",
      subject: "Bio-Computing",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      rating: 4.9,
      students: "28.7k",
      quote: "Data becomes wisdom",
      specialty: "Biotechnology"
    },
    {
      name: "Prof. David Nova",
      subject: "Holographic UX",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
      rating: 4.7,
      students: "19.8k",
      quote: "Design shapes reality",
      specialty: "Extended Reality"
    }
  ];

  return (
    <section className="py-32 bg-gradient-to-b from-black via-slate-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)]" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-6xl md:text-8xl font-black mb-8 text-white tracking-tighter">
            MINDS BEHIND THE
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              MOVEMENT
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto font-light">
            Visionary educators reshaping the future of human knowledge
          </p>
        </motion.div>

        <div className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide">
          {teachers.map((teacher, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -20 }}
              className="flex-shrink-0 w-96 group cursor-pointer"
            >
              <Card className="backdrop-blur-xl bg-white/5 border-white/10 p-8 h-full shadow-2xl group-hover:shadow-emerald-500/20 transition-all duration-500">
                <div className="relative mb-8">
                  <div className="relative">
                    <img
                      src={teacher.avatar}
                      alt={teacher.name}
                      className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-emerald-500/30 shadow-2xl"
                    />
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                      <Crown className="inline h-3 w-3 mr-1" />
                      Visionary
                    </div>
                  </div>
                  
                  {/* Holographic effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2 text-white">{teacher.name}</h3>
                  <p className="text-emerald-400 font-semibold mb-2">{teacher.subject}</p>
                  <p className="text-white/60 text-sm mb-4">{teacher.specialty}</p>
                  
                  <div className="flex items-center justify-center space-x-6 mb-6">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="ml-1 font-semibold text-white">{teacher.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-emerald-400" />
                      <span className="ml-1 text-white">{teacher.students}</span>
                    </div>
                  </div>
                  
                  <blockquote className="text-white/80 italic text-lg font-light">
                    "{teacher.quote}"
                  </blockquote>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Live Learning Arena
const LiveLearningArena = () => {
  const [activeCategory, setActiveCategory] = useState('Neural');
  const categories = ['Neural', 'Quantum', 'Bio-Tech', 'Holographic', 'Cosmic'];

  const liveCourses = {
    'Neural': [
      { 
        title: "Neural Network Architecture", 
        instructor: "Dr. Aria Chen",
        viewers: "1.2k", 
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400",
        status: "live"
      },
      { 
        title: "Deep Learning Fundamentals", 
        instructor: "Prof. Marcus Webb",
        viewers: "890", 
        image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400",
        status: "starting"
      }
    ],
    'Quantum': [
      { 
        title: "Quantum Computing Basics", 
        instructor: "Dr. Luna Rodriguez",
        viewers: "2.3k", 
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400",
        status: "live"
      },
      { 
        title: "Quantum Algorithm Design", 
        instructor: "Prof. David Nova",
        viewers: "1.5k", 
        image: "https://images.unsplash.com/photo-1518085250887-2f903c200fee?w=400",
        status: "live"
      }
    ],
    'Bio-Tech': [
      { 
        title: "Bioengineering Principles", 
        instructor: "Dr. Sarah Kim",
        viewers: "945", 
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400",
        status: "live"
      },
      { 
        title: "Genetic Algorithm Design", 
        instructor: "Prof. Alex Chen",
        viewers: "1.1k", 
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400",
        status: "starting"
      }
    ],
    'Holographic': [
      { 
        title: "Extended Reality Design", 
        instructor: "Dr. Maya Singh",
        viewers: "1.8k", 
        image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=400",
        status: "live"
      },
      { 
        title: "Immersive UI Patterns", 
        instructor: "Prof. James Liu",
        viewers: "1.3k", 
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
        status: "live"
      }
    ],
    'Cosmic': [
      { 
        title: "Astrophysics & AI", 
        instructor: "Dr. Elena Vasquez",
        viewers: "2.1k", 
        image: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400",
        status: "live"
      },
      { 
        title: "Space Technology", 
        instructor: "Prof. Michael Ross",
        viewers: "1.7k", 
        image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400",
        status: "starting"
      }
    ]
  };

  return (
    <section className="py-32 bg-gradient-to-b from-black via-slate-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)]" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-6xl md:text-8xl font-black mb-8 text-white tracking-tighter">
            LIVE LEARNING
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              ARENA
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto font-light mb-12">
            Join thousands learning in real-time across multiple dimensions
          </p>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setActiveCategory(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-4 rounded-full font-bold transition-all duration-300 text-lg ${
                  activeCategory === category
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black shadow-2xl'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-sm'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Live Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex items-center justify-center mb-16"
        >
          <div className="flex items-center bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/50 rounded-full px-8 py-4 backdrop-blur-sm">
            <motion.div
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-4 h-4 bg-red-500 rounded-full mr-4"
            />
            <span className="text-red-400 font-bold text-lg">3,247 minds learning right now</span>
          </div>
        </motion.div>

        {/* Course Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {liveCourses[activeCategory as keyof typeof liveCourses].map((course, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                whileHover={{ scale: 1.03, y: -10 }}
                className="group cursor-pointer"
              >
                <Card className="backdrop-blur-xl bg-white/5 border-white/10 overflow-hidden shadow-2xl group-hover:shadow-emerald-500/20 transition-all duration-500">
                  <div className="relative">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge className={`${
                        course.status === 'live' 
                          ? 'bg-red-500/90 text-white' 
                          : 'bg-emerald-500/90 text-black'
                      } border-none font-bold`}>
                        {course.status === 'live' ? (
                          <>
                            <Flame className="mr-1 h-3 w-3" />
                            LIVE
                          </>
                        ) : (
                          <>
                            <Clock className="mr-1 h-3 w-3" />
                            STARTING
                          </>
                        )}
                      </Badge>
                    </div>

                    {/* Viewer Count */}
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                      <Eye className="h-4 w-4 text-white mr-1" />
                      <span className="text-white text-sm font-medium">{course.viewers}</span>
                    </div>

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                      >
                        <Play className="h-10 w-10 text-white ml-1" />
                      </motion.div>
                    </div>
                  </div>

                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-emerald-400 transition-colors duration-300">
                      {course.title}
                    </h3>
                    <p className="text-white/60 mb-4">by {course.instructor}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-emerald-400 mr-1" />
                          <span className="text-white">{course.viewers}</span>
                        </div>
                      </div>
                      
                      <motion.div
                        className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        whileHover={{ x: 5 }}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

// Interactive LMS Experience Demo
const InteractiveLMSDemo = () => {
  const [activeView, setActiveView] = useState('dashboard');

  const demoViews = [
    { id: 'dashboard', label: 'Neural Dashboard', icon: Target },
    { id: 'courses', label: 'Course Universe', icon: BookOpen },
    { id: 'ai', label: 'AI Companion', icon: Bot },
    { id: 'progress', label: 'Progress Analytics', icon: TrendingUp }
  ];

  return (
    <section className="py-32 bg-gradient-to-b from-black via-slate-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)]" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-6xl md:text-8xl font-black mb-8 text-white tracking-tighter">
            EXPERIENCE THE
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              PLATFORM
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto font-light">
            Step inside the most advanced learning environment ever created
          </p>
        </motion.div>

        {/* Demo Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {demoViews.map((view) => (
            <motion.button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center px-8 py-4 rounded-full font-bold transition-all duration-300 text-lg ${
                activeView === view.id
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black shadow-2xl'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-sm'
              }`}
            >
              <view.icon className="h-5 w-5 mr-3" />
              <span>{view.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Demo Interface */}
        <motion.div
          key={activeView}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto"
        >
          <Card className="backdrop-blur-xl bg-white/5 border-white/10 p-8 shadow-2xl">
            <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-3xl p-12 min-h-[600px] flex items-center justify-center relative overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 rounded-3xl" />
              
              <div className="text-center relative z-10">
                <div className="w-40 h-40 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-12 text-white shadow-2xl">
                  {React.createElement(demoViews.find(view => view.id === activeView)!.icon, { className: "h-20 w-20" })}
                </div>
                
                <h3 className="text-4xl font-bold mb-6 text-white">
                  {demoViews.find(view => view.id === activeView)?.label}
                </h3>
                
                <p className="text-white/70 text-xl mb-12 max-w-2xl mx-auto font-light">
                  Interactive demonstration of our revolutionary learning interface designed for the future.
                </p>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold px-12 py-6 text-xl rounded-full shadow-2xl"
                  >
                    <Play className="mr-3 h-6 w-6" />
                    Launch Full Demo
                  </Button>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

// Global Impact Counter
const GlobalImpactCounter = () => {
  const [ref, inView] = useInViewHook({ triggerOnce: true });
  const [counters, setCounters] = useState({ 
    learners: 0, 
    courses: 0, 
    certificates: 0, 
    countries: 0 
  });

  useEffect(() => {
    if (inView) {
      const targets = { 
        learners: 157000, 
        courses: 8500, 
        certificates: 342000, 
        countries: 147 
      };
      const duration = 3000;
      const steps = 100;
      const stepDuration = duration / steps;

      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        
        setCounters({
          learners: Math.floor(targets.learners * progress),
          courses: Math.floor(targets.courses * progress),
          certificates: Math.floor(targets.certificates * progress),
          countries: Math.floor(targets.countries * progress)
        });

        if (step >= steps) {
          clearInterval(timer);
          setCounters(targets);
        }
      }, stepDuration);

      return () => clearInterval(timer);
    }
  }, [inView]);

  const stats = [
    { label: "Neural Minds", value: counters.learners, suffix: "+", icon: Brain },
    { label: "Reality Courses", value: counters.courses, suffix: "+", icon: Layers },
    { label: "Quantum Certificates", value: counters.certificates, suffix: "+", icon: Award },
    { label: "Global Dimensions", value: counters.countries, suffix: "+", icon: Globe }
  ];

  return (
    <section ref={ref} className="py-32 bg-gradient-to-b from-black via-slate-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_70%)]" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-6xl md:text-8xl font-black mb-8 text-white tracking-tighter">
            TRANSFORMING
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              HUMANITY
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto font-light">
            Real impact across infinite dimensions of learning
          </p>
        </motion.div>

        {/* Impact Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <Card className="backdrop-blur-xl bg-white/5 border-white/10 p-8 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500">
                  <div className="text-emerald-400 mb-6 flex justify-center">
                    <IconComponent className="h-12 w-12" />
                  </div>
                  <div className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    {stat.value.toLocaleString()}{stat.suffix}
                  </div>
                  <div className="text-white/70 font-medium text-lg">{stat.label}</div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Global Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="backdrop-blur-xl bg-white/5 border-white/10 p-8 max-w-5xl mx-auto shadow-2xl">
            <div className="relative rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800"
                alt="Global learning network"
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-8 left-8 right-8 text-center">
                <h3 className="text-white text-3xl font-bold mb-4">
                  Every Second, Minds Expand Across The Universe
                </h3>
                <p className="text-white/80 text-xl">
                  Join the infinite network of human consciousness evolution
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

// Final Cosmic CTA
const FinalCosmicCTA = () => {
  return (
    <section className="py-32 bg-gradient-to-b from-black via-slate-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_70%)]" />
      <FloatingParticles />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Cosmic Icon */}
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity }
            }}
            className="inline-flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 mb-16 shadow-2xl mx-auto"
          >
            <Infinity className="h-20 w-20 text-black" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            viewport={{ once: true }}
            className="text-7xl md:text-9xl font-black mb-8 text-white tracking-tighter"
          >
            THE UNIVERSE
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              IS LEARNING
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl text-white/80 max-w-4xl mx-auto mb-16 font-light"
          >
            Join 157,000+ consciousness pioneers building the future of human knowledge
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 1 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-8 justify-center items-center"
          >
            <Link to="/auth/signup">
              <motion.div
                whileHover={{ scale: 1.1, y: -10 }}
                whileTap={{ scale: 0.95 }}
                className="group relative"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                <Button 
                  size="lg" 
                  className="relative bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold px-20 py-10 text-2xl rounded-full shadow-2xl border-4 border-white/20 hover:border-white/40 transition-all duration-300"
                >
                  <span className="relative z-10">TRANSCEND NOW</span>
                  <motion.div
                    animate={{ 
                      rotate: [0, 180, 360],
                      scale: [1, 1.3, 1]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="ml-6"
                  >
                    <ZapIcon className="h-8 w-8" />
                  </motion.div>
                </Button>
              </motion.div>
            </Link>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline" 
                size="lg" 
                className="px-20 py-10 text-2xl rounded-full border-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 backdrop-blur-sm font-bold"
              >
                <Calendar className="mr-4 h-8 w-8" />
                Schedule Vision
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            viewport={{ once: true }}
            className="mt-20 flex flex-wrap justify-center items-center gap-8 text-white/50"
          >
            <div className="flex items-center">
              <Shield className="h-8 w-8 mr-3 text-emerald-400" />
              <span className="text-lg">Quantum Secured</span>
            </div>
            <div className="flex items-center">
              <Cpu className="h-8 w-8 mr-3 text-emerald-400" />
              <span className="text-lg">AI Enhanced</span>
            </div>
            <div className="flex items-center">
              <Globe className="h-8 w-8 mr-3 text-emerald-400" />
              <span className="text-lg">Universal Access</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// Main Ultra Modern Landing Component
const UltraModernLanding = () => {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <CinematicHero />
      <FeatureTimeline />
      <TeachersShowcase />
      <LiveLearningArena />
      <InteractiveLMSDemo />
      <GlobalImpactCounter />
      <FinalCosmicCTA />
    </div>
  );
};

export default UltraModernLanding;
