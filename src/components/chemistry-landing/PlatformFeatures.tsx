import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, Trophy, Sparkles } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import aiAssistantImage from '@/assets/ai-assistant-3d.png';
import gamifiedImage from '@/assets/gamified-3d.png';
import interactiveLabImage from '@/assets/interactive-lab-3d.png';

const features = [
  {
    icon: Bot,
    title: 'مساعد الذكي حسام',
    description: 'مساعد ذكي متطور يجيب على أسئلتك ويساعدك في فهم المفاهيم المعقدة باللغة العربية على مدار الساعة',
    image: aiAssistantImage,
    gradient: 'from-blue-500/10 to-purple-500/10',
    glowColor: 'blue-500',
  },
  {
    icon: Trophy,
    title: 'تجربة تعليمية مُلعبة',
    description: 'احصل على نقاط وشارات وكؤوس مع كل درس تكمله. تنافس مع أصدقائك وتسلق قوائم المتصدرين',
    image: gamifiedImage,
    gradient: 'from-yellow-500/10 to-orange-500/10',
    glowColor: 'yellow-500',
  },
  {
    icon: Sparkles,
    title: 'محاكيات تفاعلية',
    description: 'جرب التفاعلات الكيميائية في مختبر افتراضي آمن مع محاكيات ثلاثية الأبعاد واقعية',
    image: interactiveLabImage,
    gradient: 'from-green-500/10 to-teal-500/10',
    glowColor: 'green-500',
  },
];

export const PlatformFeatures = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-20 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 premium-bg-spotlight" />
      
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
            <span className="gradient-text">مميزات المنصة</span>
          </motion.h2>
          <motion.p
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            اكتشف جميع المميزات التي تجعل من تعلم الكيمياء تجربة ممتعة وفعالة
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
              >
                <Card className={`glass-card border-0 hover-glow group cursor-pointer h-full overflow-hidden bg-gradient-to-br ${feature.gradient}`}>
                  <CardContent className="p-8 relative">
                    <div className="space-y-6">
                      {/* 3D Image */}
                      <motion.div
                        className="relative mx-auto w-48 h-48 mb-6"
                        initial={{ y: 20, opacity: 0 }}
                        animate={inView ? { y: 0, opacity: 1 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                        whileHover={{ 
                          y: -10,
                          rotateY: 15,
                          transition: { duration: 0.3 }
                        }}
                      >
                        <div 
                          className={`absolute inset-0 bg-${feature.glowColor}/20 rounded-full blur-xl group-hover:blur-2xl group-hover:bg-${feature.glowColor}/30 transition-all duration-500`}
                          style={{
                            transform: 'translateZ(-20px)',
                          }}
                        />
                        <motion.img
                          src={feature.image}
                          alt={feature.title}
                          className="w-full h-full object-contain drop-shadow-2xl"
                          style={{
                            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))',
                            transform: 'perspective(1000px) rotateX(-5deg) translateZ(20px)',
                          }}
                          whileHover={{
                            rotateX: -10,
                            rotateY: 10,
                            scale: 1.05,
                            transition: { duration: 0.3 }
                          }}
                        />
                      </motion.div>

                      {/* Content */}
                      <div className="text-center space-y-4">
                        <motion.div
                          className="flex items-center justify-center mb-4"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <Icon className="w-8 h-8 text-primary" />
                        </motion.div>
                        
                        <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                    <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-full blur-lg group-hover:scale-125 transition-transform duration-500 delay-75" />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom section */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="glass-card border-0 p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 gradient-text">
              تجربة تعليمية لا تُنسى
            </h3>
            <p className="text-muted-foreground mb-6">
              اكتشف كيف تجعل تقنياتنا المتطورة من تعلم الكيمياء متعة حقيقية
            </p>
            <motion.button
              className="btn-primary group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              جرب المنصة مجاناً
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};