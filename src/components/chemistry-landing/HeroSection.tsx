import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { Star, Play, BookOpen, ArrowRight } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import about_techer from '@/assets/about-teacher.png';

const stats = [
  { number: '98%', label: 'نسبة نجاح الطلاب' },
  { number: '4.9/5', label: 'تقييم الطلاب' },
  { number: '4+', label: 'سنة في التدريس' },
  { number: '50+', label: 'كورس مُنجز' },
];

export const HeroSection = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="min-h-screen flex items-center relative overflow-hidden" ref={ref}>
      <div className="w-full px-4 lg:px-8 relative z-10">
        {/* <SectionHeader
          title="تعرف على المدرس"
          subtitle="خبرة طويلة وشغف حقيقي لتعليم الكيمياء بطريقة مبسطة وممتعة"
          variant="premium"
        /> */}

        <div className="relative min-h-[600px] flex flex-col lg:flex-row lg:items-center">
          {/* Left Card - Full Height with Primary Background */}
          <motion.div
            className="relative w-full lg:w-2/3 h-[700px] lg:h-[600px] bg-primary rounded-2xl p-12 lg:p-12 flex flex-col justify-between"
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Hero Text Content */}
            <div className="space-y-6 text-white">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <h1 className="text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                  تعلم الكيمياء
                  <span className="block text-white">بأسلوب ممتع</span>
                </h1>
              </motion.div>
              
              <motion.p 
                className="text-xl lg:text-2xl leading-relaxed opacity-90 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                انضم إلى آلاف الطلاب الذين حققوا نتائج مذهلة في الكيمياء مع د. أحمد محمد حسن
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Button 
                  size="lg" 
                  variant="default"
                  className='border border-white'
                >
                  <BookOpen className="w-5 h-5 ml-2" />
                  ابدأ التعلم الآن
                  <ArrowRight className="w-5 h-5 mr-2" />
                </Button>
                
                <Button 
                  variant="secondary" 
                  size="lg"
                >
                  <Play className="w-5 h-5 ml-2" />
                  شاهد عينة مجانية
                </Button>
              </motion.div>

            </div>

            {/* Stats Section at Bottom */}
            <motion.div
              className="hidden lg:grid grid-cols-4 gap-6 mt-8 pb-8 lg:pb-0"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm lg:text-base text-white/70">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Image inside card on mobile */}
            <motion.div
              className="flex justify-center mt-auto -mx-12 lg:hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <img
                src={about_techer}
                alt="أستاذ الكيمياء"
                className="w-screen h-auto object-contain"
              />
            </motion.div>
          </motion.div>

          {/* Image - Hidden on mobile, overlapping on desktop */}
          <motion.div
            className="hidden lg:flex lg:absolute lg:-right-8 lg:top-1/3 lg:-translate-y-1/2 lg:w-[900px] z-20"
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {/* Teacher Image */}
            <img
              src={about_techer}
              alt="أستاذ الكيمياء"
              className="w-full h-auto object-contain"
            />
            
          </motion.div>
        </div>
      </div>
    </section>
  );
};
