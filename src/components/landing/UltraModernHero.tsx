import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useAnimation } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Bot, 
  Gamepad2, 
  Crown, 
  ArrowRight, 
  Play,
  Zap,
  Trophy,
  Star,
  Flame
} from 'lucide-react';
import { PLATFORM_NAME } from '@/data/constants';

const UltraModernHero: React.FC = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  const controls = useAnimation();

  // Parallax transforms
  const y1 = useTransform(scrollY, [0, 500], [0, -50]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 0.8]);

  useEffect(() => {
    setMounted(true);
    controls.start('visible');
  }, [controls]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 100 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 200,
        damping: 10,
      },
    },
  };

  const floatingVariants = {
    float: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeatType: "loop",
        ease: "easeInOut" as const,
        repeatType: "loop",
      },
    },
  };

  if (!mounted) return null;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-32 h-32 rounded-full opacity-20 ${
              i % 3 === 0 ? 'bg-primary' : i % 3 === 1 ? 'bg-blue-500' : 'bg-purple-500'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 50, -50, 0],
              y: [0, -50, 50, 0],
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeatType: "loop",
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24px,rgba(255,255,255,0.05)_25px,rgba(255,255,255,0.05)_26px,transparent_27px),linear-gradient(rgba(255,255,255,0.05)_24px,transparent_25px,transparent_26px,rgba(255,255,255,0.05)_27px)] bg-[25px_25px]" />
        </div>
      </div>

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-6 text-center"
        style={{ y: y1, opacity, scale }}
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        {/* Egypt First Badge */}
        <motion.div variants={badgeVariants} className="flex justify-center mb-8">
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 text-lg font-bold border-0 shadow-lg">
            <Crown className="w-5 h-5 mr-2" />
            مصر الأولى • Egypt's First
            <Sparkles className="w-5 h-5 ml-2" />
          </Badge>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-6xl md:text-8xl lg:text-9xl font-black leading-tight mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent"
        >
          {PLATFORM_NAME}
        </motion.h1>

        {/* Subtitle with Icons */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground/90 mb-4">
            AI-Powered Gamified LMS
          </h2>
          <div className="flex justify-center items-center gap-8 text-muted-foreground">
            <motion.div
              variants={floatingVariants}
              animate="float"
              className="flex items-center gap-2"
            >
              <Bot className="w-8 h-8 text-blue-500" />
              <span className="text-lg font-semibold">AI Tutor</span>
            </motion.div>
            <motion.div
              variants={floatingVariants}
              animate="float"
              style={{ animationDelay: '1s' }}
              className="flex items-center gap-2"
            >
              <Gamepad2 className="w-8 h-8 text-purple-500" />
              <span className="text-lg font-semibold">Multiplayer Quizzes</span>
            </motion.div>
            <motion.div
              variants={floatingVariants}
              animate="float"
              style={{ animationDelay: '2s' }}
              className="flex items-center gap-2"
            >
              <Trophy className="w-8 h-8 text-amber-500" />
              <span className="text-lg font-semibold">Gamified Learning</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed"
        >
          Experience the future of education with Egypt's first AI-powered learning platform. 
          Talk to <span className="text-primary font-bold">Hossam, our AI voice tutor</span>, 
          compete in multiplayer quizzes, and learn through revolutionary gamified experiences.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground px-8 py-4 text-xl font-bold rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            onClick={() => navigate('/courses')}
          >
            <Play className="w-6 h-6 mr-2" />
            Start Learning Now
            <ArrowRight className="w-6 h-6 ml-2" />
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 text-xl font-bold rounded-full transition-all duration-300"
            onClick={() => navigate('/auth/signup')}
          >
            <Sparkles className="w-6 h-6 mr-2" />
            Join for Free
          </Button>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
        >
          {[
            { number: '50K+', label: 'Active Learners', icon: <Star className="w-6 h-6" /> },
            { number: '1000+', label: 'AI Conversations', icon: <Bot className="w-6 h-6" /> },
            { number: '10K+', label: 'Quiz Battles', icon: <Flame className="w-6 h-6" /> },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="flex justify-center mb-2 text-primary">
                {stat.icon}
              </div>
              <div className="text-3xl font-black text-foreground">{stat.number}</div>
              <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        style={{ y: y2 }}
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 2,
          repeatType: "loop",
          ease: "easeInOut",
          repeatType: "loop",
        }}
      >
        <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-primary rounded-full mt-2"
            animate={{
              y: [0, 12, 0],
            }}
            transition={{
              duration: 2,
              repeatType: "loop",
              ease: "easeInOut",
              repeatType: "loop",
            }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default UltraModernHero;
