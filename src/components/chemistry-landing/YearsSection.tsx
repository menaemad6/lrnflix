import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';
import { useInView } from 'react-intersection-observer';
import year1Image from '@/assets/year1-chemistry.png';
import year2Image from '@/assets/year2-chemistry.png';
import year3Image from '@/assets/year3-chemistry.png';
import { ArrowRight } from 'lucide-react';

const yearData = [
  {
    year: 1,
    title: 'الصف الأول الثانوي',
    image: year1Image,
  },
  {
    year: 2,
    title: 'الصف الثاني الثانوي',
    image: year2Image,
  },
  {
    year: 3,
    title: 'الصف الثالث الثانوي',
    image: year3Image,
  },
];

export const YearsSection = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-20 relative overflow-hidden" ref={ref}>
      <div className="container-responsive relative z-10">
        <SectionHeader
          title="اختر صفك الدراسي"
          subtitle="منهج شامل ومصمم خصيصاً لكل مرحلة دراسية، مع تركيز على الفهم العميق والتطبيق العملي"
          variant="premium"
        />

        <div className="grid md:grid-cols-3 gap-10">
          {yearData.map((year, index) => (
            <motion.div
              key={year.year}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            >
              <div className="relative group">
                 {/* Enhanced 3D Chemistry Image - Outside the card */}
                 <motion.div
                   className="relative mx-auto w-64 h-64 mb-[-25px] -mt-8 z-20"
                   initial={{ y: 20, opacity: 0 }}
                   animate={inView ? { y: 0, opacity: 1 } : {}}
                   transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                   whileHover={{ 
                     scale: 1.2,
                     transition: { duration: 0.3 }
                   }}
                 >
                   {/* Enhanced glow effect */}
                   <div 
                     className="absolute inset-0 bg-primary/20 rounded-full blur-3xl group-hover:blur-[60px] group-hover:bg-primary/40 transition-all duration-500"
                     style={{
                       transform: 'translateZ(-40px)',
                     }}
                   />
                   <motion.img
                     src={year.image}
                     alt={year.title}
                     className="w-full h-full object-contain drop-shadow-2xl"
                     style={{
                       filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.5))',
                       transform: 'rotateX(0deg)',
                     }}
                     whileHover={{
                       rotate: 3,
                       transition: { duration: 0.3 }
                     }}
                   />
                 </motion.div>

                <Link to={`/courses?year=${year.year}`}>
                  <Card className="glass-card border-0 hover-glow cursor-pointer h-full overflow-visible bg-gradient-to-br from-primary/5 to-primary/10 relative">
                    <CardContent className="p-8 pt-16 relative z-10 flex flex-col items-center justify-center h-full">
                      {/* Centered Title */}
                      <motion.h3 
                        className="text-2xl font-bold text-center group-hover:text-primary transition-colors mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                      >
                        {year.title}
                      </motion.h3>

                      {/* View Courses Link */}
                      <motion.div
                        className="flex items-center gap-2 text-primary group-hover:text-primary/80 transition-colors"
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <span className="text-sm font-medium">عرض الدروس</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </motion.div>

                      {/* Floating particles */}
                      <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                      <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-full blur-lg group-hover:scale-125 transition-transform duration-500 delay-75" />
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