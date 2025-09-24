import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Users, BookOpen, Star, GraduationCap, Trophy } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import teacherImage from '@/assets/teacher-about-3d.png';

const achievements = [
  {
    icon: GraduationCap,
    title: 'دكتوراه في الكيمياء',
    description: 'من جامعة القاهرة بتقدير امتياز',
  },
  {
    icon: Users,
    title: '10+ سنوات خبرة',
    description: 'في تدريس الكيمياء للمرحلة الثانوية',
  },
  {
    icon: Trophy,
    title: 'أفضل مدرس كيمياء',
    description: 'جائزة التميز التعليمي لعام 2023',
  },
  {
    icon: BookOpen,
    title: '5000+ طالب',
    description: 'تخرج على يديه بنجاح',
  },
];

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
      {/* Background */}
      <div className="absolute inset-0 premium-bg-wave" />
      
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
            <span className="gradient-text">تعرف على المدرس</span>
          </motion.h2>
          <motion.p
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            خبرة طويلة وشغف حقيقي لتعليم الكيمياء بطريقة مبسطة وممتعة
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Teacher Image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div
              className="relative mx-auto lg:mx-0 w-80 h-96"
              whileHover={{ 
                rotateY: 10,
                rotateX: 5,
                transition: { duration: 0.3 }
              }}
            >
              {/* Glow effects */}
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-2xl group-hover:blur-3xl group-hover:bg-primary/30 transition-all duration-500" />
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-3xl blur-xl opacity-50" />
              
              <motion.img
                src={teacherImage}
                alt="أستاذ الكيمياء"
                className="w-full h-full object-contain drop-shadow-2xl relative z-10"
                style={{
                  filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.4))',
                  transform: 'perspective(1200px) rotateX(-8deg) translateZ(30px)',
                }}
                whileHover={{
                  scale: 1.05,
                  rotateX: -5,
                  transition: { duration: 0.3 }
                }}
              />
              
              {/* Floating elements */}
              <motion.div
                className="absolute top-10 -right-4 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 blur-xl"
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              />
              <motion.div
                className="absolute bottom-20 -left-6 w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 blur-xl"
                animate={{ 
                  y: [0, 15, 0],
                  rotate: [360, 180, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 1
                }}
              />
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="space-y-6">
              <h3 className="text-3xl font-bold mb-4">
                د. أحمد محمد حسن
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                أستاذ الكيمياء المتخصص في تبسيط المفاهيم المعقدة وجعل تعلم الكيمياء متعة حقيقية. 
                أؤمن بأن كل طالب قادر على التفوق عندما يجد الطريقة الصحيحة للتعلم.
              </p>
              
              <motion.div
                className="flex items-center gap-2 text-yellow-500"
                whileHover={{ scale: 1.05 }}
              >
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
                <span className="text-muted-foreground mr-2">تقييم 4.9 من 5</span>
              </motion.div>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-2 gap-4">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  >
                    <Card className="glass-card border-0 hover-glow p-4 h-full">
                      <CardContent className="p-0">
                        <div className="flex items-start gap-3">
                          <motion.div
                            className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                            <Icon className="w-5 h-5 text-primary" />
                          </motion.div>
                          <div>
                            <h4 className="font-semibold text-sm mb-1">
                              {achievement.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="glass-card border-0 p-6">
                <motion.div
                  className="text-3xl font-bold gradient-text mb-2"
                  initial={{ scale: 0 }}
                  animate={inView ? { scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-muted-foreground text-sm">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <div className="glass-card border-0 p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 gradient-text">
              ابدأ رحلتك التعليمية معي
            </h3>
            <p className="text-muted-foreground mb-6">
              انضم إلى آلاف الطلاب الذين حققوا النجاح والتفوق في مادة الكيمياء
            </p>
            <motion.button
              className="btn-primary group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              احجز استشارة مجانية
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};