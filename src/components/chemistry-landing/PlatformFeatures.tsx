import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';

// Lazy load images for better performance
const feature_1 = '/pola/feature-1.png';
const feature_2 = '/pola/feature-2.png';
const feature_3 = '/pola/feature-3.png';

// Features will be moved inside component to use translations

// Optimized image component with lazy loading
const LazyFeatureImage = ({ src, alt, className }: { src: string; alt: string; className: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const { ref } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    onChange: (inView) => setIsInView(inView)
  });

  useEffect(() => {
    if (isInView && !isLoaded) {
      const img = new Image();
      img.onload = () => setIsLoaded(true);
      img.src = src;
    }
  }, [isInView, isLoaded, src]);

  return (
    <div ref={ref} className={className}>
      {isLoaded && (
        <img src={src} alt={alt} className="w-full h-full object-contain drop-shadow-2xl" />
      )}
    </div>
  );
};

export const PlatformFeatures = () => {
  const { t } = useTranslation('landing');
  const shouldReduceMotion = useReducedMotion();
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features = [
    {
      title: t('features.aiAssistant'),
      description: t('features.aiAssistantDesc'),
      image: feature_1 ,
    },
    {
      title: t('features.gamifiedExperience'),
      description: t('features.gamifiedExperienceDesc'),
      image: feature_2,
    },
    {
      title: t('features.interactiveSimulations'),
      description: t('features.interactiveSimulationsDesc'),
      image: feature_3,
    },
  ];

  return (
    <section className="py-20 relative" ref={ref}>
      <div className="container-responsive relative z-10">
        <SectionHeader
          title={t('features.title')}
          subtitle={t('features.subtitle')}
          variant="premium"
        />

        <div className="grid md:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.2 + index * 0.1 }}
            >
              <div className="relative group">
                {/* Optimized 3D Image - Outside the card */}
                <motion.div
                  className="relative mx-auto w-80 h-80 mb-[-70px] -mt-4 z-20"
                  initial={shouldReduceMotion ? false : { y: 20, opacity: 0 }}
                  animate={inView ? { y: 0, opacity: 1 } : {}}
                  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, delay: 0.3 + index * 0.1 }}
                  whileHover={shouldReduceMotion ? {} : { 
                    scale: 1.1,
                    transition: { duration: 0.3 }
                  }}
                >
                  {/* Optimized glow effect - reduced for mobile */}
                  <div 
                    className="absolute inset-0 bg-primary/15 rounded-full blur-2xl group-hover:blur-3xl group-hover:bg-primary/25 transition-all duration-300"
                  />
                  <LazyFeatureImage
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full"
                  />
                </motion.div>

                <Card className="glass-card border-0 hover-glow cursor-pointer h-full overflow-visible bg-gradient-to-br from-primary/5 to-primary/10 relative">
                  <CardContent className="p-8 pt-16 relative z-10 flex flex-col items-center justify-center h-full">
                    {/* Centered Title */}
                    <motion.h3 
                      className="text-2xl font-bold text-center group-hover:text-primary transition-colors mb-4"
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.4 + index * 0.1 }}
                    >
                      {feature.title}
                    </motion.h3>

                    {/* Description */}
                    <motion.p 
                      className="text-muted-foreground text-center leading-relaxed mb-6"
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.5 + index * 0.1 }}
                    >
                      {feature.description}
                    </motion.p>

                    {/* Simplified floating particles - reduced for mobile */}
                    <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-primary/8 to-primary/4 rounded-full blur-lg group-hover:scale-125 transition-transform duration-300" />
                    <div className="absolute bottom-4 left-4 w-8 h-8 bg-gradient-to-br from-secondary/8 to-secondary/4 rounded-full blur-md group-hover:scale-110 transition-transform duration-300 delay-75" />
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ))}
        </div>


      </div>
    </section>
  );
};