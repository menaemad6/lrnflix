
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
  Infinity
} from 'lucide-react';

// Floating geometric elements
const FloatingGeometry = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${5 + i * 6}%`,
            top: `${10 + (i % 5) * 20}%`,
          }}
          animate={{
            y: [-50, 50, -50],
            x: [-30, 30, -30],
            rotate: [0, 180, 360],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 10 + i * 0.7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4,
          }}
        >
          <div className={`${
            i % 4 === 0 ? 'w-2 h-2' :
            i % 4 === 1 ? 'w-3 h-3' :
            i % 4 === 2 ? 'w-4 h-4' : 'w-5 h-5'
          } ${
            i % 3 === 0 ? 'bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full' :
            i % 3 === 1 ? 'bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rotate-45' :
            'bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-sm'
          } blur-sm`} />
        </motion.div>
      ))}
    </div>
  );
};

// Hero Section Component
const HeroSection = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 100]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <motion.section 
      style={{ opacity }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background/90 to-primary/5"
    >
      <FloatingGeometry />
      
      {/* Main Hero Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-center"
        >
          {/* Floating Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-8"
          >
            <Badge className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30 px-6 py-2 text-sm font-medium backdrop-blur-sm">
              <Sparkles className="mr-2 h-4 w-4" />
              Next-Gen Learning Platform
            </Badge>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8 tracking-tight"
          >
            Your{' '}
            <span className="gradient-text">Next-Level</span>
            <br />
            Learning Starts{' '}
            <motion.span
              animate={{ 
                backgroundPosition: ['0%', '100%', '0%'],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-[length:200%_100%] bg-clip-text text-transparent"
            >
              Here
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="text-xl md:text-2xl text-foreground/70 max-w-4xl mx-auto mb-12 leading-relaxed"
          >
            Experience the future of education with AI-powered learning, 
            immersive content, and personalized pathways that adapt to your unique journey.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link to="/auth/signup">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="group"
              >
                <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold px-12 py-6 text-lg rounded-full shadow-2xl hover:shadow-emerald-500/50 transition-all duration-500">
                  Start Your Journey
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </motion.div>
                </Button>
              </motion.div>
            </Link>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="outline" size="lg" className="px-12 py-6 text-lg rounded-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 backdrop-blur-sm">
                <PlayCircle className="mr-3 h-5 w-5" />
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Floating Course Cards */}
        <motion.div style={{ y: y1 }} className="absolute top-20 left-10 opacity-60">
          <Card className="glass-card w-64 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold">AI Fundamentals</h4>
                <p className="text-sm text-foreground/60">4.9 ★ • 1.2k students</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div style={{ y: y2 }} className="absolute top-40 right-10 opacity-60">
          <Card className="glass-card w-64 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold">Web Development</h4>
                <p className="text-sm text-foreground/60">4.8 ★ • 2.1k students</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.section>
  );
};

// Feature Showcase Component
const FeatureShowcase = () => {
  const features = [
    {
      icon: Bot,
      title: "AI Study Assistant",
      description: "Personalized AI tutor that adapts to your learning style and provides instant help.",
      gradient: "from-blue-500 to-purple-500"
    },
    {
      icon: Gamepad2,
      title: "Gamified Quizzes",
      description: "Interactive challenges and competitions that make learning addictive.",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      icon: Video,
      title: "Smart Video Playback",
      description: "Adaptive streaming with AI-powered highlights and note-taking.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Award,
      title: "Digital Certificates",
      description: "Blockchain-verified certificates that showcase your achievements.",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            Features That{' '}
            <span className="gradient-text">Revolutionize</span>
            <br />Learning
          </h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Cutting-edge tools and technologies that transform how you learn, practice, and grow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              className="group"
            >
              <Card className="glass-card p-8 h-full hover-glow transition-all duration-500 cursor-pointer">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-foreground/70 text-lg leading-relaxed">{feature.description}</p>
                <motion.div
                  className="mt-6 flex items-center text-emerald-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  whileHover={{ x: 5 }}
                >
                  Explore Feature
                  <ChevronRight className="ml-2 h-5 w-5" />
                </motion.div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Teachers Spotlight Component
const TeachersSpotlight = () => {
  const teachers = [
    {
      name: "Dr. Sarah Chen",
      subject: "Machine Learning",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200",
      rating: 4.9,
      students: "15.2k",
      quote: "Making AI accessible to everyone"
    },
    {
      name: "Prof. Marcus Johnson",
      subject: "Web Development",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
      rating: 4.8,
      students: "23.1k",
      quote: "Code is poetry in motion"
    },
    {
      name: "Dr. Elena Rodriguez",
      subject: "Data Science",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
      rating: 4.9,
      students: "18.7k",
      quote: "Data tells the most amazing stories"
    },
    {
      name: "Prof. David Kim",
      subject: "UI/UX Design",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
      rating: 4.7,
      students: "12.3k",
      quote: "Design shapes the future"
    }
  ];

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            Learn From{' '}
            <span className="gradient-text">World-Class</span>
            <br />Educators
          </h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Our expert instructors are industry leaders, researchers, and passionate educators.
          </p>
        </motion.div>

        <div className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide">
          {teachers.map((teacher, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2, duration: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="flex-shrink-0 w-80"
            >
              <Card className="glass-card p-8 h-full hover-glow">
                <div className="relative mb-6">
                  <img
                    src={teacher.avatar}
                    alt={teacher.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-emerald-500/30"
                  />
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    <Crown className="inline h-3 w-3 mr-1" />
                    Expert
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">{teacher.name}</h3>
                  <p className="text-emerald-400 font-semibold mb-4">{teacher.subject}</p>
                  
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="ml-1 font-semibold">{teacher.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-emerald-400" />
                      <span className="ml-1">{teacher.students}</span>
                    </div>
                  </div>
                  
                  <blockquote className="text-foreground/70 italic">
                    "{teacher.quote}"
                  </blockquote>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Become a Teacher CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Button size="lg" variant="outline" className="px-8 py-4 text-lg rounded-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 backdrop-blur-sm">
            <GraduationCap className="mr-3 h-5 w-5" />
            Become a Teacher
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

// Courses Discovery Component
const CoursesDiscovery = () => {
  const [activeCategory, setActiveCategory] = useState('Design');
  const categories = ['Design', 'Development', 'Data Science', 'AI/ML', 'Business'];

  const courses = {
    'Design': [
      { title: "Advanced UI/UX Design", students: "2.1k", rating: 4.9, image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400", live: true },
      { title: "Motion Graphics Mastery", students: "1.8k", rating: 4.8, image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400", trending: true }
    ],
    'Development': [
      { title: "Full-Stack React Development", students: "3.2k", rating: 4.9, image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400", live: true },
      { title: "Advanced JavaScript Patterns", students: "2.7k", rating: 4.8, image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400", trending: true }
    ],
    'Data Science': [
      { title: "Python for Data Analysis", students: "4.1k", rating: 4.9, image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400", live: true },
      { title: "Machine Learning Fundamentals", students: "3.8k", rating: 4.8, image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400", trending: true }
    ],
    'AI/ML': [
      { title: "Deep Learning with TensorFlow", students: "2.9k", rating: 4.9, image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400", live: true },
      { title: "Natural Language Processing", students: "2.2k", rating: 4.8, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", trending: true }
    ],
    'Business': [
      { title: "Digital Marketing Strategy", students: "3.5k", rating: 4.7, image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400", live: true },
      { title: "Product Management Essentials", students: "2.8k", rating: 4.8, image: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=400", trending: true }
    ]
  };

  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            Discover Your{' '}
            <span className="gradient-text">Next</span>
            <br />Learning Adventure
          </h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto mb-12">
            Join thousands of learners exploring cutting-edge courses designed for the future.
          </p>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setActiveCategory(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeCategory === category
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black'
                    : 'bg-white/5 text-foreground/70 hover:bg-white/10 border border-emerald-500/30'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Live Learning Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex items-center justify-center mb-16"
        >
          <div className="flex items-center bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full px-6 py-3 backdrop-blur-sm">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-3 h-3 bg-red-500 rounded-full mr-3"
            />
            <span className="text-red-400 font-semibold">Live: 1,247 students learning right now</span>
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
            {courses[activeCategory as keyof typeof courses].map((course, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                whileHover={{ scale: 1.03, y: -10 }}
                className="group cursor-pointer"
              >
                <Card className="glass-card overflow-hidden hover-glow">
                  <div className="relative">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    {/* Status Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      {course.live && (
                        <Badge className="bg-red-500/90 text-white border-none">
                          <Flame className="mr-1 h-3 w-3" />
                          Live
                        </Badge>
                      )}
                      {course.trending && (
                        <Badge className="bg-emerald-500/90 text-black border-none">
                          <TrendingUp className="mr-1 h-3 w-3" />
                          Trending
                        </Badge>
                      )}
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                      >
                        <Play className="h-8 w-8 text-white ml-1" />
                      </motion.div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-emerald-400 transition-colors duration-300">
                      {course.title}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                          <span className="font-semibold">{course.rating}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-emerald-400 mr-1" />
                          <span>{course.students}</span>
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

// Student Impact Component
const StudentImpact = () => {
  const [ref, inView] = useInViewHook({ triggerOnce: true });
  const [counters, setCounters] = useState({ courses: 0, students: 0, certificates: 0, satisfaction: 0 });

  useEffect(() => {
    if (inView) {
      const targets = { courses: 50000, students: 250000, certificates: 180000, satisfaction: 98 };
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;

      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        
        setCounters({
          courses: Math.floor(targets.courses * progress),
          students: Math.floor(targets.students * progress),
          certificates: Math.floor(targets.certificates * progress),
          satisfaction: Math.floor(targets.satisfaction * progress)
        });

        if (step >= steps) {
          clearInterval(timer);
          setCounters(targets);
        }
      }, stepDuration);

      return () => clearInterval(timer);
    }
  }, [inView]);

  const statItems = [
    { label: "Courses Completed", value: counters.courses, suffix: "+", icon: CheckCircle2 },
    { label: "Active Students", value: counters.students, suffix: "+", icon: Users },
    { label: "Certificates Earned", value: counters.certificates, suffix: "+", icon: Award },
    { label: "Satisfaction Rate", value: counters.satisfaction, suffix: "%", icon: Star }
  ];

  return (
    <section ref={ref} className="py-32 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            Transforming{' '}
            <span className="gradient-text">Lives</span>
            <br />Globally
          </h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Real impact, real results. See how our platform is changing the way the world learns.
          </p>
        </motion.div>

        {/* Impact Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {statItems.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Card className="glass-card p-8 hover-glow">
                <div className="text-emerald-400 mb-4 flex justify-center">
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="text-4xl md:text-5xl font-bold mb-2 gradient-text">
                  {stat.value.toLocaleString()}{stat.suffix}
                </div>
                <div className="text-foreground/70 font-medium">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Testimonial Video Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="glass-card p-2 max-w-4xl mx-auto hover-glow group cursor-pointer">
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800"
                alt="Student testimonial"
                className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                >
                  <Play className="h-10 w-10 text-white ml-1" />
                </motion.div>
              </div>
              
              {/* Floating Testimonial Quote */}
              <div className="absolute bottom-8 left-8 right-8">
                <blockquote className="text-white text-xl font-semibold text-center">
                  "This platform didn't just teach me skills – it transformed my entire career trajectory."
                </blockquote>
                <cite className="text-white/80 text-center block mt-2">- Sarah M., Software Engineer</cite>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

// Interactive Demo Section
const InteractiveDemo = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const demoTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Target },
    { id: 'course', label: 'Course View', icon: BookOpen },
    { id: 'quiz', label: 'Quiz Mode', icon: Gamepad2 },
    { id: 'ai', label: 'AI Assistant', icon: Bot }
  ];

  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            Experience the{' '}
            <span className="gradient-text">Platform</span>
            <br />Interactive Demo
          </h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Take a virtual tour of our platform and see how learning comes alive with our innovative features.
          </p>
        </motion.div>

        {/* Demo Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {demoTabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black'
                  : 'bg-white/5 text-foreground/70 hover:bg-white/10 border border-emerald-500/30'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Demo Interface */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <Card className="glass-card p-8 hover-glow">
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl p-8 min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-8 text-white">
                  {React.createElement(demoTabs.find(tab => tab.id === activeTab)!.icon, { className: "h-16 w-16" })}
                </div>
                <h3 className="text-3xl font-bold mb-4">
                  {demoTabs.find(tab => tab.id === activeTab)?.label} Demo
                </h3>
                <p className="text-foreground/70 text-lg mb-8 max-w-md mx-auto">
                  Interactive demo showing the {demoTabs.find(tab => tab.id === activeTab)?.label.toLowerCase()} experience.
                </p>
                <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold">
                  <Play className="mr-2 h-5 w-5" />
                  Launch Interactive Demo
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

// Final CTA Section
const FinalCTA = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10" />
      <FloatingGeometry />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Animated Icon */}
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 3, repeat: Infinity }
            }}
            className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 mb-12 shadow-2xl mx-auto"
          >
            <Infinity className="h-16 w-16 text-black" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
            viewport={{ once: true }}
            className="text-6xl md:text-8xl font-bold mb-8"
          >
            Join Thousands of{' '}
            <span className="gradient-text">Learners</span>
            <br />Building Their Future
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            viewport={{ once: true }}
            className="text-2xl text-foreground/70 max-w-4xl mx-auto mb-16"
          >
            Don't just learn—transform. Start your journey with the most advanced learning platform on the planet.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 1 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link to="/auth/signup">
              <motion.div
                whileHover={{ scale: 1.1, y: -10 }}
                whileTap={{ scale: 0.95 }}
                className="group relative"
              >
                {/* Confetti effect on hover */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300 animate-pulse" />
                <Button size="lg" className="relative bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold px-16 py-8 text-xl rounded-full shadow-2xl">
                  Start Learning Today
                  <motion.div
                    animate={{ 
                      rotate: [0, 180, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Sparkles className="ml-4 h-6 w-6" />
                  </motion.div>
                </Button>
              </motion.div>
            </Link>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="outline" size="lg" className="px-16 py-8 text-xl rounded-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 backdrop-blur-sm">
                <Calendar className="mr-3 h-6 w-6" />
                Book a Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            viewport={{ once: true }}
            className="mt-16 flex flex-wrap justify-center items-center gap-8 text-foreground/50"
          >
            <div className="flex items-center">
              <Shield className="h-6 w-6 mr-2 text-emerald-400" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-6 w-6 mr-2 text-emerald-400" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center">
              <Globe className="h-6 w-6 mr-2 text-emerald-400" />
              <span>Global Community</span>
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
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <HeroSection />
      <FeatureShowcase />
      <TeachersSpotlight />
      <CoursesDiscovery />
      <StudentImpact />
      <InteractiveDemo />
      <FinalCTA />
    </div>
  );
};

export default UltraModernLanding;
