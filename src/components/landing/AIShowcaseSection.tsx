import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, useAnimation, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Bot,
  Mic,
  MessageSquare,
  Brain,
  Zap,
  Volume2,
  PlayCircle,
  Pause,
  Sparkles,
  Headphones,
  Users,
  Award,
  Target,
  Cpu,
  Eye,
  Power,
  Activity,
  Wifi,
  Shield,
  Star,
  Flame,
  Globe,
  Settings,
  Monitor,
  Layers,
  Code,
  Database,
  Command,
  Rocket,

} from 'lucide-react';

const dialogues = [
  {
    user: "مرحباً حسام، هل يمكنك مساعدتي في الفيزياء؟",
    ai: "بالطبع! أنا هنا لمساعدتك. دعني أشرح لك المفاهيم بطريقة سهلة ومفهومة",
    translation: "Hello Hossam, can you help me with physics?",
    subject: "Physics"
  },
  {
    user: "Can you explain machine learning algorithms?",
    ai: "Absolutely! Machine learning is like teaching computers to learn patterns. Let me break it down step by step...",
    translation: "AI explaining complex topics",
    subject: "AI & ML"
  },
  {
    user: "شرح لي قانون نيوتن الثاني بالعربي",
    ai: "قانون نيوتن الثاني ينص على أن القوة تساوي الكتلة مضروبة في التسارع F=ma. دعني أعطيك أمثلة عملية...",
    translation: "Explain Newton's second law in Arabic",
    subject: "Physics"
  }
];

