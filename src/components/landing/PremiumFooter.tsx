import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Heart,
  Sparkles,
  Star,
  ArrowUp,
  Globe,
  BookOpen,
  Users,
  Trophy,
  Gamepad2,
  Brain,
  Target,
  Zap,
  Crown,
  Shield,
  Award,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PoliciesModal from './PoliciesModal';

import { PLATFORM_NAME } from '@/data/constants';

const PremiumFooter: React.FC = () => {
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);
  const [activePolicyTab, setActivePolicyTab] = useState('terms');
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePolicyLink = (tab: string) => {
    setActivePolicyTab(tab);
    setShowPoliciesModal(true);
  };

  const footerSections = [
    {
      title: 'Platform',
      icon: <BookOpen className="w-5 h-5" />,
      links: [
        { name: 'AI Tutoring', href: '/features/ai-tutoring', icon: <Brain className="w-4 h-4" /> },
        { name: 'Quiz Battles', href: '/features/quiz-battles', icon: <Gamepad2 className="w-4 h-4" /> },
        { name: 'Achievements', href: '/features/achievements', icon: <Trophy className="w-4 h-4" /> },
        { name: 'Leaderboards', href: '/features/leaderboards', icon: <Crown className="w-4 h-4" /> },
        { name: 'Study Groups', href: '/features/study-groups', icon: <Users className="w-4 h-4" /> },
      ]
    },
    {
      title: 'Learning',
      icon: <Target className="w-5 h-5" />,
      links: [
        { name: 'Math Courses', href: '/courses/math', icon: <Zap className="w-4 h-4" /> },
        { name: 'Science Courses', href: '/courses/science', icon: <Star className="w-4 h-4" /> },
        { name: 'Language Courses', href: '/courses/language', icon: <Globe className="w-4 h-4" /> },
        { name: 'Test Prep', href: '/courses/test-prep', icon: <Award className="w-4 h-4" /> },
        { name: 'Skill Building', href: '/courses/skills', icon: <Shield className="w-4 h-4" /> },
      ]
    },
    {
      title: 'Company',
      icon: <Users className="w-5 h-5" />,
      links: [
        { name: 'About Us', href: '/about', icon: <Heart className="w-4 h-4" /> },
        { name: 'Our Mission', href: '/mission', icon: <Target className="w-4 h-4" /> },
        { name: 'Careers', href: '/careers', icon: <Sparkles className="w-4 h-4" /> },
        { name: 'Press Kit', href: '/press', icon: <Award className="w-4 h-4" /> },
        { name: 'Contact', href: '/contact', icon: <Mail className="w-4 h-4" /> },
      ]
    },
    {
      title: 'Support',
      icon: <Shield className="w-5 h-5" />,
      links: [
        { name: 'Help Center', href: '/help', icon: <Globe className="w-4 h-4" /> },
        { name: 'Documentation', href: '/docs', icon: <BookOpen className="w-4 h-4" /> },
        { name: 'Community', href: '/community', icon: <Users className="w-4 h-4" /> },
        { name: 'Bug Reports', href: '/bugs', icon: <Shield className="w-4 h-4" /> },
        { name: 'Feature Requests', href: '/features', icon: <Sparkles className="w-4 h-4" /> },
      ]
    }
  ];

  const socialLinks = [
    { 
      name: 'Facebook', 
      href: 'https://facebook.com', 
      icon: <Facebook className="w-5 h-5" />,
      color: 'hover:text-blue-400'
    },
    { 
      name: 'Twitter', 
      href: 'https://twitter.com', 
      icon: <Twitter className="w-5 h-5" />,
      color: 'hover:text-sky-400'
    },
    { 
      name: 'Instagram', 
      href: 'https://instagram.com', 
      icon: <Instagram className="w-5 h-5" />,
      color: 'hover:text-pink-400'
    },
    { 
      name: 'LinkedIn', 
      href: 'https://linkedin.com', 
      icon: <Linkedin className="w-5 h-5" />,
      color: 'hover:text-blue-500'
    },
    { 
      name: 'YouTube', 
      href: 'https://youtube.com', 
      icon: <Youtube className="w-5 h-5" />,
      color: 'hover:text-red-500'
    },
  ];

  const contactInfo = [
    {
      icon: <Mail className="w-5 h-5" />,
      label: 'Email',
             value: `hello@${PLATFORM_NAME.toLowerCase()}.com`,
             href: `mailto:hello@${PLATFORM_NAME.toLowerCase()}.com`
    },
    {
      icon: <Phone className="w-5 h-5" />,
      label: 'Phone',
      value: '+20 123 456 789',
      href: 'tel:+20123456789'
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: 'Location',
      value: 'Cairo, Egypt',
      href: 'https://maps.google.com'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-background via-muted/5 to-background">
      {/* Premium Background Effects */}
      <div className="absolute inset-0">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-background/80" />
        
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(var(--primary),0.1)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(var(--secondary),0.08)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(var(--accent),0.03)_50%,transparent_75%)]" />
        </div>

        {/* Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${20 + (i * 12)}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4 + i,
              repeatType: "loop",
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          >
            <div className={`w-2 h-2 rounded-full ${
              i % 3 === 0 ? 'bg-primary/30' :
              i % 3 === 1 ? 'bg-secondary/30' : 'bg-accent/30'
            }`} />
          </motion.div>
        ))}
      </div>

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-6 py-20"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-6 gap-12 mb-16">
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            {/* Logo and Brand */}
            <div className="space-y-4">
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary via-secondary to-accent p-0.5">
                    <div className="w-full h-full rounded-xl bg-background flex items-center justify-center">
                      <Crown className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                  </div>
                </div>
                <div>
                                     <h2 className="text-2xl font-black gradient-text">{PLATFORM_NAME}</h2>
                  <div className="flex items-center gap-1">
                    <Badge className="text-xs px-2 py-0.5" variant='default'>
                      <Star className="w-3 h-3 mr-1" />
                      PREMIUM
                    </Badge>
                  </div>
                </div>
              </motion.div>

              <p className="text-lg font-semibold text-foreground leading-relaxed">
                The world's first AI-native learning ecosystem that gamifies knowledge and transforms minds.
              </p>

              <p className="text-muted-foreground leading-relaxed">
                Experience revolutionary education with cutting-edge technology, 
                competitive learning, and personalized AI tutoring that makes studying addictive.
              </p>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Get in Touch
              </h3>
              {contactInfo.map((contact, index) => (
                <motion.a
                  key={index}
                  href={contact.href}
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                  whileHover={{ x: 4 }}
                  target={contact.href.startsWith('http') ? '_blank' : '_self'}
                  rel={contact.href.startsWith('http') ? 'noopener noreferrer' : ''}
                >
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    {contact.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{contact.label}</div>
                    <div className="text-sm">{contact.value}</div>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Navigation Sections */}
          {footerSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              variants={itemVariants}
              className="space-y-6"
            >
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 text-primary">
                  {section.icon}
                </div>
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={link.name}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Link
                        to={link.href}
                        className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                      >
                        <div className="p-1 rounded text-primary/60 group-hover:text-primary transition-colors">
                          {link.icon}
                        </div>
                        <span className="group-hover:font-medium transition-all">
                          {link.name}
                        </span>
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>



        {/* Bottom Section */}
        <motion.div
          variants={itemVariants}
          className="border-t border-border/50 pt-8"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Copyright */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <p className="text-muted-foreground text-center sm:text-left">
                                 © 2024 {PLATFORM_NAME}.
              </p>
                             <div className="flex items-center gap-4 text-sm">
                 <button 
                   onClick={() => handlePolicyLink('privacy')} 
                   className="text-muted-foreground hover:text-primary transition-colors"
                 >
                   Privacy Policy
                 </button>
                 <span className="text-border">•</span>
                 <button 
                   onClick={() => handlePolicyLink('terms')} 
                   className="text-muted-foreground hover:text-primary transition-colors"
                 >
                   Terms of Service
                 </button>
                 <span className="text-border">•</span>
                 <button 
                   onClick={() => handlePolicyLink('help')} 
                   className="text-muted-foreground hover:text-primary transition-colors"
                 >
                   Help Center
                 </button>
               </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground font-medium">Follow us:</span>
              <div className="flex items-center gap-2">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3 rounded-xl bg-muted/50 text-muted-foreground transition-all hover:scale-110 hover:shadow-lg ${social.color}`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

             {/* Scroll to Top Button */}
       <motion.button
         onClick={scrollToTop}
         className="fixed bottom-8 right-8 p-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white shadow-2xl hover:shadow-primary/25 transition-all z-50"
         whileHover={{ scale: 1.1, rotate: -5 }}
         whileTap={{ scale: 0.9 }}
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 1 }}
       >
         <ArrowUp className="w-6 h-6" />
       </motion.button>

       {/* Policies Modal */}
       <PoliciesModal
         isOpen={showPoliciesModal}
         onClose={() => setShowPoliciesModal(false)}
         initialTab={activePolicyTab}
       />
     </footer>
   );
 };

export default PremiumFooter;
