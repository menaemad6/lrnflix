import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';
import { Star, Quote } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';

// Egyptian Arabic testimonials (عامية مصرية)
const testimonials = [
  {
    id: 1,
    name: 'أحمد محمد',
    role: 'طالب تالت ثانوي',
    content: 'يا عم والله المنصة دي غيرت فهمي للكيمياء خالص! الشروحات واضحة والأمثلة عملية جداً. جبت 98% في امتحان الكيمياء!',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    course: 'التفاعلات الكيميائية المتقدمة',
  },
  {
    id: 2,
    name: 'فاطمة علي',
    role: 'طالبة تاني ثانوي',
    content: 'الكيمياء العضوية كانت صعبة عليا أوي، بس مع الشرح المبسط والتمارين التفاعلية بقيت بحبها وأفهمها بسهولة.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    course: 'أساسيات الكيمياء العضوية',
  },
  {
    id: 3,
    name: 'محمد أحمد',
    role: 'طالب أول ثانوي',
    content: 'المدرس بيشرح حلو جداً وبيجاوب على كل الأسئلة. المنصة سهلة الاستخدام ويمكنني أذاكر في أي وقت.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    course: 'الجدول الدوري والروابط',
  },
  {
    id: 4,
    name: 'نور حسام',
    role: 'طالبة تالت ثانوي',
    content: 'التطبيقات العملية والتجارب الافتراضية ساعدتني كتير في فهم المفاهيم المعقدة. شكراً للأستاذ على المجهود الرائع ده.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    course: 'كيمياء تطبيقية متقدمة',
  },
  {
    id: 5,
    name: 'علي سعد',
    role: 'طالب تاني ثانوي',
    content: 'الدعم الفني ممتاز والمدرس متاح دايماً للإجابة على الأسئلة. المحتوى محدث ويتماشى مع المنهج الحديث.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    course: 'الكيمياء التحليلية',
  },
  {
    id: 6,
    name: 'مريم خالد',
    role: 'طالبة أول ثانوي',
    content: 'بحب طريقة التعلم التفاعلية والاختبارات القصيرة بعد كل درس. بتساعدني أتذكر المعلومات أحسن.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    course: 'مقدمة في الكيمياء',
  },
];

export const Testimonials = () => {
  const { t } = useTranslation('landing');
  const shouldReduceMotion = useReducedMotion();
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-20 relative overflow-hidden" ref={ref}>

      <div className="container-responsive relative z-10">
        <SectionHeader
          title={t('testimonials.title')}
          subtitle={t('testimonials.subtitle')}
          variant="premium"
        />

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.3 }}
        >
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">500+</div>
            <div className="text-muted-foreground">{t('testimonials.satisfiedStudents')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">4.9/5</div>
            <div className="text-muted-foreground">{t('testimonials.platformRating')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">98%</div>
            <div className="text-muted-foreground">{t('testimonials.successRate')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">24/7</div>
            <div className="text-muted-foreground">{t('testimonials.continuousSupport')}</div>
          </div>
        </motion.div>
      </div>

    {/* Auto-Moving Testimonials */}
        <div className="space-y-8 overflow-hidden py-6">
          {/* First Row - Right to Left */}
          <motion.div
            className="flex gap-6 animate-scroll-right"
            initial={{ x: 0 }}
            animate={shouldReduceMotion ? { x: 0 } : { x: "-100%" }}
            transition={shouldReduceMotion ? { duration: 0 } : {
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {[...testimonials.slice(0, 3), ...testimonials.slice(0, 3)].map((testimonial, index) => (
              <div key={`row1-${index}`} className="flex-shrink-0 w-96">
                <Card className="glass-card border-0 hover-glow group cursor-pointer h-full">
                  <CardContent className="p-6">
                    {/* Quote icon */}
                    <motion.div
                      className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
                      whileHover={shouldReduceMotion ? {} : { scale: 1.1, rotate: 5 }}
                    >
                      <Quote className="w-6 h-6 text-primary" />
                    </motion.div>

                    {/* Content */}
                    <div className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed italic line-clamp-3">
                        "{testimonial.content}"
                      </p>

                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 text-yellow-500 fill-current"
                          />
                        ))}
                      </div>

                      {/* Student info */}
                      <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                        <motion.div
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
                          whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
                        >
                          <span className="text-lg font-bold text-primary">
                            {testimonial.name.charAt(0)}
                          </span>
                        </motion.div>
                        <div>
                          <h4 className="font-semibold group-hover:text-primary transition-colors">
                            {testimonial.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {testimonial.role}
                          </p>
                          <p className="text-xs text-primary/80 mt-1">
                            {testimonial.course}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </motion.div>

          {/* Second Row - Left to Right */}
          <motion.div
            className="flex gap-6 animate-scroll-left"
            initial={{ x: "-100%" }}
            animate={shouldReduceMotion ? { x: 0 } : { x: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : {
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {[...testimonials.slice(3), ...testimonials.slice(3)].map((testimonial, index) => (
              <div key={`row2-${index}`} className="flex-shrink-0 w-96">
                <Card className="glass-card border-0 hover-glow group cursor-pointer h-full">
                  <CardContent className="p-6">
                    {/* Quote icon */}
                    <motion.div
                      className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors"
                      whileHover={shouldReduceMotion ? {} : { scale: 1.1, rotate: -5 }}
                    >
                      <Quote className="w-6 h-6 text-secondary" />
                    </motion.div>

                    {/* Content */}
                    <div className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed italic line-clamp-3">
                        "{testimonial.content}"
                      </p>

                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 text-yellow-500 fill-current"
                          />
                        ))}
                      </div>

                      {/* Student info */}
                      <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                        <motion.div
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center"
                          whileHover={shouldReduceMotion ? {} : { scale: 1.1 }}
                        >
                          <span className="text-lg font-bold text-secondary">
                            {testimonial.name.charAt(0)}
                          </span>
                        </motion.div>
                        <div>
                          <h4 className="font-semibold group-hover:text-secondary transition-colors">
                            {testimonial.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {testimonial.role}
                          </p>
                          <p className="text-xs text-secondary/80 mt-1">
                            {testimonial.course}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </motion.div>
        </div>

    </section>
  );
};