import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';

// Lazy load images for better performance
const year1Image = '/pola/year1-chemistry.png';
const year2Image = '/pola/year2-chemistry.png';
const year3Image = '/pola/year3-chemistry.png';

// Year data will be moved inside component to use translations

// Optimized image component with lazy loading
const LazyImage = ({ src, alt, className }: { src: string; alt: string; className: string }) => {
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

export const YearsSection = () => {
  const { t } = useTranslation('landing');
  const shouldReduceMotion = useReducedMotion();
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const yearData = [
    {
      year: 1,
      title: t('years.firstYear'),
      image: year1Image,
    },
    {
      year: 2,
      title: t('years.secondYear'),
      image: year2Image,
    },
    {
      year: 3,
      title: t('years.thirdYear'),
      image: year3Image,
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden" ref={ref}>
      <div className="container-responsive relative z-10">
        <SectionHeader
          title={t('years.title')}
          subtitle={t('years.subtitle')}
          variant="premium"
        />

        <div className="grid md:grid-cols-3 gap-10">
          {yearData.map((year, index) => (
            <motion.div
              key={year.year}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.2 + index * 0.1 }}
            >
              <div className="relative group">
                 {/* Optimized 3D Chemistry Image - Outside the card */}
                 <motion.div
                   className="relative mx-auto w-64 h-64 mb-[-25px] -mt-8 z-20"
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
                   <LazyImage
                     src={year.image}
                     alt={year.title}
                     className="w-full h-full"
                   />
                 </motion.div>

                <Link to={`/courses?year=${year.year}`}>
                  <Card className="glass-card border-0 hover-glow cursor-pointer h-full overflow-visible bg-gradient-to-br from-primary/5 to-primary/10 relative">
                    <CardContent className="p-8 pt-16 relative z-10 flex flex-col items-center justify-center h-full">
                      {/* Centered Title */}
                      <motion.h3 
                        className="text-2xl font-bold text-center group-hover:text-primary transition-colors mb-6"
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.4 + index * 0.1 }}
                      >
                        {year.title}
                      </motion.h3>

                      {/* View Courses Link */}
                      <motion.div
                        className="flex items-center gap-2 text-primary group-hover:text-primary/80 transition-colors"
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.5 + index * 0.1 }}
                        whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                      >
                        <span className="text-sm font-medium">{t('years.viewLessons')}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </motion.div>

                      {/* Simplified floating particles - reduced for mobile */}
                      <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-primary/8 to-primary/4 rounded-full blur-lg group-hover:scale-125 transition-transform duration-300" />
                      <div className="absolute bottom-4 left-4 w-8 h-8 bg-gradient-to-br from-secondary/8 to-secondary/4 rounded-full blur-md group-hover:scale-110 transition-transform duration-300 delay-75" />
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};