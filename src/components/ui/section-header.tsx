import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  delay?: number;
  variant?: 'default' | 'premium' | 'minimal';
}

export const SectionHeader = ({ 
  title, 
  subtitle, 
  className = "",
  titleClassName = "",
  subtitleClassName = "",
  delay = 0,
  variant = 'premium'
}: SectionHeaderProps) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const variants = {
    default: {
      container: "text-center mb-16",
      title: "text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight",
      subtitle: "text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
    },
    premium: {
      container: "text-center mb-20 relative",
      title: "text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight",
      subtitle: "text-xl md:text-2xl text-muted-foreground/80 max-w-4xl mx-auto leading-relaxed"
    },
    minimal: {
      container: "text-center mb-12",
      title: "text-3xl md:text-4xl font-semibold mb-4 leading-tight",
      subtitle: "text-lg text-muted-foreground max-w-2xl mx-auto"
    }
  };

  const currentVariant = variants[variant];

  return (
    <motion.div
      ref={ref}
      className={`${currentVariant.container} ${className}`}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      {/* Premium decorative elements */}
      {variant === 'premium' && (
        <>
          {/* Top decorative line */}
          <motion.div
            className="w-32 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent mx-auto mb-8"
            initial={{ width: 0, opacity: 0 }}
            animate={inView ? { width: 128, opacity: 1 } : {}}
            transition={{ duration: 1, delay: delay + 0.1 }}
          />
          
          {/* Side decorative elements */}
          <motion.div
            className="absolute top-1/2 -left-8 w-16 h-0.5 bg-gradient-to-r from-primary/40 to-transparent"
            initial={{ width: 0, opacity: 0 }}
            animate={inView ? { width: 64, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: delay + 0.3 }}
          />
          <motion.div
            className="absolute top-1/2 -right-8 w-16 h-0.5 bg-gradient-to-l from-primary/40 to-transparent"
            initial={{ width: 0, opacity: 0 }}
            animate={inView ? { width: 64, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: delay + 0.3 }}
          />
        </>
      )}

      {/* Default decorative line */}
      {variant === 'default' && (
        <motion.div
          className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-6 rounded-full"
          initial={{ width: 0 }}
          animate={inView ? { width: 96 } : {}}
          transition={{ duration: 0.8, delay: delay + 0.2 }}
        />
      )}
      
      {/* Title */}
      <motion.h2
        className={`${currentVariant.title} ${titleClassName}`}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: delay + 0.1 }}
      >
        <span className="gradient-text relative inline-block">
          {title}
          {/* Premium animated underline */}
          {variant === 'premium' && (
            <motion.div
              className="absolute -bottom-3 left-0 w-full h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30 rounded-full"
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 1, delay: delay + 0.5 }}
              style={{ transformOrigin: 'left' }}
            />
          )}
          {/* Default animated underline */}
          {variant === 'default' && (
            <motion.div
              className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full"
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.8, delay: delay + 0.4 }}
              style={{ transformOrigin: 'left' }}
            />
          )}
        </span>
      </motion.h2>

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          className={`${currentVariant.subtitle} ${subtitleClassName}`}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: delay + 0.2 }}
        >
          {subtitle}
        </motion.p>
      )}

      {/* Enhanced floating decorative elements */}
      {variant === 'premium' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Large floating particles */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-3 h-3 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full blur-sm"
            animate={{
              y: [0, -30, 0],
              x: [0, 10, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: delay + 0.5,
            }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-2 h-2 bg-gradient-to-br from-secondary/40 to-secondary/20 rounded-full blur-sm"
            animate={{
              y: [0, -25, 0],
              x: [0, -8, 0],
              opacity: [0.4, 0.9, 0.4],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              delay: delay + 0.8,
            }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/3 w-2.5 h-2.5 bg-gradient-to-br from-accent/35 to-accent/15 rounded-full blur-sm"
            animate={{
              y: [0, -35, 0],
              x: [0, 12, 0],
              opacity: [0.35, 0.7, 0.35],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              delay: delay + 1.1,
            }}
          />
          {/* Small sparkle effects */}
          <motion.div
            className="absolute top-1/2 left-1/6 w-1 h-1 bg-primary/60 rounded-full"
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: delay + 1.5,
            }}
          />
          <motion.div
            className="absolute top-2/3 right-1/6 w-1 h-1 bg-secondary/60 rounded-full"
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: delay + 2,
            }}
          />
        </div>
      )}

      {/* Default floating elements */}
      {variant === 'default' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/20 rounded-full"
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: delay + 0.5,
            }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-1 h-1 bg-secondary/30 rounded-full"
            animate={{
              y: [0, -15, 0],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: delay + 0.8,
            }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-accent/25 rounded-full"
            animate={{
              y: [0, -25, 0],
              opacity: [0.25, 0.5, 0.25],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              delay: delay + 1.1,
            }}
          />
        </div>
      )}
    </motion.div>
  );
};
