import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/section-header';
import { useInView } from 'react-intersection-observer';
import { CourseCarousel, type Course } from './CourseCarousel';
import chemistryLab from '@/assets/chemistry-lab.jpg';
import chemistryMolecules from '@/assets/chemistry-molecules.jpg';
import { useNavigate } from 'react-router-dom';

const coursesData: Course[] = [
  {
    id: '1',
    title: 'أساسيات الكيمياء العضوية',
    description: 'تعلم المركبات العضوية والتفاعلات الأساسية بطريقة سهلة ومبسطة',
    category: 'كيمياء عضوية',
    status: 'published',
    instructor_name: 'د. أحمد محمد',
    enrollment_count: 156,
    is_enrolled: false,
    enrollment_code: 'CHEM101',
    cover_image_url: chemistryLab,
    created_at: '2024-01-15T10:00:00Z',
    price: 0,
    instructor_id: 'instructor1',
    avatar_url: undefined,
  },
  {
    id: '2',
    title: 'التفاعلات الكيميائية المتقدمة',
    description: 'فهم عميق للتفاعلات الكيميائية المعقدة وآليات التفاعل',
    category: 'كيمياء تطبيقية',
    status: 'published',
    instructor_name: 'د. فاطمة علي',
    enrollment_count: 203,
    is_enrolled: false,
    enrollment_code: 'CHEM201',
    cover_image_url: chemistryMolecules,
    created_at: '2024-01-20T10:00:00Z',
    price: 199,
    instructor_id: 'instructor2',
    avatar_url: undefined,
  },
  {
    id: '3',
    title: 'الجدول الدوري والروابط',
    description: 'دراسة شاملة للجدول الدوري وأنواع الروابط الكيميائية',
    category: 'كيمياء أساسية',
    status: 'published',
    instructor_name: 'د. محمد حسن',
    enrollment_count: 89,
    is_enrolled: false,
    enrollment_code: 'CHEM102',
    cover_image_url: chemistryLab,
    created_at: '2024-01-25T10:00:00Z',
    price: 149,
    instructor_id: 'instructor3',
    avatar_url: undefined,
  },
  {
    id: '4',
    title: 'الكيمياء التحليلية',
    description: 'تعلم طرق التحليل الكيميائي المختلفة والتطبيقات العملية',
    category: 'كيمياء تحليلية',
    status: 'published',
    instructor_name: 'د. نور الدين',
    enrollment_count: 124,
    is_enrolled: false,
    enrollment_code: 'CHEM301',
    cover_image_url: chemistryMolecules,
    created_at: '2024-02-01T10:00:00Z',
    price: 179,
    instructor_id: 'instructor4',
    avatar_url: undefined,
  },
  {
    id: '5',
    title: 'الكيمياء الفيزيائية',
    description: 'دراسة الخصائص الفيزيائية للمواد والتفاعلات الكيميائية',
    category: 'كيمياء فيزيائية',
    status: 'published',
    instructor_name: 'د. سارة أحمد',
    enrollment_count: 98,
    is_enrolled: false,
    enrollment_code: 'CHEM401',
    cover_image_url: chemistryLab,
    created_at: '2024-02-05T10:00:00Z',
    price: 229,
    instructor_id: 'instructor5',
    avatar_url: undefined,
  },
  {
    id: '6',
    title: 'الكيمياء البيئية',
    description: 'فهم تأثير المواد الكيميائية على البيئة والحلول المستدامة',
    category: 'كيمياء بيئية',
    status: 'published',
    instructor_name: 'د. خالد محمود',
    enrollment_count: 87,
    is_enrolled: false,
    enrollment_code: 'CHEM501',
    cover_image_url: chemistryMolecules,
    created_at: '2024-02-10T10:00:00Z',
    price: 159,
    instructor_id: 'instructor6',
    avatar_url: undefined,
  },
];

export const LatestCourses = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const navigate = useNavigate();

  const handleCourseClick = (course: Course) => {
    console.log('Course clicked:', course);
    // Handle course click - could navigate to course details
  };

  return (
    <section className="py-20 relative overflow-hidden" ref={ref}>
      <div className="container-responsive relative z-10">
        <SectionHeader
          title="أحدث الدورات"
          subtitle="اكتشف أحدث الدورات التي تم إضافتها مؤخراً، مصممة لتناسب احتياجاتك التعليمية"
          variant="premium"
        />
      </div>

      {/* Full Width Course Carousel */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-12 w-full px-12"
      >
        <CourseCarousel
          courses={coursesData}
          showArrows={true}
          showDots={true}
          autoPlay={true}
          itemsPerView={{
            mobile: 1,
            tablet: 2,
            desktop: 3
          }}
          onCourseClick={handleCourseClick}
          className="w-full"
        />
      </motion.div>

      {/* Bottom CTA */}
      <div className="container-responsive relative z-10">
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          <Button size="lg" className="btn-secondary" onClick={() => navigate('/courses')}>
            عرض جميع الدورات
          </Button>
        </motion.div>
      </div>
    </section>
  );
};