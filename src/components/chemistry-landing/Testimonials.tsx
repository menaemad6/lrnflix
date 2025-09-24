import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

const testimonials = [
  {
    id: 1,
    name: 'أحمد محمد',
    role: 'طالب ثالث ثانوي',
    content: 'لقد غيرت هذه المنصة طريقة فهمي للكيمياء تماماً. الشروحات واضحة والأمثلة عملية. حصلت على 98% في امتحان الكيمياء!',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    course: 'التفاعلات الكيميائية المتقدمة',
  },
  {
    id: 2,
    name: 'فاطمة علي',
    role: 'طالبة ثاني ثانوي',
    content: 'الكيمياء العضوية كانت صعبة جداً بالنسبة لي، لكن مع الشرح المبسط والتمارين التفاعلية أصبحت أحبها وأفهمها بسهولة.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    course: 'أساسيات الكيمياء العضوية',
  },
  {
    id: 3,
    name: 'محمد أحمد',
    role: 'طالب أول ثانوي',
    content: 'المدرس يشرح بطريقة ممتازة ويجيب على جميع الأسئلة. المنصة سهلة الاستخدام ويمكنني الدراسة في أي وقت.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    course: 'الجدول الدوري والروابط',
  },
  {
    id: 4,
    name: 'نور حسام',
    role: 'طالبة ثالث ثانوي',
    content: 'التطبيقات العملية والتجارب الافتراضية ساعدتني كثيراً في فهم المفاهيم المعقدة. شكراً للأستاذ على هذا المجهود الرائع.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    course: 'كيمياء تطبيقية متقدمة',
  },
  {
    id: 5,
    name: 'علي سعد',
    role: 'طالب ثاني ثانوي',
    content: 'الدعم الفني ممتاز والمدرس متاح دائماً للإجابة على الأسئلة. المحتوى محدث ويتماشى مع المنهج الحديث.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    course: 'الكيمياء التحليلية',
  },
  {
    id: 6,
    name: 'مريم خالد',
    role: 'طالبة أول ثانوي',
    content: 'أحب طريقة التعلم التفاعلية والاختبارات القصيرة بعد كل درس. تساعدني على تذكر المعلومات بشكل أفضل.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    course: 'مقدمة في الكيمياء',
  },
];

export const Testimonials = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-20 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 premium-bg-ripple" />
      
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
            <span className="gradient-text">آراء الطلاب</span>
          </motion.h2>
          <motion.p
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            اكتشف ما يقوله طلابنا عن تجربتهم في تعلم الكيمياء معنا
          </motion.p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">500+</div>
            <div className="text-muted-foreground">طالب راضي</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">4.9/5</div>
            <div className="text-muted-foreground">تقييم المنصة</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">98%</div>
            <div className="text-muted-foreground">نسبة النجاح</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold gradient-text mb-2">24/7</div>
            <div className="text-muted-foreground">دعم مستمر</div>
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            >
              <Card className="glass-card border-0 hover-glow group cursor-pointer h-full">
                <CardContent className="p-6">
                  {/* Quote icon */}
                  <motion.div
                    className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Quote className="w-6 h-6 text-primary" />
                  </motion.div>

                  {/* Content */}
                  <div className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed italic">
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
                      <motion.img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                        whileHover={{ scale: 1.1 }}
                      />
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
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="glass-card border-0 p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 gradient-text">
              انضم إلى عائلتنا من الطلاب المتفوقين
            </h3>
            <p className="text-muted-foreground mb-6">
              كن جزءاً من قصص النجاح واحصل على نفس النتائج المميزة
            </p>
            <motion.button
              className="btn-primary group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ابدأ رحلتك اليوم
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};