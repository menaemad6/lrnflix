
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, BookOpen, Users, Award, ExternalLink, ChevronDown, Sparkles, Zap, Trophy, Play, Clock, TrendingUp, Target, Rocket, Globe, Brain, Heart, CheckCircle, ArrowRight, MousePointer, Code, Palette, Database as LucideDatabase, Shield, MessageSquare, Wand2, Hexagon, Triangle, Square, Circle, Send, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PremiumCourseCard } from '@/components/courses/PremiumCourseCard';
import type { Database } from '@/integrations/supabase/types';

const TeacherLanding = () => {
  const { teacher, loading } = useTenant();
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const aiSectionRef = useRef<HTMLDivElement>(null);
  const geometryRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  
  type CourseWithCount = Database['public']['Tables']['courses']['Row'] & { enrollment_count: number };
  const [courses, setCourses] = useState<CourseWithCount[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');
  const navigate = useNavigate();

  // Advanced scroll animations with geometrical transformations
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollPercent = scrollY / (document.body.scrollHeight - window.innerHeight);
      
      // Hero parallax with rotation
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${scrollY * 0.4}px) rotateX(${scrollY * 0.02}deg)`;
      }
      
      // Floating geometrical shapes
      if (geometryRef.current) {
        const shapes = geometryRef.current.querySelectorAll('.geometry-shape');
        shapes.forEach((shape, index) => {
          const element = shape as HTMLElement;
          const speed = 0.005 + (index * 0.002);
          const rotation = scrollY * speed * 50;
          const float = Math.sin(scrollY * speed + index) * 30;
          const scale = 1 + Math.sin(scrollY * speed + index) * 0.2;
          
          element.style.transform = `
            translateY(${float}px) 
            rotate(${rotation}deg) 
            scale(${scale})
            rotateY(${scrollY * speed * 20}deg)
          `;
        });
      }

      // Advanced stats section animations
      if (statsRef.current) {
        const cards = statsRef.current.querySelectorAll('.stat-card');
        cards.forEach((card, index) => {
          const element = card as HTMLElement;
          const offset = Math.sin(scrollY * 0.008 + index * 0.5) * 20;
          const rotateY = Math.sin(scrollY * 0.006 + index) * 3;
          const scale = 1 + Math.sin(scrollY * 0.004 + index) * 0.05;
          
          element.style.transform = `
            translateY(${offset}px) 
            rotateY(${rotateY}deg) 
            scale(${scale})
            perspective(1000px)
          `;
        });
      }

      // Course cards with wave animation
      if (featuredRef.current) {
        const courseCards = featuredRef.current.querySelectorAll('.course-card');
        courseCards.forEach((card, index) => {
          const element = card as HTMLElement;
          const wave = Math.cos(scrollY * 0.008 + index * 0.8) * 15;
          const tilt = Math.sin(scrollY * 0.005 + index) * 2;
          
          element.style.transform = `
            translateY(${wave}px) 
            rotateX(${tilt}deg) 
            rotateZ(${tilt * 0.5}deg)
          `;
        });
      }

      // AI section with pulsing effect
      if (aiSectionRef.current) {
        const pulse = 1 + Math.sin(scrollY * 0.01) * 0.03;
        const glow = Math.sin(scrollY * 0.015) * 0.5 + 0.5;
        aiSectionRef.current.style.transform = `scale(${pulse})`;
        aiSectionRef.current.style.filter = `brightness(${1 + glow * 0.1})`;
      }

      // Skills section morphing
      if (skillsRef.current) {
        const skillItems = skillsRef.current.querySelectorAll('.skill-item');
        skillItems.forEach((item, index) => {
          const element = item as HTMLElement;
          const morph = Math.sin(scrollY * 0.01 + index * 0.3) * 10;
          const skew = Math.cos(scrollY * 0.008 + index * 0.4) * 2;
          
          element.style.transform = `
            translateX(${morph}px) 
            skewY(${skew}deg) 
            rotateZ(${morph * 0.2}deg)
          `;
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Enhanced intersection observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          entry.target.classList.remove('opacity-0', 'translate-y-20');
          
          // Add staggered animation for children
          const children = entry.target.querySelectorAll('.stagger-child');
          children.forEach((child, index) => {
            setTimeout(() => {
              child.classList.add('animate-fade-in');
              child.classList.remove('opacity-0', 'translate-y-10');
            }, index * 100);
          });
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.scroll-animate');
    animatedElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [teacher]);

  // Fetch courses
  useEffect(() => {
    if (!teacher?.user_id) return;
    setCoursesLoading(true);
    supabase
      .from('courses')
      .select('*')
      .eq('instructor_id', teacher.user_id)
      .order('created_at', { ascending: false })
      .then(async ({ data, error }) => {
        if (!error && data) {
          const coursesWithCounts = await Promise.all(
            data.map(async (course) => {
              const { count } = await supabase
                .from('enrollments')
                .select('*', { count: 'exact', head: true })
                .eq('course_id', course.id);
              return { ...course, enrollment_count: count || 0 };
            })
          );
          setCourses(coursesWithCounts);
        }
        setCoursesLoading(false);
      });
  }, [teacher?.user_id]);

  // AI Insight Generator using Gemini
  const generateAiInsight = async () => {
    if (!userPrompt.trim()) return;
    
    setAiLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not found');
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `As ${teacher?.display_name || 'an expert instructor'}, provide a detailed insight about: ${userPrompt}. Make it educational, inspiring, and related to learning and personal development. Keep it engaging and under 200 words.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate insight');
      }

      const data = await response.json();
      const insight = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate an insight at this time.';
      setAiInsight(insight);
    } catch (error) {
      console.error('Error generating AI insight:', error);
      setAiInsight('Sorry, I could not generate an insight at this time. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-30"></div>
        <div className="relative z-10">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-primary shadow-2xl"></div>
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-glow"></div>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-destructive/10 relative">
        <div className="absolute inset-0 mesh-gradient opacity-20"></div>
        <div className="text-center space-y-6 relative z-10">
          <div className="relative mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-muted/50 to-muted/80 flex items-center justify-center shadow-2xl">
            <ExternalLink className="w-12 h-12 text-muted-foreground" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 animate-pulse"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text">Teacher not found</h1>
          <p className="text-xl text-muted-foreground max-w-md">This teacher page does not exist or has been moved.</p>
        </div>
      </div>
    );
  }

  const socialLinks = teacher.social_links ? 
    (typeof teacher.social_links === 'string' ? 
      JSON.parse(teacher.social_links) : teacher.social_links) : {};

  const achievements = [
    { icon: Trophy, label: "Industry Awards", value: "15+", color: "from-yellow-400 to-orange-500" },
    { icon: Users, label: "Students Worldwide", value: "50K+", color: "from-blue-400 to-purple-500" },
    { icon: BookOpen, label: "Courses Created", value: "120+", color: "from-green-400 to-teal-500" },
    { icon: Star, label: "Average Rating", value: "4.9", color: "from-pink-400 to-red-500" },
    { icon: Globe, label: "Countries Reached", value: "85+", color: "from-indigo-400 to-blue-500" },
    { icon: Brain, label: "Hours of Content", value: "500+", color: "from-purple-400 to-pink-500" }
  ];

  const skills = [
    { icon: Code, name: "Programming", level: 95, color: "from-blue-500 to-cyan-500" },
    { icon: Palette, name: "Design", level: 88, color: "from-pink-500 to-rose-500" },
    { icon: LucideDatabase, name: "Data Science", level: 92, color: "from-green-500 to-emerald-500" },
    { icon: Shield, name: "Security", level: 87, color: "from-red-500 to-orange-500" },
    { icon: MessageSquare, name: "Communication", level: 96, color: "from-purple-500 to-violet-500" },
    { icon: Wand2, name: "Innovation", level: 94, color: "from-yellow-500 to-amber-500" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer at Google",
      content: "This instructor completely transformed my career. The depth of knowledge and teaching style is unmatched. I went from junior to senior developer in just 6 months!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
      company: "Google"
    },
    {
      name: "Mike Chen",
      role: "Full Stack Developer",
      content: "The courses are incredibly well-structured with real-world projects. I built a portfolio that landed me my dream job. Highly recommend to anyone serious about coding.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      company: "Microsoft"
    },
    {
      name: "Emily Davis",
      role: "Tech Lead at Spotify",
      content: "Outstanding content delivery and mentorship. The practical approach to learning complex concepts made everything click. Best investment in my career!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      company: "Spotify"
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Advanced Dynamic Background with Geometrical Shapes */}
      <div ref={geometryRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Animated Mesh Background */}
        <div className="absolute inset-0 mesh-gradient opacity-60"></div>
        
        {/* Floating Geometrical Shapes */}
        <div className="geometry-shape absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl animate-float"></div>
        <div className="geometry-shape absolute top-1/3 right-20 w-32 h-32 bg-gradient-to-br from-accent/20 to-secondary/20 transform rotate-45 blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="geometry-shape absolute bottom-20 left-1/4 w-20 h-20 bg-gradient-to-br from-secondary/20 to-primary/20 clip-path-triangle blur-xl animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="geometry-shape absolute top-1/2 left-1/2 w-28 h-28 bg-gradient-to-br from-primary/15 to-accent/15 rounded-lg rotate-12 blur-2xl animate-float" style={{ animationDelay: '6s' }}></div>
        
        {/* Hexagonal Grid Overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern id="hexagons" x="0" y="0" width="100" height="87" patternUnits="userSpaceOnUse">
                <polygon points="50,1 93,25 93,62 50,86 7,62 7,25" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexagons)" />
          </svg>
        </div>
      </div>

      {/* Ultra Modern Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div ref={heroRef} className="absolute inset-0 -z-10">
          {teacher.cover_image_url && (
            <div 
              className="absolute inset-0 bg-cover bg-center scale-110 opacity-20"
              style={{ backgroundImage: `url(${teacher.cover_image_url})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/50 to-background/90"></div>
            </div>
          )}
        </div>

        <div className="relative z-10 w-full px-8 text-center">
          <div className="max-w-7xl mx-auto space-y-16">
            {/* Ultra Modern Avatar with 3D Effect */}
            <div className="relative inline-block group perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary rounded-full blur-3xl animate-pulse-glow opacity-60 scale-125"></div>
              <div className="absolute -inset-8 bg-gradient-conic from-primary via-accent via-secondary to-primary rounded-full blur-2xl animate-spin" style={{ animationDuration: '12s' }}></div>
              
              <Avatar className="relative w-56 h-56 border-4 border-primary/40 shadow-2xl hover:scale-110 transition-all duration-700 group-hover:rotate-y-12 transform-gpu">
                <AvatarImage src={teacher.profile_image_url || ''} alt={teacher.display_name} />
                <AvatarFallback className="text-7xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  {teacher.display_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* 3D Floating Elements */}
              <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center animate-bounce shadow-2xl transform rotate-12">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center animate-pulse shadow-2xl transform -rotate-12">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="absolute top-1/3 -left-12 w-10 h-10 bg-gradient-to-br from-primary/80 to-accent/80 rounded-full flex items-center justify-center animate-float shadow-2xl">
                <Star className="w-5 h-5 text-white" />
              </div>
            </div>
            
            {/* Dynamic Title with Text Effects */}
            <div className="space-y-10">
              <h1 className="text-7xl md:text-9xl lg:text-[12rem] font-black gradient-text leading-none animate-fade-in tracking-tighter transform-gpu">
                {teacher.display_name}
              </h1>
              
              {teacher.specialization && (
                <div className="flex justify-center">
                  <Badge variant="secondary" className="text-3xl px-12 py-6 bg-gradient-to-r from-primary/30 to-accent/30 border-primary/40 hover:from-primary/40 hover:to-accent/40 transition-all duration-500 shadow-2xl backdrop-blur-xl">
                    <Rocket className="w-8 h-8 mr-4" />
                    {teacher.specialization}
                  </Badge>
                </div>
              )}
              
              {teacher.bio && (
                <p className="text-3xl md:text-4xl lg:text-5xl max-w-6xl mx-auto text-muted-foreground leading-relaxed animate-fade-in font-light">
                  {teacher.bio}
                </p>
              )}
              
              {teacher.experience_years && (
                <div className="flex items-center justify-center space-x-4 text-3xl text-primary font-bold">
                  <Trophy className="w-10 h-10" />
                  <span>{teacher.experience_years}+ years of teaching excellence</span>
                  <Target className="w-10 h-10" />
                </div>
              )}
            </div>
            
            {/* Ultra Modern CTAs */}
            <div className="flex flex-col sm:flex-row gap-10 justify-center items-center mt-20">
              <Link to="/courses">
                <Button size="lg" className="btn-primary text-3xl px-16 py-10 hover:scale-110 transition-all duration-500 shadow-2xl hover:shadow-primary/40 group transform-gpu">
                  <BookOpen className="w-10 h-10 mr-4 group-hover:rotate-12 transition-transform" />
                  Explore My Universe
                  <ArrowRight className="w-10 h-10 ml-4 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
              {teacher.website_url && (
                <a href={teacher.website_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg" className="btn-secondary text-3xl px-16 py-10 hover:scale-110 transition-all duration-500 shadow-xl group">
                    <Globe className="w-10 h-10 mr-4 group-hover:rotate-12 transition-transform" />
                    Visit Website
                    <ExternalLink className="w-10 h-10 ml-4 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse scale-150"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-2xl">
              <ChevronDown className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* Revolutionary Stats Grid with 3D Effects */}
      <section ref={statsRef} className="relative py-48 bg-gradient-to-b from-background to-muted/10">
        <div className="max-w-8xl mx-auto px-8">
          <div className="text-center mb-32 scroll-animate opacity-0 translate-y-20">
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-black gradient-text mb-12">
              Teaching Revolution
            </h2>
            <p className="text-3xl md:text-4xl text-muted-foreground max-w-5xl mx-auto leading-relaxed">
              Transforming lives through education with proven results that speak louder than words
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="stat-card scroll-animate opacity-0 translate-y-20 text-center group cursor-pointer transform-gpu"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="relative mx-auto w-32 h-32 mb-10 perspective-1000">
                  <div className={`absolute inset-0 bg-gradient-to-br ${achievement.color} rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700 rotate-45 scale-110`}></div>
                  <div className={`relative w-full h-full bg-gradient-to-br ${achievement.color} rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-y-12 transition-all duration-700 shadow-2xl transform-gpu`}>
                    <achievement.icon className="w-16 h-16 text-white drop-shadow-lg" />
                  </div>
                </div>
                <h3 className="text-5xl lg:text-6xl font-black gradient-text mb-6 group-hover:scale-110 transition-transform transform-gpu">
                  {achievement.value}
                </h3>
                <p className="text-xl text-muted-foreground font-semibold">{achievement.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI-Powered Insights Section */}
      <section ref={aiSectionRef} className="relative py-48 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-20 scroll-animate opacity-0 translate-y-20">
            <div className="inline-flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-2xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-6xl md:text-7xl font-black gradient-text">
                AI-Powered Insights
              </h2>
            </div>
            <p className="text-2xl md:text-3xl text-muted-foreground max-w-4xl mx-auto">
              Get personalized learning insights powered by advanced AI
            </p>
          </div>

          <Card className="glass-card hover-glow border-primary/30 scroll-animate opacity-0 translate-y-20">
            <CardContent className="p-12">
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Ask me anything about learning, skills, or career development..."
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && generateAiInsight()}
                      className="w-full px-6 py-4 text-xl bg-background/50 border border-primary/30 rounded-2xl focus:outline-none focus:border-primary transition-all duration-300"
                    />
                  </div>
                  <Button
                    onClick={generateAiInsight}
                    disabled={aiLoading || !userPrompt.trim()}
                    className="btn-primary text-xl px-8 py-4 group"
                  >
                    {aiLoading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white" />
                    ) : (
                      <>
                        <Send className="w-6 h-6 mr-2 group-hover:translate-x-1 transition-transform" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>

                {aiInsight && (
                  <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 border border-primary/20">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold gradient-text mb-2">AI Insight</h3>
                        <p className="text-lg text-muted-foreground leading-relaxed">{aiInsight}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Skills Mastery Section with Morphing Animations */}
      <section ref={skillsRef} className="relative py-48 bg-gradient-to-b from-background to-muted/10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-32 scroll-animate opacity-0 translate-y-20">
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-black gradient-text mb-12">
              Skills Mastery
            </h2>
            <p className="text-3xl md:text-4xl text-muted-foreground max-w-5xl mx-auto">
              Expertise across multiple domains with proven track record
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="skill-item scroll-animate opacity-0 translate-y-20 stagger-child group cursor-pointer transform-gpu"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card className="glass-card hover-glow border-primary/20 group-hover:border-primary/40 transition-all duration-700 h-full transform-gpu group-hover:scale-105">
                  <CardContent className="p-10">
                    <div className="flex items-center space-x-6 mb-8">
                      <div className={`w-16 h-16 bg-gradient-to-br ${skill.color} rounded-2xl flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-all duration-500`}>
                        <skill.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-foreground">{skill.name}</h3>
                        <p className="text-lg text-muted-foreground">Expert Level</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Proficiency</span>
                        <span className="text-2xl font-bold gradient-text">{skill.level}%</span>
                      </div>
                      <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`absolute top-0 left-0 h-full bg-gradient-to-r ${skill.color} rounded-full transition-all duration-1000 shadow-lg`}
                          style={{ width: `${skill.level}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Showcase */}
      <section ref={featuredRef} className="relative py-48 bg-gradient-to-b from-muted/10 to-background">
        <div className="max-w-8xl mx-auto px-8">
          <div className="text-center mb-32 scroll-animate opacity-0 translate-y-20">
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-black gradient-text mb-12">
              Featured Courses
            </h2>
            <p className="text-3xl md:text-4xl text-muted-foreground max-w-5xl mx-auto">
              Handpicked courses designed to accelerate your learning journey into the future
            </p>
          </div>
          
          {coursesLoading ? (
            <div className="flex justify-center items-center py-32">
              <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-primary"></div>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center text-muted-foreground py-32 text-2xl">No courses found for this instructor.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
              {courses.map((course, index) => (
                <div
                  key={course.id}
                  className="course-card group cursor-pointer scroll-animate stagger-child transform-gpu"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <PremiumCourseCard
                    id={course.id}
                    title={course.title}
                    description={course.description || ''}
                    category={course.category || ''}
                    status={course.status || 'published'}
                    instructor_name={teacher.display_name}
                    enrollment_count={course.enrollment_count}
                    is_enrolled={false}
                    enrollment_code={course.enrollment_code || ''}
                    cover_image_url={course.cover_image_url || undefined}
                    created_at={course.created_at}
                    price={course.price}
                    onPreview={() => navigate(`/courses/${course.id}`)}
                    onEnroll={() => navigate(`/courses/${course.id}`)}
                  />
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-20 scroll-animate opacity-0 translate-y-20">
            <Link to="/courses">
              <Button size="lg" className="btn-primary text-2xl px-12 py-8 hover:scale-105 transition-all duration-300 shadow-2xl group">
                <BookOpen className="w-8 h-8 mr-3 group-hover:rotate-12 transition-transform" />
                Explore All {courses.length} Courses
                <TrendingUp className="w-8 h-8 ml-3 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials */}
      <section ref={testimonialsRef} className="relative py-48 bg-gradient-to-b from-background to-muted/10">
        <div className="max-w-8xl mx-auto px-8">
          <div className="text-center mb-32 scroll-animate opacity-0 translate-y-20">
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-black gradient-text mb-12">
              Success Stories
            </h2>
            <p className="text-3xl md:text-4xl text-muted-foreground max-w-5xl mx-auto">
              Real transformations from students who chose excellence and achieved greatness
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="scroll-animate opacity-0 translate-y-20 stagger-child group transform-gpu"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <Card className="glass-card hover-glow border-primary/20 group-hover:border-primary/40 transition-all duration-700 h-full group-hover:scale-105 transform-gpu">
                  <CardContent className="p-12 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-10">
                      <div className="flex items-center space-x-6">
                        <Avatar className="w-20 h-20 border-2 border-primary/30 shadow-2xl">
                          <AvatarImage src={testimonial.image} alt={testimonial.name} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xl">
                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="text-2xl font-bold text-foreground">{testimonial.name}</h4>
                          <p className="text-lg text-muted-foreground">{testimonial.role}</p>
                          <p className="text-primary font-semibold text-lg">{testimonial.company}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    
                    <blockquote className="text-muted-foreground italic flex-1 text-xl leading-relaxed group-hover:text-foreground transition-colors duration-500">
                      "{testimonial.content}"
                    </blockquote>

                    <div className="flex items-center mt-8 pt-8 border-t border-primary/20">
                      <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                      <span className="text-lg text-muted-foreground">Verified Success Story</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ultimate CTA Section */}
      <section className="relative py-48 bg-gradient-to-br from-primary/10 via-accent/10 to-background overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-40"></div>
        <div className="max-w-7xl mx-auto text-center px-8 scroll-animate opacity-0 translate-y-20 relative z-10">
          <div className="space-y-16">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-3xl opacity-40 animate-pulse-glow scale-150"></div>
              <h2 className="relative text-6xl md:text-7xl lg:text-8xl font-black gradient-text">
                Ready to Transform Your Future?
              </h2>
            </div>
            
            <p className="text-3xl md:text-4xl mb-20 text-muted-foreground max-w-5xl mx-auto leading-relaxed">
              Join thousands of students who have revolutionized their careers with {teacher.display_name}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-10 justify-center items-center">
              <Link to="/courses">
                <Button size="lg" className="btn-primary text-4xl px-20 py-12 hover:scale-110 transition-all duration-500 shadow-2xl hover:shadow-primary/40 group transform-gpu">
                  <Rocket className="w-12 h-12 mr-4 group-hover:rotate-12 transition-transform" />
                  Start Your Journey
                  <Sparkles className="w-12 h-12 ml-4 group-hover:rotate-12 transition-transform" />
                </Button>
              </Link>
              
              <div className="flex items-center space-x-4 text-muted-foreground">
                <MousePointer className="w-8 h-8" />
                <span className="text-2xl">No commitment required</span>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mt-24 pt-16 border-t border-primary/20">
              <div className="text-center stagger-child">
                <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-xl text-muted-foreground">30-Day Money Back</p>
              </div>
              <div className="text-center stagger-child">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-xl text-muted-foreground">Lifetime Access</p>
              </div>
              <div className="text-center stagger-child">
                <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <p className="text-xl text-muted-foreground">Community Support</p>
              </div>
              <div className="text-center stagger-child">
                <Award className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-xl text-muted-foreground">Certificate Included</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Links */}
      {Object.keys(socialLinks).length > 0 && (
        <section className="relative py-32 bg-muted/5">
          <div className="max-w-5xl mx-auto px-8">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-black gradient-text mb-6">Connect With Me</h3>
              <p className="text-muted-foreground text-2xl">Follow my journey and get the latest updates</p>
            </div>
            
            <div className="flex justify-center space-x-12 scroll-animate opacity-0 translate-y-20">
              {socialLinks.website && (
                <a 
                  href={socialLinks.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center hover:scale-110 hover:rotate-6 transition-all duration-500 shadow-2xl hover:shadow-primary/30 transform-gpu">
                    <Globe className="w-12 h-12 text-white group-hover:rotate-12 transition-transform" />
                  </div>
                </a>
              )}
              {socialLinks.linkedin && (
                <a 
                  href={socialLinks.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center hover:scale-110 hover:rotate-6 transition-all duration-500 shadow-2xl hover:shadow-blue-500/30 transform-gpu">
                    <span className="text-white font-bold text-3xl group-hover:rotate-12 transition-transform">in</span>
                  </div>
                </a>
              )}
              {socialLinks.twitter && (
                <a 
                  href={socialLinks.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-sky-500 to-sky-600 rounded-3xl flex items-center justify-center hover:scale-110 hover:rotate-6 transition-all duration-500 shadow-2xl hover:shadow-sky-500/30 transform-gpu">
                    <span className="text-white font-bold text-3xl group-hover:rotate-12 transition-transform">𝕏</span>
                  </div>
                </a>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default TeacherLanding;
