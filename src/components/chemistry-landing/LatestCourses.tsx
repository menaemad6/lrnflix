import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Clock, Users, Star, BookOpen } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import chemistryLab from '@/assets/chemistry-lab.jpg';
import chemistryMolecules from '@/assets/chemistry-molecules.jpg';

const coursesData = [
  {
    id: 1,
    title: 'أساسيات الكيمياء العضوية',
    description: 'تعلم المركبات العضوية والتفاعلات الأساسية بطريقة سهلة ومبسطة',
    image: chemistryLab,
    duration: '8 ساعات',
    students: 156,
    rating: 4.9,
    lessons: 12,
    level: 'مبتدئ',
    year: 'الثاني الثانوي',
    price: 'مجاني',
    category: 'كيمياء عضوية',
  },
  {
    id: 2,
    title: 'التفاعلات الكيميائية المتقدمة',
    description: 'فهم عميق للتفاعلات الكيميائية المعقدة وآليات التفاعل',
    image: chemistryMolecules,
    duration: '12 ساعة',
    students: 203,
    rating: 4.8,
    lessons: 18,
    level: 'متقدم',
    year: 'الثالث الثانوي',
    price: '199 جنيه',
    category: 'كيمياء تطبيقية',
  },
  {
    id: 3,
    title: 'الجدول الدوري والروابط',
    description: 'دراسة شاملة للجدول الدوري وأنواع الروابط الكيميائية',
    image: chemistryLab,
    duration: '6 ساعات',
    students: 89,
    rating: 4.7,
    lessons: 10,
    level: 'مبتدئ',
    year: 'الأول الثانوي',
    price: '149 جنيه',
    category: 'كيمياء أساسية',
  },
];

export const LatestCourses = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-20 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 premium-bg-cosmic" />
      
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
            <span className="gradient-text">أحدث الدورات</span>
          </motion.h2>
          <motion.p
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            اكتشف أحدث الدورات التي تم إضافتها مؤخراً، مصممة لتناسب احتياجاتك التعليمية
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coursesData.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            >
              <Card className="glass-card border-0 hover-glow group cursor-pointer h-full overflow-hidden">
                {/* Course Image */}
                <div className="relative overflow-hidden">
                  <motion.img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                    whileHover={{ scale: 1.05 }}
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Play button */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="w-16 h-16 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </motion.div>

                  {/* Category badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 bg-primary/90 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                    {course.category}
                  </div>

                  {/* Level badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 glass backdrop-blur-sm rounded-full text-xs font-medium">
                    {course.level}
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Course info */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors leading-tight">
                        {course.title}
                      </h3>
                      <p className="text-sm text-primary/80 mt-1">{course.year}</p>
                    </div>
                    
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                      {course.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-white/10">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">{course.lessons} درس</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">{course.students} طالب</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-muted-foreground">{course.rating}</span>
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <span className="text-2xl font-bold text-primary">
                          {course.price}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="btn-primary group-hover:scale-105 transition-transform"
                      >
                        ابدأ الآن
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
          <Button size="lg" className="btn-secondary">
            عرض جميع الدورات
          </Button>
        </motion.div>
      </div>
    </section>
  );
};