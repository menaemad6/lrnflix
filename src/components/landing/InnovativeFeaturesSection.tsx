import React, { useRef, useState } from 'react';
import { motion, useInView, useAnimation, useTransform, useScroll, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Gamepad2,
  Users,
  Trophy,
  Zap,
  Crown,
  Flame,
  Target,
  Rocket,
  Brain,
  Sparkles,
  PlayCircle,
  Volume2,
  MessageSquare,
  BookOpen,
  Award,
  Globe,
  ChevronRight,
  Star,
  Eye,
  Headphones,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InnovativeFeaturesSection: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const controls = useAnimation();
  const [activeFeature, setActiveFeature] = useState(0);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1, 0.5]);

  React.useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

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
    hidden: { opacity: 0, y: 80 },
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

  const features = [
    {
      id: 'multiplayer-quiz',
      title: 'Multiplayer Quiz Battles',
      subtitle: 'First in Egypt',
      description: 'Compete with students across Egypt in real-time quiz battles. Test your knowledge, climb leaderboards, and earn rewards.',
      icon: <Gamepad2 className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />,
      color: 'from-primary via-secondary to-accent',
      bgColor: 'from-primary/10 via-secondary/10 to-accent/10',
      stats: ['10K+ Battles', '500+ Players Online', 'Real-time Ranking'],
      demo: {
        type: 'game',
        players: ['Ahmed', 'Fatima', 'Omar', 'You'],
        question: 'What is the capital of Egypt?',
        answers: ['Cairo', 'Alexandria', 'Giza', 'Luxor'],
      }
    },
    {
      id: 'ai-voice-tutor',
      title: 'AI Voice Conversations',
      subtitle: 'Revolutionary Learning',
      description: 'Chat naturally with Hossam, our AI tutor in Arabic and English. Get instant explanations and personalized guidance.',
      icon: <Volume2 className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />,
      color: 'from-primary to-accent',
      bgColor: 'from-primary/10 to-accent/10',
      stats: ['Natural Conversations', 'Arabic & English', '24/7 Available'],
      demo: {
        type: 'voice',
        conversation: [
          { speaker: 'You', text: 'Can you explain photosynthesis?' },
          { speaker: 'Hossam', text: 'Of course! Photosynthesis is...' },
        ]
      }
    },
    {
      id: 'gamified-learning',
      title: 'Achievement System',
      subtitle: 'Addictive Learning',
      description: 'Unlock badges, earn XP, and level up as you learn. Complete challenges and compete with friends.',
      icon: <Trophy className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />,
      color: 'from-warning to-accent',
      bgColor: 'from-warning/10 to-accent/10',
      stats: ['50+ Badges', 'XP System', 'Daily Challenges'],
      demo: {
        type: 'achievements',
        badges: ['Quiz Master', 'Study Streak', 'Knowledge Hunter'],
        level: 15,
        xp: 2450
      }
    },
    {
      id: 'smart-content',
      title: 'AI Content Generation',
      subtitle: 'Intelligent Automation',
      description: 'AI automatically creates quizzes from any content, generates summaries, and provides personalized recommendations.',
      icon: <Brain className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />,
      color: 'from-secondary to-accent',
      bgColor: 'from-secondary/10 to-accent/10',
      stats: ['Auto Quiz Generation', 'Smart Summaries', 'Personalized'],
      demo: {
        type: 'ai-generation',
        input: 'Upload PDF or Video',
        output: 'Auto-generated Quiz Questions'
      }
    }
  ];

  const FeatureDemo = ({ feature }: { feature: typeof features[0] }) => {
    switch (feature.demo.type) {
      case 'game':
        return (
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-card/50 rounded-xl p-3 sm:p-4 border border-border/50">
              <div className="text-base sm:text-lg font-bold mb-2">{feature.demo.question}</div>
              <div className="grid grid-cols-2 gap-2">
                {feature.demo.answers?.map((answer, idx) => (
                  <button
                    key={idx}
                    className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg text-xs sm:text-sm transition-colors"
                  >
                    {answer}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <div className="flex -space-x-2">
                {feature.demo.players?.map((player, idx) => (
                  <div
                    key={idx}
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      player === 'You' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {player[0]}
                  </div>
                ))}
              </div>
              <div className="text-primary font-bold">⏱️ 15s</div>
            </div>
          </div>
        );
      
      case 'voice':
        return (
          <div className="space-y-2 sm:space-y-3">
            {feature.demo.conversation?.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 sm:p-3 rounded-xl ${
                  msg.speaker === 'You' 
                    ? 'bg-primary text-primary-foreground ml-4 sm:ml-8' 
                    : 'bg-card/50 border border-border/50 mr-4 sm:mr-8'
                }`}
              >
                <div className="text-xs font-bold mb-1">{msg.speaker}</div>
                <div className="text-xs sm:text-sm">{msg.text}</div>
              </div>
            ))}
            <div className="flex justify-center">
              <div className="flex items-center gap-2 text-primary">
                <Headphones className="w-4 h-4" />
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 h-4 sm:h-6 bg-primary rounded-full"
                      animate={{ scaleY: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeatType: "loop", delay: i * 0.1}}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'achievements':
        return (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-2xl font-bold">Level {feature.demo.level}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{feature.demo.xp} XP</div>
              </div>
              <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-warning" />
            </div>
            <div className="space-y-2">
              {feature.demo.badges?.map((badge, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 sm:gap-3 p-2 bg-card/50 rounded-lg border border-border/50"
                >
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <span className="text-xs sm:text-sm font-medium">{badge}</span>
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-warning ml-auto" />
                </div>
              ))}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-3 sm:space-y-4">
            <div className="text-center p-4 sm:p-6 bg-card/50 rounded-xl border border-border/50">
              <div className="text-xs sm:text-sm text-muted-foreground mb-2">{feature.demo.input}</div>
              <motion.div
                className="w-8 h-8 sm:w-12 sm:h-12 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-3 sm:mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeatType: "loop", ease: "linear" }}
              >
                <Brain className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
              </motion.div>
              <div className="text-xs sm:text-sm font-medium">{feature.demo.output}</div>
            </div>
          </div>
        );
    }
  };

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
        className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        {/* Ultra Premium Header */}
        <motion.div variants={itemVariants} className="text-center mb-16 sm:mb-20 lg:mb-24">
          <motion.div 
            className="inline-flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8"
            whileHover={{ scale: 1.05 }}
          >
            <Badge className="bg-gradient-to-r from-primary via-secondary to-accent text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 text-sm sm:text-lg lg:text-xl font-bold shadow-2xl shadow-secondary/25">
              <Rocket className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 mr-2 sm:mr-3" />
              <span className="hidden sm:inline">REVOLUTIONARY FEATURES</span>
              <span className="sm:hidden">FEATURES</span>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 ml-2 sm:ml-3" />
            </Badge>
          </motion.div>
          
          <motion.h2 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-black mb-6 sm:mb-8 leading-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
            initial={{ backgroundPosition: '0% 50%' }}
            animate={{ backgroundPosition: '100% 50%' }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
            style={{
              backgroundSize: '300% 300%',
            }}
          >
            NEVER SEEN BEFORE
          </motion.h2>
          
          <motion.p 
            className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-foreground"
          >
            Revolutionary Learning Experience
          </motion.p>
          
          <p className="text-base sm:text-lg lg:text-xl max-w-4xl lg:max-w-5xl mx-auto leading-relaxed text-muted-foreground px-4">
            We've reimagined education with cutting-edge technology that makes learning 
            addictive, competitive, and incredibly effective.
          </p>
        </motion.div>

        {/* Interactive Features Grid */}
        <motion.div variants={itemVariants} className="mb-16 sm:mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Feature Navigation */}
            <div className="space-y-3 sm:space-y-4 order-2 lg:order-1">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  className={`p-4 sm:p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                    activeFeature === index
                      ? 'border-primary/50 bg-card/80 shadow-lg scale-105'
                      : 'border-border/50 bg-card/40 hover:bg-card/60'
                  }`}
                  onClick={() => setActiveFeature(index)}
                  whileHover={{ scale: activeFeature === index ? 1.05 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white shrink-0`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg sm:text-xl font-bold text-foreground">{feature.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {feature.subtitle}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-3">
                        {feature.description}
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {feature.stats.map((stat, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {stat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                      activeFeature === index ? 'rotate-90 text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Feature Demo */}
            <div className="lg:sticky lg:top-8 h-fit order-1 lg:order-2 mb-6 lg:mb-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <Card className="bg-gradient-to-br from-card to-card/80 border-2 border-primary/20 shadow-2xl overflow-hidden">
                    <CardContent className="p-0">
                      {/* Header */}
                      <div className={`p-4 sm:p-6 bg-gradient-to-r ${features[activeFeature].bgColor} border-b border-border/20`}>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${features[activeFeature].color} text-white`}>
                            {features[activeFeature].icon}
                          </div>
                          <div>
                            <h4 className="text-base sm:text-lg font-bold text-foreground">
                              {features[activeFeature].title}
                            </h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Live Demo
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Demo Content */}
                      <div className="p-4 sm:p-6">
                        <FeatureDemo feature={features[activeFeature]} />
                      </div>

                      {/* Action Button */}
                      <div className="p-4 sm:p-6 pt-0">
                        <Button
                          className={`w-full bg-gradient-to-r ${features[activeFeature].color} text-white font-bold text-sm sm:text-base`}
                          onClick={() => navigate('/auth/signup')}
                        >
                          <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Try This Feature
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
};

export default InnovativeFeaturesSection;

