
import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimation, useInView, useScroll, useTransform } from 'framer-motion';
import { useInView as useInViewHook } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Play
} from 'lucide-react';
import ModernLayoutHero from './ModernLayoutHero';

// Revolutionary AI Neural Network Animation Component
const AINetworkBackground = () => {
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
};

// Revolutionary Hero Section with 3D Elements
const RevolutionaryHero = () => {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 400], [1, 0.9]);
  
  return (
    <motion.section 
      style={{ opacity, scale }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* AI Network Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
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
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          >
            <div className="relative">
              <div className={`w-16 h-16 rounded-full ${
                i % 4 === 0 ? 'bg-gradient-to-r from-emerald-400 to-teal-400' :
                i % 4 === 1 ? 'bg-gradient-to-r from-blue-400 to-cyan-400' :
                i % 4 === 2 ? 'bg-gradient-to-r from-purple-400 to-pink-400' :
                'bg-gradient-to-r from-yellow-400 to-orange-400'
              } opacity-20 blur-sm`} />
              <div className="absolute inset-0 flex items-center justify-center">
                {i % 4 === 0 ? <Brain className="h-6 w-6 text-emerald-400" /> :
                 i % 4 === 1 ? <Bot className="h-6 w-6 text-blue-400" /> :
                 i % 4 === 2 ? <Gamepad2 className="h-6 w-6 text-purple-400" /> :
                 <Zap className="h-6 w-6 text-yellow-400" />}
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
            <Badge className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30 px-8 py-3 text-lg font-bold backdrop-blur-sm">
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
              <span className="block bg-gradient-to-r from-white via-emerald-300 to-teal-300 bg-clip-text text-transparent">
                LEARN
              </span>
              <motion.span
                animate={{ 
                  backgroundPosition: ['0%', '100%', '0%'],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-[length:200%_100%] bg-clip-text text-transparent"
                style={{ backgroundSize: '200% 100%' }}
              >
                BEYOND
              </motion.span>
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
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
              The world's first <span className="font-bold text-emerald-400">AI-Native</span> learning ecosystem that
              <br />
              <span className="font-bold text-cyan-400">gamifies knowledge</span> and 
              <span className="font-bold text-purple-400"> transforms minds</span>
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
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                  className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-full px-6 py-3 border border-white/10"
                >
                  <stat.icon className="h-4 w-4 text-emerald-400" />
                  <span className="text-white/60">{stat.label}:</span>
                  <span className="text-emerald-400 font-bold">{stat.value}</span>
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
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />
                <Button className="relative bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black px-16 py-8 text-2xl rounded-full shadow-2xl border-4 border-white/20">
                  <Rocket className="mr-4 h-8 w-8" />
                  ENTER THE MATRIX
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.3, 1]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity
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
              <Button variant="outline" className="px-16 py-8 text-2xl rounded-full border-2 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 backdrop-blur-sm bg-white/5">
                <PlayCircle className="mr-4 h-8 w-8" />
                EXPERIENCE DEMO
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

// AI-Powered Features Showcase with 3D Cards
const AIFeaturesShowcase = () => {
  const features = [
    {
      icon: Brain,
      title: "Neural Learning Engine",
      description: "AI that learns how YOU learn, adapting in real-time to your cognitive patterns and optimizing knowledge retention by 340%",
      gradient: "from-blue-600 via-purple-600 to-pink-600",
      stats: "340% faster retention",
      demo: "Live AI analyzing your learning..."
    },
    {
      icon: Gamepad2,
      title: "Knowledge Warfare",
      description: "Battle other learners in real-time knowledge duels, earn XP, unlock achievements, and climb the global leaderboards",
      gradient: "from-red-600 via-orange-600 to-yellow-600",
      stats: "10M+ battles daily",
      demo: "⚔️ CHALLENGER APPROACHING..."
    },
    {
      icon: Bot,
      title: "AI Tutor Army",
      description: "Personal AI tutors for every subject, each with unique personalities, teaching styles, and infinite patience",
      gradient: "from-emerald-600 via-teal-600 to-cyan-600",
      stats: "∞ tutors available",
      demo: "Hello! I'm your Physics AI..."
    },
    {
      icon: Trophy,
      title: "Achievement Universe",
      description: "Unlock legendary achievements, rare badges, and exclusive content as you master skills and knowledge domains",
      gradient: "from-purple-600 via-pink-600 to-rose-600",
      stats: "500+ achievements",
      demo: "🏆 LEGENDARY UNLOCKED!"
    }
  ];

  return (
    <section className="py-32 relative overflow-hidden bg-gradient-to-b from-slate-900 to-black">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-6xl md:text-8xl font-black mb-8 bg-gradient-to-r from-white via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
            SUPERHUMAN
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              LEARNING POWERS
            </span>
          </h2>
          <p className="text-2xl text-white/70 max-w-4xl mx-auto">
            Unlock cognitive abilities you never knew existed
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 100, rotateX: -20 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: index * 0.3, duration: 1.2 }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5,
                z: 50
              }}
              className="group perspective-1000"
            >
              <Card className="relative overflow-hidden h-80 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/20 hover:border-emerald-500/50 transition-all duration-500">
                {/* Animated Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                
                {/* Floating Icon */}
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    delay: index * 0.5
                  }}
                  className="absolute top-6 right-6 z-10"
                >
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center shadow-2xl`}>
                    <feature.icon className="h-10 w-10 text-white" />
                  </div>
                </motion.div>

                <CardContent className="p-8 relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-3xl font-black text-white mb-4 group-hover:text-emerald-300 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-white/80 text-lg leading-relaxed mb-6">
                      {feature.description}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Stats */}
                    <div className="flex items-center justify-between">
                      <Badge className={`bg-gradient-to-r ${feature.gradient} text-white border-none px-4 py-2 font-bold`}>
                        {feature.stats}
                      </Badge>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-emerald-400"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </motion.div>
                    </div>
                    
                    {/* Live Demo Text */}
                    <div className="bg-black/30 rounded-lg p-3 border border-emerald-500/30">
                      <motion.p 
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-emerald-400 font-mono text-sm"
                      >
                        {feature.demo}
                      </motion.p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </section>
  );
};

// Gamification Showcase with Real-time Elements
const GamificationShowcase = () => {
  const [activeLevel, setActiveLevel] = useState(1);
  const [xp, setXp] = useState(1250);
  const [streak, setStreak] = useState(7);

  useEffect(() => {
    const interval = setInterval(() => {
      setXp(prev => prev + Math.floor(Math.random() * 50));
      if (Math.random() < 0.3) {
        setStreak(prev => prev + 1);
      }
      if (xp > 2000 && activeLevel < 5) {
        setActiveLevel(prev => prev + 1);
        setXp(0);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [xp, activeLevel]);

  return (
    <section className="py-32 relative overflow-hidden bg-gradient-to-b from-black via-purple-900/20 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-6xl md:text-8xl font-black mb-8">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              KNOWLEDGE
            </span>
            <br />
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              IS POWER
            </span>
          </h2>
          <p className="text-2xl text-white/70 max-w-4xl mx-auto">
            Level up your mind. Compete globally. Become legendary.
          </p>
        </motion.div>

        {/* Live Gaming Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* XP Counter */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 p-8">
              <div className="text-center">
                <div className="text-6xl font-black text-purple-400 mb-2">
                  {xp.toLocaleString()}
                </div>
                <p className="text-purple-300 text-xl font-bold">XP GAINED</p>
                <div className="mt-4 bg-purple-900/30 rounded-full h-4 overflow-hidden">
                  <motion.div
                    animate={{ width: `${(xp % 2000) / 20}%` }}
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Level Display */}
          <motion.div
            animate={{ rotateY: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-sm border border-yellow-500/30 p-8">
              <div className="text-center">
                <div className="text-6xl font-black text-yellow-400 mb-2">
                  {activeLevel}
                </div>
                <p className="text-yellow-300 text-xl font-bold">LEVEL</p>
                <div className="mt-4 flex justify-center">
                  <Crown className="h-12 w-12 text-yellow-400" />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Streak Counter */}
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Card className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 backdrop-blur-sm border border-emerald-500/30 p-8">
              <div className="text-center">
                <div className="text-6xl font-black text-emerald-400 mb-2">
                  {streak}
                </div>
                <p className="text-emerald-300 text-xl font-bold">DAY STREAK</p>
                <div className="mt-4 flex justify-center">
                  <Flame className="h-12 w-12 text-emerald-400" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Achievement Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-4xl font-black text-white mb-8">LEGENDARY ACHIEVEMENTS</h3>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { name: "Neural Network Master", icon: Brain, rarity: "LEGENDARY", color: "from-purple-500 to-pink-500" },
              { name: "Knowledge Gladiator", icon: Trophy, rarity: "EPIC", color: "from-yellow-500 to-orange-500" },
              { name: "AI Whisperer", icon: Bot, rarity: "RARE", color: "from-blue-500 to-cyan-500" },
              { name: "Speed Learner", icon: Zap, rarity: "UNCOMMON", color: "from-emerald-500 to-teal-500" }
            ].map((achievement, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.1, rotateZ: 5 }}
                className="group"
              >
                <Card className={`w-48 h-64 bg-gradient-to-br ${achievement.color} p-6 relative overflow-hidden cursor-pointer group-hover:shadow-2xl transition-all duration-300`}>
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative z-10 text-center h-full flex flex-col justify-between">
                    <div>
                      <achievement.icon className="h-16 w-16 text-white mx-auto mb-4" />
                      <h4 className="text-white font-bold text-lg mb-2">{achievement.name}</h4>
                    </div>
                    <Badge className="bg-white/20 text-white border-white/30">
                      {achievement.rarity}
                    </Badge>
                  </div>
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-white/20 rounded-lg"
                  />
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Neural Impact Visualization
const NeuralImpactSection = () => {
  const [ref, inView] = useInViewHook({ triggerOnce: true });
  const [counters, setCounters] = useState({ 
    minds: 0, 
    knowledge: 0, 
    achievements: 0, 
    ai_responses: 0 
  });

  useEffect(() => {
    if (inView) {
      const targets = { 
        minds: 250000, 
        knowledge: 50000000, 
        achievements: 1800000, 
        ai_responses: 999999999 
      };
      const duration = 3000;
      const steps = 60;
      const stepDuration = duration / steps;

      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        
        setCounters({
          minds: Math.floor(targets.minds * progress),
          knowledge: Math.floor(targets.knowledge * progress),
          achievements: Math.floor(targets.achievements * progress),
          ai_responses: Math.floor(targets.ai_responses * progress)
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
    { 
      label: "Minds Transformed", 
      value: counters.minds, 
      suffix: "+", 
      icon: Brain,
      gradient: "from-purple-500 to-pink-500"
    },
    { 
      label: "Knowledge Points", 
      value: counters.knowledge, 
      suffix: "+", 
      icon: Lightbulb,
      gradient: "from-yellow-500 to-orange-500"
    },
    { 
      label: "Achievements Unlocked", 
      value: counters.achievements, 
      suffix: "+", 
      icon: Trophy,
      gradient: "from-emerald-500 to-teal-500"
    },
    { 
      label: "AI Responses", 
      value: counters.ai_responses, 
      suffix: "+", 
      icon: Bot,
      gradient: "from-blue-500 to-cyan-500"
    }
  ];

  return (
    <section ref={ref} className="py-32 relative overflow-hidden bg-gradient-to-b from-black via-slate-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-6xl md:text-8xl font-black mb-8">
            <span className="bg-gradient-to-r from-white via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
              GLOBAL
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              DOMINATION
            </span>
          </h2>
          <p className="text-2xl text-white/70 max-w-4xl mx-auto">
            Real numbers. Real impact. Real revolution.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ delay: index * 0.2, duration: 1.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.1, rotateY: 10 }}
            >
              <Card className={`bg-gradient-to-br ${stat.gradient} p-8 relative overflow-hidden group cursor-pointer`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />
                <div className="relative z-10 text-center">
                  <stat.icon className="h-12 w-12 text-white mx-auto mb-4" />
                  <div className="text-4xl md:text-6xl font-black text-white mb-2">
                    {stat.value === 999999999 ? '∞' : stat.value.toLocaleString()}{stat.suffix}
                  </div>
                  <div className="text-white/90 font-bold text-lg">{stat.label}</div>
                </div>
                
                {/* Animated Border */}
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-white/30 rounded-lg"
                />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Final Revolutionary CTA
const RevolutionaryCTA = () => {
  return (
    <section className="py-32 relative overflow-hidden bg-gradient-to-b from-black via-emerald-900/30 to-black">
      {/* Animated Particles */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100, -20],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Epic Icon */}
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity }
            }}
            className="inline-flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 mb-12 shadow-2xl relative"
          >
            <Infinity className="h-20 w-20 text-black" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 blur-xl opacity-50" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            viewport={{ once: true }}
            className="text-7xl md:text-9xl font-black mb-8"
          >
            <span className="bg-gradient-to-r from-white via-emerald-300 to-teal-300 bg-clip-text text-transparent">
              JOIN THE
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              REVOLUTION
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            viewport={{ once: true }}
            className="text-3xl text-white/90 max-w-5xl mx-auto mb-16 leading-relaxed"
          >
            The future of human intelligence starts <span className="font-black text-emerald-400">NOW</span>.
            <br />
            Don't just learn. <span className="font-black text-cyan-400">EVOLVE</span>.
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
                whileHover={{ scale: 1.15, rotateZ: 2 }}
                whileTap={{ scale: 0.95 }}
                className="group relative"
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full blur-2xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                <Button className="relative bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black px-20 py-10 text-3xl rounded-full shadow-2xl border-4 border-white/30">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Rocket className="mr-6 h-10 w-10" />
                  </motion.div>
                  ASCEND NOW
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.3, 1]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity
                    }}
                  >
                    <Crown className="ml-6 h-10 w-10" />
                  </motion.div>
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            viewport={{ once: true }}
            className="mt-20 flex flex-wrap justify-center items-center gap-12 text-white/50"
          >
            {[
              { icon: Shield, text: "Quantum Encrypted" },
              { icon: Globe, text: "Global Network" }, 
              { icon: Infinity, text: "Unlimited Potential" }
            ].map((item, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                className="flex items-center gap-3"
              >
                <item.icon className="h-8 w-8 text-emerald-400" />
                <span className="text-xl font-bold">{item.text}</span>
              </motion.div>
            ))}
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
      {/* Show ModernLayoutHero on large screens and up, RevolutionaryHero on smaller screens */}
      <div className="hidden lg:block">
        <ModernLayoutHero />
      </div>
      <div className="block lg:hidden">
        <RevolutionaryHero />
      </div>
      <AIFeaturesShowcase />
      <GamificationShowcase />
      <NeuralImpactSection />
      <RevolutionaryCTA />
    </div>
  );
};

export default UltraModernLanding;
