import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Users, BookOpen, Clock } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

const yearData = [
  {
    year: 1,
    title: 'الصف الأول الثانوي',
    description: 'أساسيات الكيمياء والجدول الدوري',
    students: 150,
    lessons: 18,
    duration: '6 شهور',
    color: 'from-blue-500/20 to-cyan-500/20',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    year: 2,
    title: 'الصف الثاني الثانوي',
    description: 'الكيمياء العضوية والتفاعلات',
    students: 120,
    lessons: 22,
    duration: '7 شهور',
    color: 'from-purple-500/20 to-pink-500/20',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    year: 3,
    title: 'الصف الثالث الثانوي',
    description: 'كيمياء متقدمة وإعداد للجامعة',
    students: 200,
    lessons: 28,
    duration: '8 شهور',
    color: 'from-emerald-500/20 to-teal-500/20',
    gradient: 'from-emerald-500 to-teal-500',
  },
];

export const YearsSection = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-20 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 particle-bg" />
      
      <div className="container-responsive relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="gradient-text">اختر صفك الدراسي</span>
          </motion.h2>
          <motion.p
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            منهج شامل ومصمم خصيصاً لكل مرحلة دراسية، مع تركيز على الفهم العميق والتطبيق العملي
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {yearData.map((year, index) => (
            <motion.div
              key={year.year}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            >
              <Link to={`/courses?year=${year.year}`}>
                <Card className="glass-card border-0 hover-glow group cursor-pointer h-full">
                  <CardContent className="p-8">
                    {/* Year badge */}
                    <motion.div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${year.color} mb-6 group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 5 }}
                    >
                      <span className="text-2xl font-bold text-foreground">
                        {year.year}
                      </span>
                    </motion.div>

                    {/* Content */}
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                        {year.title}
                      </h3>
                      
                      <p className="text-muted-foreground leading-relaxed">
                        {year.description}
                      </p>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 py-4">
                        <div className="text-center">
                          <Users className="w-5 h-5 text-primary mx-auto mb-2" />
                          <div className="text-sm font-semibold">{year.students}</div>
                          <div className="text-xs text-muted-foreground">طالب</div>
                        </div>
                        <div className="text-center">
                          <BookOpen className="w-5 h-5 text-primary mx-auto mb-2" />
                          <div className="text-sm font-semibold">{year.lessons}</div>
                          <div className="text-xs text-muted-foreground">درس</div>
                        </div>
                        <div className="text-center">
                          <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
                          <div className="text-sm font-semibold">{year.duration}</div>
                          <div className="text-xs text-muted-foreground">مدة</div>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">
                          عرض الدروس
                        </span>
                        <motion.div
                          className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
                          whileHover={{ scale: 1.1 }}
                        >
                          <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Decorative gradient */}
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${year.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p className="text-muted-foreground mb-6">
            غير متأكد من أي صف؟ احصل على استشارة مجانية
          </p>
          <Link to="/contact">
            <motion.button
              className="btn-secondary group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              تحدث مع المدرس
              <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};