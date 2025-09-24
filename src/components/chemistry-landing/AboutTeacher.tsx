import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';
import { Star } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import about_techer from '@/assets/about-teacher.png';

const stats = [
  { number: '98%', label: 'نسبة نجاح الطلاب' },
  { number: '4.9/5', label: 'تقييم الطلاب' },
  { number: '15+', label: 'سنة في التدريس' },
  { number: '50+', label: 'كورس مُنجز' },
];

export const AboutTeacher = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-20 relative overflow-hidden" ref={ref}>
      <div className="w-full px-4 lg:px-8 relative z-10">
        <SectionHeader
          title="تعرف على المدرس"
          subtitle="خبرة طويلة وشغف حقيقي لتعليم الكيمياء بطريقة مبسطة وممتعة"
          variant="premium"
        />

        <div className="relative min-h-[600px] flex flex-col lg:flex-row lg:items-center">
          {/* Left Card - Full Height with Primary Background */}
          <motion.div
            className="relative w-full lg:w-2/3 h-[700px] lg:h-[600px] bg-primary rounded-2xl p-12 lg:p-12 flex flex-col justify-between"
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Teacher Text Content */}
            <div className="space-y-6 text-white">
              <h3 className="text-4xl lg:text-5xl font-bold mb-6">
                د. أحمد محمد حسن
              </h3>
              
              <p className="text-lg lg:text-xl leading-relaxed opacity-90">
                أستاذ الكيمياء المتخصص في تبسيط المفاهيم المعقدة وجعل تعلم الكيمياء متعة حقيقية. 
                أؤمن بأن كل طالب قادر على التفوق عندما يجد الطريقة الصحيحة للتعلم.
              </p>
              


            </div>

            {/* Stats Section at Bottom */}
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-8 pb-8 lg:pb-0"
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