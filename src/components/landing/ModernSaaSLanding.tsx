
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
  
  const heroInView = useInView(heroRef, { threshold: 0.3 });
  const featuresInView = useInView(featuresRef, { threshold: 0.2 });
  const demoInView = useInView(demoRef, { threshold: 0.3 });

  // Parallax transforms
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '200%']);

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
      image: "👩‍🏫"
    },
    {
      name: "Ahmed Mostafa",
      role: "High School Teacher, Alexandria",
      content: "The gamification elements transformed my classroom. Students are now excited about learning mathematics.",
      rating: 5,
      image: "👨‍🏫"
    },
    {
      name: "Fatima Al-Zahra",
      role: "Educational Director",
      content: "This platform revolutionized how we deliver education. The analytics help us understand our students better.",
      rating: 5,
      image: "👩‍💼"
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="min-h-screen bg-white text-black font-sans overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 z-0">
        <motion.div 
          style={{ y: backgroundY }}
          className="absolute top-0 left-0 w-full h-[120%]"
        >
          {/* Geometric Background Patterns */}
          <div className="absolute top-20 left-10 w-32 h-32 border border-gray-200 rotate-45 opacity-20"></div>
          <div className="absolute top-40 right-20 w-24 h-24 border border-gray-300 rotate-12 opacity-30"></div>
          <div className="absolute bottom-40 left-1/4 w-16 h-16 bg-black opacity-5 rotate-45"></div>
          <div className="absolute top-60 right-1/3 w-20 h-20 border-2 border-gray-400 rounded-full opacity-20"></div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex justify-between items-center p-6 lg:p-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold"
        >
          LMS<span className="text-gray-600">Pro</span>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex space-x-8 text-sm font-medium"
        >
          <a href="#features" className="hover:text-gray-600 transition-colors">Features</a>
          <a href="#demo" className="hover:text-gray-600 transition-colors">Demo</a>
          <a href="#testimonials" className="hover:text-gray-600 transition-colors">Reviews</a>
        </motion.div>
        <motion.button 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black text-white px-6 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Get Started
        </motion.button>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-40 px-6 lg:px-8 pt-20 lg:pt-32 pb-20">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            style={{ y: textY }}
            className="space-y-8"
          >
            {/* Animated Headline */}
            <div className="space-y-4">
              <motion.h1 
                className="text-5xl lg:text-7xl xl:text-8xl font-bold leading-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: heroInView ? 1 : 0 }}
              >
                <span className="block">{displayedText}</span>
                <motion.span 
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="inline-block w-1 h-16 lg:h-20 xl:h-24 bg-black ml-2"
                />
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: heroInView ? 1 : 0, y: heroInView ? 0 : 20 }}
                transition={{ delay: 3 }}
                className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              >
                Transform education with AI-powered personalization and game-like engagement. 
                Built for the modern Egyptian classroom.
              </motion.p>
            </div>

            {/* Demo Placeholder */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: heroInView ? 1 : 0, y: heroInView ? 0 : 40 }}
              transition={{ delay: 3.5 }}
              className="relative mt-16"
            >
              <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-lg p-8 lg:p-16 mx-auto max-w-4xl">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg transform rotate-1"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center h-64 lg:h-80 border-2 border-dashed border-gray-600 rounded-lg">
                    <div className="text-center text-white">
                      <Play className="w-16 h-16 mx-auto mb-4 opacity-60" />
                      <h3 className="text-2xl font-bold mb-2">Fucking Demo Image</h3>
                      <p className="text-gray-400">Interactive LMS Preview Coming Soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: heroInView ? 1 : 0, y: heroInView ? 0 : 20 }}
              transition={{ delay: 4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
            >
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group bg-black text-white px-8 py-4 text-lg font-semibold hover:bg-gray-800 transition-all duration-300 flex items-center justify-center"
              >
                See It Live
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-black text-black px-8 py-4 text-lg font-semibold hover:bg-black hover:text-white transition-all duration-300"
              >
                Watch Demo
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="relative z-40 py-24 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: featuresInView ? 1 : 0, y: featuresInView ? 0 : 40 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              Revolutionary Learning Experience
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge features designed to transform how Egyptian students learn and teachers teach.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: featuresInView ? 1 : 0, y: featuresInView ? 0 : 40 }}
                transition={{ delay: index * 0.2 }}
                className="group"
              >
                <div className="bg-white p-8 lg:p-12 border-l-4 border-black hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className="flex items-start space-x-6">
                    <div className="bg-black text-white p-4 group-hover:bg-gray-800 transition-colors">
                      <feature.icon className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                      <p className="text-gray-600 text-lg mb-4 leading-relaxed">{feature.description}</p>
                      <p className="text-sm text-gray-500">{feature.details}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-40 py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to transform your educational experience</p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gray-300 hidden lg:block"></div>

            {steps.map((step, index) => (
              <motion.div 
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.3 }}
                className={`relative flex items-center mb-16 ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Timeline Node */}
                <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-black rounded-full border-4 border-white z-10"></div>

                {/* Content */}
                <div className={`lg:w-5/12 ${index % 2 === 0 ? 'lg:pr-16' : 'lg:pl-16'}`}>
                  <div className="bg-white p-8 border border-gray-200 hover:border-black transition-colors">
                    <div className="flex items-center mb-6">
                      <div className="bg-black text-white p-3 mr-4">
                        <step.icon className="w-6 h-6" />
                      </div>
                      <span className="text-6xl font-bold text-gray-200">{step.number}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                    <p className="text-gray-600 text-lg">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Showcase Section */}
      <section id="demo" ref={demoRef} className="relative z-40 py-24 lg:py-32 bg-black text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: demoInView ? 1 : 0, y: demoInView ? 0 : 40 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">See It In Action</h2>
            <p className="text-xl text-gray-400">Experience the future of education</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: demoInView ? 1 : 0, scale: demoInView ? 1 : 0.8 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-8 lg:p-16 border border-gray-700">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center border border-gray-600">
                    <div className="text-center">
                      <Zap className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                      <h3 className="text-2xl font-bold mb-2">Interactive Demo</h3>
                      <p className="text-gray-400">Live platform preview</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
                    <h4 className="font-bold mb-2">Real-time Progress</h4>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: demoInView ? "75%" : 0 }}
                        transition={{ delay: 1, duration: 2 }}
                        className="bg-white h-2 rounded-full"
                      ></motion.div>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">75% Course Completion</p>
                  </div>
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-600">
                    <h4 className="font-bold mb-2">Achievement Unlocked</h4>
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-6 h-6 text-yellow-400" />
                      <span className="text-sm">Mathematics Master</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-40 py-24 lg:py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              Trusted by Egyptian Educators
            </h2>
            <p className="text-xl text-gray-600">
              See how we're transforming education across Egypt
            </p>
          </motion.div>

          {/* Testimonial Carousel */}
          <div className="relative">
            <motion.div 
              key={currentTestimonial}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-white p-8 lg:p-16 border-l-4 border-black max-w-4xl mx-auto"
            >
              <div className="flex mb-6">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-2xl lg:text-3xl font-medium mb-8 leading-relaxed">
                "{testimonials[currentTestimonial].content}"
              </blockquote>
              <div className="flex items-center">
                <div className="text-4xl mr-4">{testimonials[currentTestimonial].image}</div>
                <div>
                  <div className="font-bold text-lg">{testimonials[currentTestimonial].name}</div>
                  <div className="text-gray-600">{testimonials[currentTestimonial].role}</div>
                </div>
              </div>
            </motion.div>

            {/* Testimonial Indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-black' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-40 py-24 lg:py-32 bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <h2 className="text-4xl lg:text-6xl font-bold leading-tight">
              Join Egypt's Educational Revolution
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Transform your classroom with AI-powered personalization and gamified learning. 
              Start your journey today.
            </p>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group bg-white text-black px-12 py-6 text-xl font-bold hover:bg-gray-200 transition-all duration-300 flex items-center justify-center mx-auto"
            >
              Get Started Now
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <div className="flex items-center justify-center space-x-8 mt-12 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Free 30-day trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Setup in 5 minutes</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-40 bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-2xl font-bold mb-4">LMSPro</h3>
              <p className="text-gray-400">Egypt's first AI-gamified learning management system.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <div className="space-y-2 text-gray-400">
                <div>Features</div>
                <div>Pricing</div>
                <div>Demo</div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <div className="space-y-2 text-gray-400">
                <div>About</div>
                <div>Careers</div>
                <div>Contact</div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <div className="space-y-2 text-gray-400">
                <div>Help Center</div>
                <div>Documentation</div>
                <div>Status</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">&copy; 2024 LMSPro. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0 text-gray-400">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernSaaSLanding;
