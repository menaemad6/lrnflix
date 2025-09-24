import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Video, 
  FileText, 
  Users, 
  Award, 
  Clock, 
  Smartphone,
  BarChart3,
  MessageCircle,
  Download,
  Shield,
  Zap,
  Globe
} from 'lucide-react';
import { useInView } from 'react-intersection-observer';

const features = [
  {
    icon: Video,
    title: 'دروس فيديو تفاعلية',
    description: 'مقاطع فيديو عالية الجودة مع إمكانية التفاعل والأسئلة المباشرة',
    color: 'from-red-500/20 to-pink-500/20',
    iconColor: 'text-red-500',
  },
  {
    icon: FileText,
    title: 'مواد تعليمية شاملة',
    description: 'ملفات PDF، تمارين، وأوراق عمل قابلة للتحميل والطباعة',
    color: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-500',
  },
  {
    icon: Users,
    title: 'مجموعات دراسية',
    description: 'انضم إلى مجموعات دراسية وتعلم مع زملائك وشارك الخبرات',
    color: 'from-green-500/20 to-emerald-500/20',
    iconColor: 'text-green-500',
  },
  {
    icon: Award,
    title: 'شهادات معتمدة',
    description: 'احصل على شهادات إتمام معتمدة عند إنهاء الدورات بنجاح',
    color: 'from-yellow-500/20 to-orange-500/20',
    iconColor: 'text-yellow-500',
  },
  {
    icon: BarChart3,
    title: 'تتبع التقدم',
    description: 'راقب تقدمك في التعلم مع إحصائيات مفصلة ونصائح للتحسين',
    color: 'from-purple-500/20 to-indigo-500/20',
    iconColor: 'text-purple-500',
  },
  {
    icon: MessageCircle,
    title: 'دعم مباشر',
    description: 'تواصل مباشر مع المدرس للحصول على إجابات فورية لأسئلتك',
    color: 'from-teal-500/20 to-cyan-500/20',
    iconColor: 'text-teal-500',
  },
  {
    icon: Smartphone,
    title: 'تعلم على الهاتف',
    description: 'منصة متوافقة مع جميع الأجهزة للتعلم في أي وقت ومن أي مكان',
    color: 'from-rose-500/20 to-pink-500/20',
    iconColor: 'text-rose-500',
  },
  {
    icon: Clock,
    title: 'مرونة في الوقت',
    description: 'ادرس في أي وقت يناسبك مع إمكانية إعادة مشاهدة الدروس',
    color: 'from-amber-500/20 to-yellow-500/20',
    iconColor: 'text-amber-500',
  },
  {
    icon: Download,
    title: 'محتوى قابل للتحميل',
    description: 'حمل الدروس والمواد للدراسة بدون إنترنت',
    color: 'from-indigo-500/20 to-purple-500/20',
    iconColor: 'text-indigo-500',
  },
  {
    icon: Shield,
    title: 'بيئة آمنة',
    description: 'منصة آمنة ومحمية بأحدث تقنيات الأمان والخصوصية',
    color: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-500',
  },
  {
    icon: Zap,
    title: 'تحديثات مستمرة',
    description: 'محتوى محدث باستمرار ليواكب أحدث المناهج والتطورات',
    color: 'from-violet-500/20 to-purple-500/20',
    iconColor: 'text-violet-500',
  },
  {
    icon: Globe,
    title: 'وصول عالمي',
    description: 'ادرس من أي مكان في العالم مع دعم للغة العربية والإنجليزية',
    color: 'from-sky-500/20 to-blue-500/20',
    iconColor: 'text-sky-500',
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }}
              >
                <Card className="glass-card border-0 hover-glow group cursor-pointer h-full p-6">
                  <CardContent className="p-0">
                    <div className="space-y-4">
                      {/* Icon */}
                      <motion.div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                        whileHover={{ rotate: 5 }}
                      >
                        <Icon className={`w-7 h-7 ${feature.iconColor}`} />
                      </motion.div>

                      {/* Content */}
                      <div>
                        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
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
              هل تريد معرفة المزيد؟
            </h3>
            <p className="text-muted-foreground mb-6">
              احصل على جولة مجانية في المنصة واكتشف كيف يمكنها مساعدتك في تحقيق أهدافك التعليمية
            </p>
            <motion.button
              className="btn-primary group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              احجز جولة مجانية
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};