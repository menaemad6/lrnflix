
import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  Brain, 
  Trophy, 
  BarChart3, 
  Smartphone, 
  ArrowRight, 
  Play,
  CheckCircle,
  Star,
  Users,
  Target,
  Zap
} from 'lucide-react';

const ModernSaaSLanding = () => {
  const { scrollYProgress } = useScroll();
  const [currentStep, setCurrentStep] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const demoRef = useRef(null);
  const testimonialsRef = useRef(null);
  
  const heroInView = useInView(heroRef, { once: false });
  const featuresInView = useInView(featuresRef, { once: false });
  const demoInView = useInView(demoRef, { once: false });
  const testimonialsInView = useInView(testimonialsRef, { once: false });

  // Advanced parallax transforms
  const heroParallax = useTransform(scrollYProgress, [0, 0.3], [0, -50]);
  const featuresParallax = useTransform(scrollYProgress, [0.2, 0.6], [100, -100]);
  const demoParallax = useTransform(scrollYProgress, [0.4, 0.8], [50, -150]);
  const testimonialsParallax = useTransform(scrollYProgress, [0.6, 1], [0, -100]);
  
  // 3D floating objects parallax
  const float1Y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const float2Y = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const float3Y = useTransform(scrollYProgress, [0, 1], [0, -150]);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Smart tutoring that adapts to each student's learning pace and style",
      details: "Advanced algorithms analyze learning patterns and provide personalized recommendations"
    },
    {
      icon: Trophy,
      title: "Gamified Experience",
      description: "Achievement system that makes learning addictive and rewarding",
      details: "Points, badges, leaderboards, and quests transform education into an engaging game"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Comprehensive insights for teachers and administrators",
      details: "Track progress, identify learning gaps, and optimize educational outcomes"
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Seamless learning experience across all devices",
      details: "Responsive design optimized for smartphones, tablets, and desktops"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Sign Up & Profile",
      description: "Create your account and set learning preferences",
      icon: Users
    },
    {
      number: "02", 
      title: "AI Assessment",
      description: "Our AI analyzes your knowledge and creates personalized paths",
      icon: Brain
    },
    {
      number: "03",
      title: "Start Learning",
      description: "Begin your gamified journey with quests and achievements",
      icon: Target
    }
  ];

  const testimonials = [
    {
      name: "Dr. Amira Hassan",
      role: "Mathematics Professor, Cairo University",
      content: "Student engagement increased by 340% after implementing this platform. The AI tutoring is revolutionary.",
      rating: 5,
      image: "👩‍🏫",
      size: "large"
    },
    {
      name: "Ahmed Mostafa",
      role: "High School Teacher, Alexandria",
      content: "The gamification elements transformed my classroom. Students are now excited about learning mathematics.",
      rating: 5,
      image: "👨‍🏫",
      size: "medium"
    },
    {
      name: "Fatima Al-Zahra",
      role: "Educational Director",
      content: "This platform revolutionized how we deliver education. The analytics help us understand our students better.",
      rating: 5,
      image: "👩‍💼",
      size: "small"
    },
    {
      name: "Omar Khalil",
      role: "Student, American University",
      content: "Learning has never been this fun! The AI voice tutor feels like having a personal mentor available 24/7.",
      rating: 5,
      image: "👨‍🎓",
      size: "medium"
    },
    {
      name: "Nour Abdel Rahman",
      role: "Training Coordinator",
      content: "Our corporate training programs saw a 250% improvement in completion rates using this LMS.",
      rating: 5,
      image: "👩‍💻",
      size: "large"
    }
  ];

  // Typewriter effect for hero title
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

  // Organic Wave Separator Component
  const WaveSeparator = ({ flip = false }) => (
    <div className={`relative w-full ${flip ? 'transform rotate-180' : ''}`}>
      <svg 
        viewBox="0 0 1200 120" 
        preserveAspectRatio="none" 
        className="w-full h-16 lg:h-24"
      >
        <motion.path 
          d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
          fill="currentColor"
          className="text-white"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );

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

  return (
    <div className="min-h-screen bg-white text-black font-sans overflow-hidden relative">
      
      {/* Hero Section with 3D Background */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* 3D Abstract Background Objects */}
        <div className="absolute inset-0 z-0">
          {/* Large Floating Sphere */}
          <motion.div 
            style={{ y: float1Y }}
            className="absolute top-20 right-20 w-64 h-64 opacity-5"
          >
            <FloatingObject delay={0}>
              <div className="w-full h-full rounded-full bg-gradient-to-br from-black via-gray-800 to-black blur-xl"></div>
            </FloatingObject>
          </motion.div>

          {/* Medium Glassmorphism Blob */}
          <motion.div 
            style={{ y: float2Y }}
            className="absolute bottom-32 left-16 w-48 h-48 opacity-10"
          >
            <FloatingObject delay={2}>
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-black/20 via-gray-500/30 to-black/20 backdrop-blur-lg border border-black/10"></div>
            </FloatingObject>
          </motion.div>

          {/* Small Geometric Shape */}
          <motion.div 
            style={{ y: float3Y }}
            className="absolute top-1/2 left-1/4 w-32 h-32 opacity-8"
          >
            <FloatingObject delay={4}>
              <div className="w-full h-full transform rotate-45 bg-gradient-to-br from-gray-200 to-gray-400 rounded-lg"></div>
            </FloatingObject>
          </motion.div>

          {/* Additional floating elements */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              style={{ y: useTransform(scrollYProgress, [0, 1], [0, -100 - i * 20]) }}
              className={`absolute w-4 h-4 bg-black rounded-full opacity-20`}
              style={{
                top: `${20 + i * 15}%`,
                left: `${10 + i * 12}%`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <motion.div 
          style={{ y: heroParallax }}
          className="relative z-10 text-center max-w-6xl mx-auto px-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: heroInView ? 1 : 0, y: heroInView ? 0 : 100 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Animated Headline */}
            <div className="space-y-4">
              <motion.h1 
                className="text-6xl lg:text-8xl xl:text-9xl font-black leading-tight"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: heroInView ? 1 : 0, scale: heroInView ? 1 : 0.8 }}
                transition={{ duration: 1.2, delay: 0.3 }}
              >
                <span className="block bg-gradient-to-r from-black via-gray-700 to-black bg-clip-text text-transparent">
                  {displayedText}
                </span>
                <motion.span 
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="inline-block w-2 h-20 lg:h-24 xl:h-28 bg-black ml-4"
                />
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: heroInView ? 1 : 0, y: heroInView ? 0 : 50 }}
                transition={{ delay: 3.5, duration: 0.8 }}
                className="text-2xl lg:text-3xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light"
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
              className="flex flex-col sm:flex-row gap-6 justify-center mt-16"
            >
              <motion.button 
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}
                whileTap={{ scale: 0.95 }}
                className="group relative bg-black text-white px-12 py-6 text-xl font-bold overflow-hidden transition-all duration-500"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center">
                  See It Live
                  <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </motion.button>
              
              <motion.button 
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: "rgba(0, 0, 0, 0.05)"
                }}
                whileTap={{ scale: 0.95 }}
                className="border-3 border-black text-black px-12 py-6 text-xl font-bold hover:bg-black hover:text-white transition-all duration-500"
              >
                Watch Demo
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Wave Separator */}
      <div className="relative bg-black">
        <WaveSeparator />
      </div>

      {/* Enhanced Features Section */}
      <section id="features" ref={featuresRef} className="relative py-32 bg-black text-white overflow-hidden">
        <motion.div 
          style={{ y: featuresParallax }}
          className="max-w-7xl mx-auto px-6 lg:px-8"
        >
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: featuresInView ? 1 : 0, y: featuresInView ? 0 : 100 }}
            transition={{ duration: 1 }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl lg:text-7xl font-black mb-8 bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
              Revolutionary Learning Experience
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto font-light">
              Cutting-edge features designed to transform how Egyptian students learn and teachers teach.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                animate={{ 
                  opacity: featuresInView ? 1 : 0, 
                  x: featuresInView ? 0 : (index % 2 === 0 ? -100 : 100)
                }}
                transition={{ delay: index * 0.3, duration: 0.8 }}
                className="group"
              >
                <motion.div 
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 25px 50px -12px rgba(255, 255, 255, 0.1)"
                  }}
                  className="bg-white/5 backdrop-blur-lg p-10 lg:p-14 border border-white/10 hover:border-white/30 transition-all duration-500"
                >
                  <div className="flex items-start space-x-8">
                    <motion.div 
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="bg-white text-black p-6 group-hover:bg-gray-100 transition-colors duration-300"
                    >
                      <feature.icon className="w-10 h-10" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold mb-6 text-white">{feature.title}</h3>
                      <p className="text-gray-300 text-xl mb-6 leading-relaxed">{feature.description}</p>
                      <p className="text-lg text-gray-400 leading-relaxed">{feature.details}</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Wave Separator */}
      <div className="relative bg-white">
        <WaveSeparator flip />
      </div>

      {/* Enhanced How It Works Section */}
      <section className="relative py-32 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl lg:text-7xl font-black mb-8 text-black">How It Works</h2>
            <p className="text-2xl text-gray-600 font-light">Simple steps to transform your educational experience</p>
          </motion.div>

          <div className="relative">
            {/* Animated Timeline Line */}
            <motion.div 
              className="absolute left-1/2 transform -translate-x-px h-full w-1 bg-gradient-to-b from-black via-gray-500 to-black hidden lg:block"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              style={{ originY: 0 }}
            />

            {steps.map((step, index) => (
              <motion.div 
                key={step.number}
                initial={{ 
                  opacity: 0, 
                  x: index % 2 === 0 ? -100 : 100,
                  scale: 0.8
                }}
                whileInView={{ 
                  opacity: 1, 
                  x: 0,
                  scale: 1
                }}
                transition={{ 
                  delay: index * 0.4,
                  duration: 0.8,
                  type: "spring",
                  stiffness: 100
                }}
                className={`relative flex items-center mb-20 ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Enhanced Timeline Node */}
                <motion.div 
                  className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-black rounded-full border-4 border-white z-10 shadow-lg"
                  whileInView={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: index * 0.4 + 0.5, duration: 0.6 }}
                />

                {/* Enhanced Content */}
                <div className={`lg:w-5/12 ${index % 2 === 0 ? 'lg:pr-20' : 'lg:pl-20'}`}>
                  <motion.div 
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                    }}
                    className="bg-white p-10 border-2 border-gray-100 hover:border-black transition-all duration-500 shadow-lg"
                  >
                    <div className="flex items-center mb-8">
                      <motion.div 
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="bg-black text-white p-4 mr-6"
                      >
                        <step.icon className="w-8 h-8" />
                      </motion.div>
                      <span className="text-8xl font-black text-gray-200">{step.number}</span>
                    </div>
                    <h3 className="text-3xl font-bold mb-6 text-black">{step.title}</h3>
                    <p className="text-gray-600 text-xl leading-relaxed">{step.description}</p>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Wave Separator */}
      <div className="relative bg-black">
        <WaveSeparator />
      </div>

      {/* Enhanced Demo Section */}
      <section id="demo" ref={demoRef} className="relative py-32 bg-black text-white overflow-hidden">
        <motion.div 
          style={{ y: demoParallax }}
          className="max-w-7xl mx-auto px-6 lg:px-8"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: demoInView ? 1 : 0, scale: demoInView ? 1 : 0.8 }}
            transition={{ duration: 1 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl lg:text-7xl font-black mb-8 bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
              See It In Action
            </h2>
            <p className="text-2xl text-gray-300 font-light">Experience the future of education</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: demoInView ? 1 : 0, y: demoInView ? 0 : 100 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-lg p-12 lg:p-20 border border-white/20 shadow-2xl">
              <div className="grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="aspect-video bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-lg flex items-center justify-center border border-gray-700 overflow-hidden"
                  >
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        <Zap className="w-20 h-20 mx-auto mb-6 text-white" />
                      </motion.div>
                      <h3 className="text-3xl font-bold mb-4 text-white">Interactive Demo</h3>
                      <p className="text-gray-300 text-lg">Live platform preview</p>
                    </div>
                  </motion.div>
                </div>
                <div className="space-y-8">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-black/50 backdrop-blur-sm p-8 rounded-lg border border-white/10"
                  >
                    <h4 className="font-bold mb-4 text-xl text-white">Real-time Progress</h4>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: demoInView ? "75%" : 0 }}
                        transition={{ delay: 1.5, duration: 2 }}
                        className="bg-white h-3 rounded-full"
                      />
                    </div>
                    <p className="text-gray-300 mt-4">75% Course Completion</p>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-black/50 backdrop-blur-sm p-8 rounded-lg border border-white/10"
                  >
                    <h4 className="font-bold mb-4 text-xl text-white">Achievement Unlocked</h4>
                    <div className="flex items-center space-x-3">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Trophy className="w-8 h-8 text-white" />
                      </motion.div>
                      <span className="text-gray-300">Mathematics Master</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Wave Separator */}
      <div className="relative bg-white">
        <WaveSeparator flip />
      </div>

      {/* Enhanced Staggered Testimonials Section */}
      <section id="testimonials" ref={testimonialsRef} className="relative py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: testimonialsInView ? 1 : 0, y: testimonialsInView ? 0 : 80 }}
            transition={{ duration: 1 }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl lg:text-7xl font-black mb-8 text-black">
              Trusted by Egyptian Educators
            </h2>
            <p className="text-2xl text-gray-600 font-light">
              See how we're transforming education across Egypt
            </p>
          </motion.div>

          {/* Staggered Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {testimonials.map((testimonial, index) => {
              const sizeClasses = {
                large: "md:col-span-2 lg:col-span-1 lg:row-span-2",
                medium: "md:col-span-1",
                small: "md:col-span-1"
              };
              
              const rotations = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2', 'rotate-0'];
              const rotation = rotations[index % rotations.length];

              return (
                <motion.div
                  key={testimonial.name}
                  initial={{ 
                    opacity: 0, 
                    y: 100,
                    scale: 0.8,
                    rotate: index % 2 === 0 ? -10 : 10
                  }}
                  animate={{ 
                    opacity: testimonialsInView ? 1 : 0, 
                    y: testimonialsInView ? 0 : 100,
                    scale: testimonialsInView ? 1 : 0.8,
                    rotate: testimonialsInView ? 0 : (index % 2 === 0 ? -10 : 10)
                  }}
                  transition={{ 
                    delay: index * 0.2, 
                    duration: 0.8,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    rotate: index % 2 === 0 ? 2 : -2,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                    y: -10
                  }}
                  className={`
                    ${sizeClasses[testimonial.size]} 
                    ${rotation}
                    bg-white p-8 lg:p-10 
                    border-2 border-gray-100 hover:border-black 
                    shadow-xl hover:shadow-2xl 
                    transition-all duration-500 
                    cursor-pointer
                    ${testimonial.size === 'large' ? 'lg:p-12' : ''}
                  `}
                >
                  {/* Rating Stars */}
                  <div className="flex mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: testimonialsInView ? 1 : 0 }}
                        transition={{ delay: index * 0.2 + i * 0.1 + 0.5 }}
                      >
                        <Star className="w-6 h-6 text-black fill-current" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Testimonial Content */}
                  <blockquote className={`
                    font-medium mb-8 leading-relaxed text-black
                    ${testimonial.size === 'large' ? 'text-2xl lg:text-3xl' : 'text-xl lg:text-2xl'}
                  `}>
                    "{testimonial.content}"
                  </blockquote>

                  {/* Author Info */}
                  <div className="flex items-center">
                    <motion.div 
                      className="text-4xl mr-4"
                      whileHover={{ scale: 1.2, rotate: 10 }}
                    >
                      {testimonial.image}
                    </motion.div>
                    <div>
                      <div className="font-bold text-xl text-black">{testimonial.name}</div>
                      <div className="text-gray-600 text-lg">{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Wave Separator */}
      <div className="relative bg-black">
        <WaveSeparator />
      </div>

      {/* Enhanced Final CTA Section */}
      <section className="relative py-32 bg-black text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-20"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.2, 0.6, 0.2],
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

        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="space-y-12"
          >
            <h2 className="text-5xl lg:text-7xl font-black leading-tight bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
              Join Egypt's Educational Revolution
            </h2>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
              Transform your classroom with AI-powered personalization and gamified learning. 
              Start your journey today.
            </p>
            
            <motion.button 
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 25px 50px -12px rgba(255, 255, 255, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              className="group relative bg-white text-black px-16 py-8 text-2xl font-black overflow-hidden transition-all duration-500"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10 flex items-center">
                Get Started Now
                <ArrowRight className="ml-4 w-8 h-8 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </motion.button>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="flex flex-wrap items-center justify-center gap-8 mt-16 text-gray-400"
            >
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-white" />
                <span className="text-lg">Free 30-day trial</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-white" />
                <span className="text-lg">No credit card required</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-white" />
                <span className="text-lg">Setup in 5 minutes</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="relative bg-white text-black py-20 border-t-2 border-black">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-3xl font-black mb-6">LMSPro</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Egypt's first AI-gamified learning management system.</p>
            </motion.div>
            {['Product', 'Company', 'Support'].map((title, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <h4 className="font-bold text-xl mb-6 text-black">{title}</h4>
                <div className="space-y-4 text-gray-600 text-lg">
                  <div className="hover:text-black transition-colors cursor-pointer">Features</div>
                  <div className="hover:text-black transition-colors cursor-pointer">Pricing</div>
                  <div className="hover:text-black transition-colors cursor-pointer">Demo</div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="border-t-2 border-black pt-12 flex flex-col md:flex-row justify-between items-center"
          >
            <p className="text-gray-600 text-lg">&copy; 2024 LMSPro. All rights reserved.</p>
            <div className="flex space-x-8 mt-6 md:mt-0 text-gray-600 text-lg">
              <span className="hover:text-black transition-colors cursor-pointer">Privacy</span>
              <span className="hover:text-black transition-colors cursor-pointer">Terms</span>
              <span className="hover:text-black transition-colors cursor-pointer">Cookies</span>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default ModernSaaSLanding;
