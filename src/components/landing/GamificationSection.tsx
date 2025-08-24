import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, useAnimation, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Trophy,
  Crown,
  Star,
  Flame,
  Zap,
  Target,
  Award,
  Users,
  Gamepad2,
  Timer,
  Medal,
  TrendingUp,
  BarChart3,
  PlayCircle,
  Sparkles,
  ChevronUp,
  Gift,
  Gem,
  Brain,
  Rocket,
  Swords,
  Shield,
  Sword,
  Bolt,
  CircuitBoard,
  Cpu,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GamificationSection: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [currentLevel, setCurrentLevel] = useState(42);
  const [xp, setXp] = useState(15680);
  const [streak, setStreak] = useState(28);
  const [activeTab, setActiveTab] = useState('battle');
  const [battleMode, setBattleMode] = useState('live');
  const [playerCount, setPlayerCount] = useState(1247);
  const controls = useAnimation();

  React.useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  // Simulate live player count
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayerCount(prev => prev + Math.floor(Math.random() * 10) - 3);
      setXp(prev => prev + Math.floor(Math.random() * 25) + 5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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

  const battleVariants = {
    hidden: { opacity: 0, scale: 0.8, rotateX: -30 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateX: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 80,
        damping: 15,
        delay: 0.3,
      },
    },
  };

  const leaderboardData = [
    { rank: 1, name: 'محمد أحمد', score: 28450, level: 67, avatar: '👑', country: '🇪🇬', isOnline: true, winStreak: 15 },
    { rank: 2, name: 'فاطمة علي', score: 26890, level: 63, avatar: '⚡', country: '🇪🇬', isOnline: true, winStreak: 12 },
    { rank: 3, name: 'عمر خالد', score: 25330, level: 61, avatar: '🔥', country: '🇪🇬', isOnline: false, winStreak: 8 },
    { rank: 4, name: 'You', score: xp, level: currentLevel, avatar: '🚀', country: '🇪🇬', isOnline: true, winStreak: streak, isUser: true },
    { rank: 5, name: 'نور إبراهيم', score: 24100, level: 58, avatar: '💎', country: '🇪🇬', isOnline: true, winStreak: 6 },
  ];

  const achievements = [
    { 
      id: 'legend', 
      title: 'Battle Legend', 
      description: 'Win 1000 quiz battles', 
      progress: 847, 
      maxProgress: 1000,
      icon: <Crown className="w-6 h-6 sm:w-8 sm:h-8" />,
      color: 'from-warning via-warning to-accent',
      rarity: 'Legendary',
      unlocked: false
    },
    { 
      id: 'unstoppable', 
      title: 'Unstoppable Force', 
      description: '30-day study streak', 
      progress: 28, 
      maxProgress: 30,
      icon: <Flame className="w-6 h-6 sm:w-8 sm:h-8" />,
      color: 'from-error via-warning to-warning',
      rarity: 'Epic',
      unlocked: false
    },
    { 
      id: 'ai-master', 
      title: 'AI Master', 
      description: '1000 conversations with Hossam', 
      progress: 1000, 
      maxProgress: 1000,
      icon: <Brain className="w-6 h-6 sm:w-8 sm:h-8" />,
      color: 'from-primary via-secondary to-accent',
      rarity: 'Legendary',
      unlocked: true
    },
    { 
      id: 'speed-demon', 
      title: 'Speed Demon', 
      description: 'Answer 100 questions in under 5 seconds', 
      progress: 78, 
      maxProgress: 100,
      icon: <Zap className="w-6 h-6 sm:w-8 sm:h-8" />,
      color: 'from-info via-primary to-accent',
      rarity: 'Rare',
      unlocked: false
    },
  ];

  const battleModes = [
    {
      id: 'blitz',
      name: 'Blitz Battle',
      description: '60-second rapid fire',
      players: 892,
      icon: <Bolt className="w-5 h-5 sm:w-6 sm:h-6" />,
      difficulty: 'Easy',
      reward: '150-300 XP'
    },
    {
      id: 'arena',
      name: 'Arena Showdown',
      description: '1v1 skill-based matching',
      players: 456,
      icon: <Swords className="w-5 h-5 sm:w-6 sm:h-6" />,
      difficulty: 'Medium',
      reward: '300-600 XP'
    },
    {
      id: 'championship',
      name: 'Championship',
      description: 'Tournament elimination',
      players: 234,
      icon: <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />,
      difficulty: 'Hard',
      reward: '1000+ XP'
    },
  ];

  return (
    <section
      ref={sectionRef}
      className={`relative min-h-screen py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden ${
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
          })_1px,transparent_1px)] bg-[size:40px_40px] sm:bg-[size:60px_60px] lg:bg-[size:80px_80px]`} />
        </div>

        {/* Gradient Orbs */}
        <div className={`absolute top-10 sm:top-20 left-10 sm:left-20 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[600px] lg:h-[600px] ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20' 
            : 'bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10'
        } rounded-full blur-3xl animate-pulse`} />
        <div className={`absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] lg:w-[500px] lg:h-[500px] ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-accent/20 via-secondary/20 to-primary/20' 
            : 'bg-gradient-to-r from-accent/8 via-secondary/8 to-primary/8'
        } rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        className="max-w-8xl mx-auto px-4 sm:px-6 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        {/* Ultra Gaming Header */}
        <motion.div variants={itemVariants} className="text-center mb-16 sm:mb-20 lg:mb-24">
          <motion.div 
            className="inline-flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8"
            whileHover={{ scale: 1.05 }}
          >
            <Badge className="bg-gradient-to-r from-primary via-secondary to-accent text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 text-sm sm:text-lg lg:text-xl font-bold shadow-2xl shadow-secondary/25">
              <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 mr-2 sm:mr-3" />
              <span className="hidden sm:inline">BATTLE ARENA</span>
              <span className="sm:hidden">ARENA</span>
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 ml-2 sm:ml-3" />
            </Badge>
          </motion.div>
          
          <motion.h2 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-black mb-6 sm:mb-8 leading-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
            initial={{ backgroundPosition: '0% 50%' }}
            animate={{ backgroundPosition: '100% 50%' }}
            transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
            style={{
              backgroundSize: '300% 300%',
            }}
          >
            QUIZ WARS
          </motion.h2>
          
          <motion.p 
            className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Compete • Conquer • Champion
          </motion.p>
          
          <p className={`text-base sm:text-lg lg:text-xl max-w-4xl lg:max-w-5xl mx-auto leading-relaxed px-4 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Enter the ultimate battleground where knowledge meets competition. 
            Face off against Egypt's brightest minds in real-time quiz battles.
          </p>
        </motion.div>

        {/* Live Battle Interface */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 sm:gap-12 mb-16 sm:mb-20 lg:mb-24">
          {/* Player Profile & Stats */}
          <motion.div variants={battleVariants} className="xl:col-span-1 order-2 xl:order-1">
            <div className={`rounded-[2rem] p-4 sm:p-6 lg:p-8 ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-gray-900/90 via-primary/30 to-gray-900/90' 
                : 'bg-gradient-to-br from-white/90 via-primary/30 to-white/90'
            } backdrop-blur-2xl border-2 border-primary/30 shadow-2xl`}
            style={{
              boxShadow: theme === 'dark' 
                ? '0 0 80px hsl(var(--primary) / 0.3), inset 0 0 80px hsl(var(--secondary) / 0.1)' 
                : '0 0 80px hsl(var(--primary) / 0.15), inset 0 0 80px hsl(var(--secondary) / 0.05)'
            }}>
              
              {/* Player Header */}
              <div className="text-center mb-6 sm:mb-8">
                <motion.div
                  className="relative inline-block mb-4 sm:mb-6"
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeatType: "loop",
                    ease: "easeInOut",
                  }}
                >
                  {/* Rank Ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mx-auto bg-gradient-conic from-primary via-secondary to-accent"
                    style={{
                      padding: '4px',
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 10,
                      repeatType: "loop",
                      ease: "linear",
                    }}
                  >
                    <div className={`w-full h-full rounded-full ${
                      theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                    }`} />
                  </motion.div>

                  {/* Player Avatar */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mx-auto">
                    <motion.div 
                      className={`w-full h-full rounded-full flex items-center justify-center text-4xl sm:text-5xl lg:text-6xl ${
                        theme === 'dark' 
                          ? 'bg-gradient-to-br from-primary/30 to-secondary/30' 
                          : 'bg-gradient-to-br from-primary/20 to-secondary/20'
                      } backdrop-blur-sm`}
                      animate={{
                        y: [0, -8, 0],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      🚀
                    </motion.div>
                    
                    {/* Floating particles */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full"
                        style={{
                          top: `${20 + Math.random() * 60}%`,
                          left: `${20 + Math.random() * 60}%`,
                        }}
                        animate={{
                          y: [0, -20, 0],
                          opacity: [0.3, 1, 0.3],
                          scale: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2 + Math.random() * 2,
                          repeat: Infinity,
                          delay: i * 0.3,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                </motion.div>

                <h3 className={`text-2xl sm:text-3xl font-black mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Gaming Warrior
                </h3>
                <p className="text-primary font-bold text-base sm:text-lg">Battle Ready</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <motion.div 
                  className={`p-3 sm:p-4 rounded-xl text-center transition-all hover:scale-105 ${
                    theme === 'dark' ? 'bg-primary/20' : 'bg-primary/10'
                  }`}
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <motion.div 
                    className="text-2xl sm:text-3xl font-black text-primary"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {currentLevel}
                  </motion.div>
                  <div className={`text-xs sm:text-sm font-bold ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Level</div>
                </motion.div>
                <motion.div 
                  className={`p-3 sm:p-4 rounded-xl text-center transition-all hover:scale-105 ${
                    theme === 'dark' ? 'bg-secondary/20' : 'bg-secondary/10'
                  }`}
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div 
                    className="text-2xl sm:text-3xl font-black text-secondary"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  >
                    {xp.toLocaleString()}
                  </motion.div>
                  <div className={`text-xs sm:text-sm font-bold ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>XP</div>
                </motion.div>
                <motion.div 
                  className={`p-3 sm:p-4 rounded-xl text-center transition-all hover:scale-105 ${
                    theme === 'dark' ? 'bg-accent/20' : 'bg-accent/10'
                  }`}
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div 
                    className="text-2xl sm:text-3xl font-black text-accent"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  >
                    {streak}
                  </motion.div>
                  <div className={`text-xs sm:text-sm font-bold ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Win Streak</div>
                </motion.div>
                <motion.div 
                  className={`p-3 sm:p-4 rounded-xl text-center transition-all hover:scale-105 ${
                    theme === 'dark' ? 'bg-info/20' : 'bg-info/10'
                  }`}
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.div 
                    className="text-2xl sm:text-3xl font-black text-info"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                  >
                    #4
                  </motion.div>
                  <div className={`text-xs sm:text-sm font-bold ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Rank</div>
                </motion.div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Level Progress</span>
                    <span className="text-primary font-bold">{xp % 1000}/1000 XP</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 sm:h-3">
                    <motion.div 
                      className="bg-gradient-to-r from-primary to-secondary h-2 sm:h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(xp % 1000) / 10}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Win Streak</span>
                    <span className="text-accent font-bold">{streak} wins 🔥</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 sm:h-3">
                    <motion.div 
                      className="bg-gradient-to-r from-accent to-warning h-2 sm:h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((streak / 30) * 100, 100)}%` }}
                      transition={{ duration: 1, delay: 0.8 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Battle Arena */}
          <motion.div variants={itemVariants} className="xl:col-span-2 space-y-6 sm:space-y-8 order-1 xl:order-2">
            {/* Battle Mode Selector */}
            <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-2">
              {[
                { id: 'battle', label: 'Live Battle', icon: <Swords className="w-4 h-4 sm:w-5 sm:h-5" /> },
                { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4 sm:w-5 sm:h-5" /> },
                { id: 'achievements', label: 'Achievements', icon: <Award className="w-4 h-4 sm:w-5 sm:h-5" /> },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-bold transition-all whitespace-nowrap text-sm sm:text-base ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-primary via-secondary to-accent text-white shadow-lg'
                      : theme === 'dark'
                        ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                        : 'bg-gray-100/50 text-gray-600 hover:bg-gray-200/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tab.icon}
                  {tab.label}
                </motion.button>
              ))}
            </div>

            {/* Battle Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'battle' && (
                <motion.div
                  key="battle"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`rounded-3xl p-4 sm:p-6 lg:p-8 ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-br from-gray-900/80 to-primary/40' 
                      : 'bg-gradient-to-br from-white/90 to-primary/40'
                  } backdrop-blur-xl border-2 border-primary/30 shadow-2xl`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                    <h3 className={`text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      <Swords className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
                      Battle Arena
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-400 font-bold text-sm sm:text-base">{playerCount} ONLINE</span>
                    </div>
                  </div>

                  {/* Battle Modes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {battleModes.map((mode, index) => (
                      <motion.div
                        key={mode.id}
                        className={`p-4 sm:p-6 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden ${
                          battleMode === mode.id
                            ? 'border-primary/50 bg-primary/20 shadow-lg shadow-primary/25'
                            : theme === 'dark'
                              ? 'border-gray-700/50 bg-gray-800/30 hover:bg-gray-700/30'
                              : 'border-gray-300/50 bg-gray-100/30 hover:bg-gray-200/30'
                        }`}
                        onClick={() => setBattleMode(mode.id)}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          delay: index * 0.1,
                          type: 'spring', 
                          stiffness: 300, 
                          damping: 20 
                        }}
                      >
                        {/* Pulse effect for active mode */}
                        {battleMode === mode.id && (
                          <motion.div
                            className="absolute inset-0 bg-primary/10 rounded-2xl"
                            animate={{ 
                              scale: [1, 1.05, 1],
                              opacity: [0.3, 0.6, 0.3]
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        )}
                        <div className="text-center">
                          <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-xl bg-gradient-to-r ${
                            index === 0 ? 'from-info to-accent' :
                            index === 1 ? 'from-primary to-secondary' :
                            'from-warning to-warning'
                          } p-3 sm:p-4 text-white`}>
                            {mode.icon}
                          </div>
                          <h4 className={`font-bold text-base sm:text-lg mb-2 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>{mode.name}</h4>
                          <p className={`text-xs sm:text-sm mb-2 sm:mb-3 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}>{mode.description}</p>
                          <div className="flex justify-between text-xs">
                            <span className="text-green-400">{mode.players} players</span>
                            <span className="text-primary">{mode.reward}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Battle CTA */}
                  <div className="text-center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 text-white px-6 sm:px-8 lg:px-12 py-4 sm:py-5 lg:py-6 text-lg sm:text-xl lg:text-2xl font-black rounded-full shadow-2xl"
                        onClick={() => navigate('/student/quiz')}
                      >
                        <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 mr-2 sm:mr-3" />
                        <span className="hidden sm:inline">START BATTLE</span>
                        <span className="sm:hidden">BATTLE</span>
                        <Flame className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 ml-2 sm:ml-3" />
                      </Button>
                    </motion.div>
                    <p className={`mt-3 sm:mt-4 text-sm sm:text-lg ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      🎯 Find your skill level • 🏆 Climb the ranks • 💎 Earn rewards
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'leaderboard' && (
                <motion.div
                  key="leaderboard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`rounded-3xl p-4 sm:p-6 lg:p-8 ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/60' 
                      : 'bg-gradient-to-br from-white/90 to-gray-50/70'
                  } backdrop-blur-xl border-2 border-primary/30 shadow-2xl`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                    <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-warning" />
                    <h3 className={`text-2xl sm:text-3xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>Egypt Leaderboard</h3>
                    <Badge variant="secondary" className="animate-pulse text-xs sm:text-sm">LIVE</Badge>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {leaderboardData.map((player, index) => (
                      <motion.div
                        key={player.rank}
                        className={`flex items-center gap-3 sm:gap-6 p-4 sm:p-6 rounded-2xl border-2 transition-all ${
                          player.isUser 
                            ? theme === 'dark'
                              ? 'border-primary/50 bg-primary/20 shadow-lg scale-105' 
                              : 'border-primary/50 bg-primary/10 shadow-lg scale-105'
                            : theme === 'dark'
                              ? 'border-gray-700/50 bg-gray-800/30 hover:bg-gray-700/30'
                              : 'border-gray-300/50 bg-gray-100/30 hover:bg-gray-200/30'
                        }`}
                        whileHover={{ scale: player.isUser ? 1.05 : 1.02 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {/* Rank & Avatar */}
                        <div className="flex items-center gap-2 sm:gap-4">
                          <div className={`text-xl sm:text-3xl font-black w-8 sm:w-12 text-center ${
                            player.rank === 1 ? 'text-warning' :
                            player.rank === 2 ? 'text-muted-foreground' :
                            player.rank === 3 ? 'text-warning' :
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            #{player.rank}
                          </div>
                          <div className="text-2xl sm:text-4xl">{player.avatar}</div>
                          <div>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <span className={`font-bold text-sm sm:text-lg ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>{player.name}</span>
                              <span className="text-sm sm:text-lg">{player.country}</span>
                              {player.isOnline && (
                                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                              <span className="text-primary">Level {player.level}</span>
                              <span className="text-accent">🔥 {player.winStreak} streak</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Score */}
                        <div className="ml-auto text-right">
                          <div className={`font-black text-lg sm:text-2xl ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>{player.score.toLocaleString()}</div>
                          <div className={`text-xs sm:text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>XP Points</div>
                        </div>
                        
                        {/* Rank Icon */}
                        {player.rank <= 3 && (
                          <div className="shrink-0">
                            {player.rank === 1 && <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-warning" />}
                            {player.rank === 2 && <Medal className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />}
                            {player.rank === 3 && <Award className="w-6 h-6 sm:w-8 sm:h-8 text-warning" />}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'achievements' && (
                <motion.div
                  key="achievements"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`rounded-3xl p-4 sm:p-6 lg:p-8 ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/60' 
                      : 'bg-gradient-to-br from-white/90 to-gray-50/70'
                  } backdrop-blur-xl border-2 border-primary/30 shadow-2xl`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                    <Award className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                    <h3 className={`text-2xl sm:text-3xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>Achievement Gallery</h3>
                    <Badge variant="secondary" className="text-xs sm:text-sm">
                      {achievements.filter(a => a.unlocked).length}/{achievements.length}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {achievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ 
                          scale: achievement.unlocked ? 1.05 : 1.02,
                          y: achievement.unlocked ? -5 : -2
                        }}
                        className={`p-4 sm:p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                          achievement.unlocked
                            ? theme === 'dark'
                              ? 'border-primary/50 bg-gradient-to-br from-primary/20 to-secondary/20 shadow-lg'
                              : 'border-primary/50 bg-gradient-to-br from-primary/10 to-secondary/10 shadow-lg'
                            : theme === 'dark'
                              ? 'border-gray-700/50 bg-gray-800/30 opacity-75 hover:opacity-90'
                              : 'border-gray-300/50 bg-gray-100/30 opacity-75 hover:opacity-90'
                        }`}
                      >
                        <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-r ${achievement.color} text-white shadow-lg`}>
                            {achievement.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-bold text-base sm:text-lg ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>{achievement.title}</h4>
                              <Badge className={`text-xs ${
                                achievement.rarity === 'Legendary' ? 'bg-warning' :
                                achievement.rarity === 'Epic' ? 'bg-primary' :
                                'bg-info'
                              }`}>
                                {achievement.rarity}
                              </Badge>
                            </div>
                            <p className={`text-xs sm:text-sm ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>{achievement.description}</p>
                          </div>
                          {achievement.unlocked && (
                            <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-warning animate-pulse" />
                          )}
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs sm:text-sm mb-2">
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Progress</span>
                            <span className="font-bold text-primary">{achievement.progress}/{achievement.maxProgress}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2 sm:h-3">
                            <motion.div 
                              className={`bg-gradient-to-r ${achievement.color} h-2 sm:h-3 rounded-full`}
                              initial={{ width: 0 }}
                              animate={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                              transition={{ duration: 1, delay: index * 0.2 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Why Gamification Works */}
        <motion.div variants={itemVariants} className="text-center">
          <h3 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 sm:mb-12 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Why Gaming + Learning = Magic</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: <Brain className="w-8 h-8 sm:w-10 sm:h-10" />,
                title: '5x Engagement',
                description: 'Students learn 5x faster when competing',
                color: 'from-info to-accent'
              },
              {
                icon: <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10" />,
                title: '95% Retention',
                description: 'Knowledge sticks when it\'s earned through victory',
                color: 'from-success to-success'
              },
              {
                icon: <Users className="w-8 h-8 sm:w-10 sm:h-10" />,
                title: 'Global Community',
                description: 'Learn with Egypt\'s brightest students',
                color: 'from-primary to-secondary'
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="text-center p-6 sm:p-8"
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl bg-gradient-to-r ${feature.color} p-4 sm:p-5 text-white shadow-lg`}>
                  {feature.icon}
                </div>
                <h4 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>{feature.title}</h4>
                <p className={`text-sm sm:text-base leading-relaxed ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default GamificationSection;