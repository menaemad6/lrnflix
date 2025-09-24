import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';
import { useInView } from 'react-intersection-observer';
import feature_1 from '@/assets/feature-1.png';
import feature_2 from '@/assets/feature-2.png';
import feature_3 from '@/assets/feature-3.png';

const features = [
  {
    title: 'مساعد الذكي حسام',
    description: 'مساعد ذكي متطور يجيب على أسئلتك ويساعدك في فهم المفاهيم المعقدة باللغة العربية على مدار الساعة',
    image: feature_1 ,
  },
  {
    title: 'تجربة تعليمية مُلعبة',
    description: 'احصل على نقاط وشارات وكؤوس مع كل درس تكمله. تنافس مع أصدقائك وتسلق قوائم المتصدرين',
    image: feature_2,
  },
  {
    title: 'محاكيات تفاعلية',
    description: 'جرب التفاعلات الكيميائية في مختبر افتراضي آمن مع محاكيات ثلاثية الأبعاد واقعية',
    image: feature_3,
  },
];

export const PlatformFeatures = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-20 relative" ref={ref}>
      <div className="container-responsive relative z-10">
        <SectionHeader
          title="مميزات المنصة"
          subtitle="اكتشف جميع المميزات التي تجعل من تعلم الكيمياء تجربة ممتعة وفعالة"
          variant="premium"
        />

        <div className="grid md:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            >
              <div className="relative group">
                {/* Enhanced 3D Image - Outside the card */}
                <motion.div
                  className="relative mx-auto w-80 h-80 mb-[-70px] -mt-4 z-20"
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
                    src={feature.image}
                    alt={feature.title}
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

                <Card className="glass-card border-0 hover-glow cursor-pointer h-full overflow-visible bg-gradient-to-br from-primary/5 to-primary/10 relative">
                  <CardContent className="p-8 pt-16 relative z-10 flex flex-col items-center justify-center h-full">
                    {/* Centered Title */}
                    <motion.h3 
                      className="text-2xl font-bold text-center group-hover:text-primary transition-colors mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    >
                      {feature.title}
                    </motion.h3>

                    {/* Description */}
                    <motion.p 
                      className="text-muted-foreground text-center leading-relaxed mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                    >
                      {feature.description}
                    </motion.p>

                    {/* Floating particles */}
                    <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                    <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-full blur-lg group-hover:scale-125 transition-transform duration-500 delay-75" />
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