const AIShowcaseSection: React.FC = () => {
  const { theme } = useTheme();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDialogue, setCurrentDialogue] = useState(0);
  const [robotActive, setRobotActive] = useState(false);
  const [activeDemo, setActiveDemo] = useState('voice');
  const [typingText, setTypingText] = useState('');
  const [aiThinking, setAiThinking] = useState(false);
  const controls = useAnimation();

  React.useEffect(() => {
    if (isInView) {
      controls.start('visible');
      setRobotActive(true);
    }
  }, [isInView, controls]);

  // Auto-cycle through dialogues
  useEffect(() => {
    if (robotActive) {
      const interval = setInterval(() => {
        setAiThinking(true);
        setTimeout(() => {
          setCurrentDialogue((prev) => (prev + 1) % dialogues.length);
          setAiThinking(false);
        }, 1000);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [robotActive]);

  // Typing effect for AI responses
  useEffect(() => {
    if (robotActive && !aiThinking) {
      const text = dialogues[currentDialogue].ai;
      setTypingText('');
      let index = 0;
      const timer = setInterval(() => {
        if (index < text.length) {
          setTypingText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
        }
      }, 30);
      return () => clearInterval(timer);
    }
  }, [currentDialogue, robotActive, aiThinking]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 60 },
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

  const aiVariants = {
    hidden: { opacity: 0, scale: 0.8, rotateY: -30 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 80,
        damping: 15,
        delay: 0.5,
      },
    },
  };

  return (
    <section
      ref={sectionRef}
      className={`relative min-h-screen py-16 md:py-24 lg:py-32 overflow-hidden ${
        theme === 'dark' ? 'bg-black' : 'bg-white'
      }`}
    >
      {/* Premium Background */}
      <div className="absolute inset-0">
        {/* Subtle Grid */}
        <div className={`absolute inset-0 ${
          theme === 'dark' ? 'opacity-5' : 'opacity-3'
        }`}>
          <div className={`absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--primary)/${
            theme === 'dark' ? '0.1' : '0.05'
          })_1px,transparent_1px),linear-gradient(hsl(var(--primary)/${
            theme === 'dark' ? '0.1' : '0.05'
          })_1px,transparent_1px)] bg-[size:80px_80px]`} />
        </div>

        {/* Gradient Orbs */}
        <div className={`absolute top-10 left-10 md:top-20 md:left-20 w-[300px] h-[300px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20' 
            : 'bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10'
        } rounded-full blur-3xl animate-pulse`} />
        <div className={`absolute bottom-10 right-10 md:bottom-20 md:right-20 w-[250px] h-[250px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-accent/20 via-secondary/20 to-primary/20' 
            : 'bg-gradient-to-r from-accent/8 via-secondary/8 to-primary/8'
        } rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        className="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        {/* Ultra Premium Header */}
        <motion.div variants={itemVariants} className="text-center mb-12 md:mb-16 lg:mb-24">
          <motion.div 
            className="inline-flex items-center gap-3 mb-8"
            whileHover={{ scale: 1.05 }}
          >
            <Badge className="bg-gradient-to-r from-primary via-secondary to-accent text-white px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 text-base md:text-lg lg:text-xl font-bold shadow-2xl shadow-secondary/25">
              <Bot className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 mr-2 md:mr-3" />
              MEET THE FUTURE
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 ml-2 md:ml-3" />
            </Badge>
          </motion.div>
          
          <motion.h2 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-black mb-6 md:mb-8 leading-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
            initial={{ backgroundPosition: '0% 50%' }}
            animate={{ backgroundPosition: '100% 50%' }}
            transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse' }}
            style={{
              backgroundSize: '300% 300%',
            }}
          >
            HOSSAM AI
          </motion.h2>
          
          <motion.p 
            className={`text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Egypt's Revolutionary AI Tutor
          </motion.p>
          
          <p className={`text-base md:text-lg lg:text-xl max-w-4xl lg:max-w-5xl mx-auto leading-relaxed px-4 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Experience conversations that feel human, learning that adapts to you, 
            and AI that speaks your language - literally.
          </p>
        </motion.div>

        {/* Main Showcase */}
        <div className="grid lg:grid-cols-1 xl:grid-cols-2 gap-8 md:gap-12 lg:gap-16 xl:gap-20 items-center mb-16 md:mb-20 lg:mb-24">
          {/* Left - AI Interface */}
          <motion.div variants={aiVariants} className="relative">
            {/* Main AI Container */}
            <div className={`relative rounded-2xl md:rounded-[2rem] lg:rounded-[3rem] p-6 md:p-8 lg:p-10 xl:p-12 ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90' 
                : 'bg-gradient-to-br from-white/90 via-gray-50/80 to-white/90'
            } backdrop-blur-2xl border-2 border-primary/30 shadow-2xl`}
            style={{
              boxShadow: theme === 'dark' 
                ? '0 0 100px hsl(var(--primary) / 0.3), inset 0 0 100px hsl(var(--secondary) / 0.1)' 
                : '0 0 100px hsl(var(--primary) / 0.15), inset 0 0 100px hsl(var(--secondary) / 0.05)'
            }}>
              
              {/* Status Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 md:mb-10 lg:mb-12">
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <motion.div
                      className="flex items-center gap-2 bg-green-500/20 px-3 py-1 md:px-4 md:py-2 rounded-full border border-green-500/50"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeatType: "loop" }}
                    >
                      <div className="w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-400 font-bold text-sm md:text-base">ONLINE</span>
                    </motion.div>
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      <Shield className="w-4 h-4 md:w-5 md:h-5 text-success" />
                      <Shield className="w-4 h-4 md:w-5 md:h-5 text-warning" />
                    </div>
                  </div>
                <div className={`text-xs md:text-sm font-mono ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  AI Model: HOSSAM-2024
                </div>
              </div>

              {/* AI Avatar */}
              <div className="text-center mb-8 md:mb-10 lg:mb-12">
                <motion.div
                  className="relative inline-block"
                  animate={robotActive ? {
                    rotateY: [0, 5, -5, 0],
                    scale: [1, 1.02, 1],
                  } : {}}
                  transition={{
                    duration: 6,
                    repeatType: "loop",
                    ease: "easeInOut",
                  }}
                >
                  {/* Outer Glow Ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 mx-auto bg-gradient-conic from-primary via-secondary to-accent"
                    style={{
                      padding: '4px',
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 8,
                      repeatType: "loop",
                      ease: "linear",
                    }}
                  >
                    <div className={`w-full h-full rounded-full ${
                      theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                    }`} />
                  </motion.div>

                  {/* AI Core */}
                  <div className={`relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-64 xl:h-64 mx-auto rounded-full flex items-center justify-center ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-br from-primary/30 via-secondary/30 to-accent/30' 
                      : 'bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20'
                  } backdrop-blur-sm`}>
                    <motion.div
                      animate={robotActive ? {
                        scale: [1, 1.1, 1],
                        filter: [
                          'drop-shadow(0 0 30px hsl(var(--primary)))',
                          'drop-shadow(0 0 50px hsl(var(--secondary)))',
                          'drop-shadow(0 0 30px hsl(var(--primary)))',
                        ],
                      } : {}}
                      transition={{
                        duration: 3,
                        repeatType: "loop",
                        ease: "easeInOut",
                      }}
                    >
                      <Bot className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 text-primary" />
                    </motion.div>

                    {/* Orbiting Elements */}
                    {[Brain, Cpu, Database, Code, Command, Rocket].map((Icon, index) => (
                      <motion.div
                        key={index}
                        className="absolute orbit-small sm:orbit-medium md:orbit-large lg:orbit-xl xl:orbit-2xl"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 12 + index * 2,
                          repeatType: "loop",
                          ease: "linear",
                        }}
                      >
                        <motion.div
                          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-primary via-secondary to-accent rounded-full flex items-center justify-center shadow-lg"
                          style={{
                            transform: `translate(${Math.cos(index * Math.PI / 3) * (window.innerWidth < 640 ? 60 : window.innerWidth < 768 ? 70 : window.innerWidth < 1024 ? 80 : window.innerWidth < 1280 ? 100 : 140)}px, ${Math.sin(index * Math.PI / 3) * (window.innerWidth < 640 ? 60 : window.innerWidth < 768 ? 70 : window.innerWidth < 1024 ? 80 : window.innerWidth < 1280 ? 100 : 140)}px)`,
                          }}
                          whileHover={{ scale: 1.2 }}
                        >
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.h3
                  className={`text-4xl font-black mt-8 mb-3 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                  animate={robotActive ? {
                    textShadow: [
                      '0 0 30px hsl(var(--primary))',
                      '0 0 50px hsl(var(--secondary))',
                      '0 0 30px hsl(var(--primary))',
                    ],
                  } : {}}
                  transition={{
                    duration: 2,
                    repeatType: "loop",
                    ease: "easeInOut",
                  }}
                >
                  HOSSAM AI
                </motion.h3>
                <p className="text-primary font-bold text-lg">Neural Intelligence Engine</p>
              </div>

              {/* AI Capabilities */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                {[
                  { icon: <MessageSquare className="w-6 h-6" />, label: 'Natural Chat', color: 'from-primary to-accent' },
                  { icon: <Volume2 className="w-6 h-6" />, label: 'Voice AI', color: 'from-secondary to-accent' },
                  { icon: <Brain className="w-6 h-6" />, label: 'Deep Learning', color: 'from-success to-success' },
                  { icon: <Globe className="w-6 h-6" />, label: 'Arabic Expert', color: 'from-warning to-error' },
                  { icon: <Zap className="w-6 h-6" />, label: 'Instant', color: 'from-warning to-warning' },
                  { icon: <Shield className="w-6 h-6" />, label: 'Secure', color: 'from-primary to-secondary' },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className={`p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-r ${item.color} bg-opacity-10 border text-center ${
                      theme === 'dark' ? 'border-white/10' : 'border-gray-300/20'
                    }`}
                    whileHover={{ scale: 1.1, y: -5 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <div className={`mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-700'
                    }`}>{item.icon}</div>
                    <div className={`text-xs md:text-sm font-bold ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>{item.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right - Live Demo */}
          <motion.div variants={itemVariants} className="space-y-8">
            {/* Demo Selector */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 md:mb-8">
              {[
                { id: 'voice', label: 'Voice Chat', icon: <Volume2 className="w-4 h-4 md:w-5 md:h-5" /> },
                { id: 'text', label: 'Text Chat', icon: <MessageSquare className="w-4 h-4 md:w-5 md:h-5" /> },
                { id: 'analytics', label: 'Analytics', icon: <Activity className="w-4 h-4 md:w-5 md:h-5" /> },
              ].map((demo) => (
                <motion.button
                  key={demo.id}
                  onClick={() => setActiveDemo(demo.id)}
                  className={`flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl font-bold transition-all text-sm md:text-base ${
                    activeDemo === demo.id
                      ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                      : theme === 'dark'
                        ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                        : 'bg-gray-100/50 text-gray-600 hover:bg-gray-200/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {demo.icon}
                  {demo.label}
                </motion.button>
              ))}
            </div>

            {/* Live Chat Demo */}
            <AnimatePresence mode="wait">
              {activeDemo === 'voice' && (
                <motion.div
                  key="voice"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`rounded-2xl md:rounded-3xl p-6 md:p-8 ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/60' 
                      : 'bg-gradient-to-br from-white/90 to-gray-50/70'
                  } backdrop-blur-xl border-2 border-secondary/30 shadow-2xl`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 md:mb-8">
                    <h3 className={`text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      <Volume2 className="w-6 h-6 md:w-7 md:h-7 text-secondary" />
                      Live Conversation
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-400 font-bold text-sm md:text-base">ACTIVE</span>
                    </div>
                  </div>

                  {/* Subject Badge */}
                  <div className="mb-6">
                    <Badge className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2">
                      📚 {dialogues[currentDialogue].subject}
                    </Badge>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentDialogue}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      {/* User Message */}
                      <div className="flex justify-end">
                        <div className="bg-gradient-to-r from-primary to-accent p-4 md:p-6 rounded-2xl md:rounded-3xl rounded-tr-lg max-w-xs sm:max-w-sm md:max-w-md shadow-lg">
                          <p className="text-white font-medium text-base md:text-lg mb-2">
                            {dialogues[currentDialogue].user}
                          </p>
                          <p className="text-primary-foreground/80 text-xs md:text-sm opacity-80">
                            {dialogues[currentDialogue].translation}
                          </p>
                        </div>
                      </div>

                      {/* AI Response */}
                      <div className="flex justify-start">
                        <div className="bg-gradient-to-r from-secondary to-accent p-4 md:p-6 rounded-2xl md:rounded-3xl rounded-tl-lg max-w-xs sm:max-w-sm md:max-w-lg shadow-lg">
                          <div className="flex items-center gap-2 md:gap-3 mb-3">
                            <Bot className="w-5 h-5 md:w-6 md:h-6 text-white" />
                            <span className="text-white font-bold text-base md:text-lg">Hossam AI</span>
                            {aiThinking && (
                              <div className="flex gap-1">
                                {[...Array(3)].map((_, i) => (
                                  <motion.div
                                    key={i}
                                    className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full"
                                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1, repeatType: "loop", delay: i * 0.2 }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          {!aiThinking && (
                            <p className="text-white font-medium text-base md:text-lg">
                              {typingText}
                              <motion.span
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 1, repeatType: "loop" }}
                                className="inline-block w-1 h-5 bg-white ml-1"
                              />
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Controls */}
                  <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-base md:text-lg shadow-xl"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                          Stop
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                          Try Now
                        </>
                      )}
                    </Button>

                    <div className={`flex items-center gap-2 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <Headphones className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-xs md:text-sm">Best with audio</span>
                    </div>
                  </div>

                  {/* Voice Visualizer */}
                  {isPlaying && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`flex justify-center items-center gap-2 mt-8 p-6 rounded-2xl ${
                        theme === 'dark' ? 'bg-black/30' : 'bg-gray-200/50'
                      }`}
                    >
                      {[...Array(25)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-gradient-to-t from-secondary via-accent to-primary rounded-full"
                          animate={{
                            height: [10, 80, 40, 100, 20],
                          }}
                          transition={{
                            duration: 1.5,
                            repeatType: "loop",
                            delay: i * 0.05,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Performance Analytics */}
              {activeDemo === 'analytics' && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6"
                >
                  {[
                    { metric: '< 50ms', label: 'Response Time', icon: <Zap className="w-8 h-8" />, color: 'from-warning to-warning' },
                    { metric: '99.9%', label: 'Accuracy', icon: <Target className="w-8 h-8" />, color: 'from-success to-success' },
                    { metric: '24/7', label: 'Uptime', icon: <Activity className="w-8 h-8" />, color: 'from-primary to-accent' },
                    { metric: '150+', label: 'Languages', icon: <Globe className="w-8 h-8" />, color: 'from-secondary to-accent' },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className={`p-6 md:p-8 rounded-xl md:rounded-2xl bg-gradient-to-r ${item.color} bg-opacity-10 border text-center ${
                        theme === 'dark' ? 'border-white/10' : 'border-gray-300/20'
                      }`}
                      whileHover={{ scale: 1.05, y: -5 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <div className={`mb-3 md:mb-4 flex justify-center ${
                        theme === 'dark' ? 'text-white' : 'text-gray-700'
                      }`}>{item.icon}</div>
                      <div className={`text-2xl md:text-3xl lg:text-4xl font-black mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>{item.metric}</div>
                      <div className={`text-xs md:text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>{item.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Ultimate CTA */}
        <motion.div variants={itemVariants} className="text-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 text-white px-8 py-4 md:px-12 md:py-6 lg:px-16 lg:py-8 text-xl md:text-2xl lg:text-3xl font-black rounded-full shadow-2xl transform transition-all duration-300"
              style={{
                backgroundSize: '300% 100%',
                animation: 'gradient-shift 3s ease infinite',
              }}
            >
              <Bot className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 mr-2 md:mr-3 lg:mr-4" />
              Experience Hossam AI
              <Sparkles className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 ml-2 md:ml-3 lg:ml-4" />
            </Button>
          </motion.div>
          <p className={`mt-4 md:mt-6 text-base md:text-lg lg:text-xl ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            🚀 Free to start • 🇪🇬 Made in Egypt • 🤖 Powered by AI
          </p>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @media (max-width: 640px) {
          .orbit-small { transform-origin: 60px 60px !important; }
        }
        @media (min-width: 641px) and (max-width: 768px) {
          .orbit-medium { transform-origin: 70px 70px !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .orbit-large { transform-origin: 80px 80px !important; }
        }
        @media (min-width: 1025px) and (max-width: 1280px) {
          .orbit-xl { transform-origin: 100px 100px !important; }
        }
        @media (min-width: 1281px) {
          .orbit-2xl { transform-origin: 140px 140px !important; }
        }
      `}</style>
    </section>
  );
};

export default AIShowcaseSection;