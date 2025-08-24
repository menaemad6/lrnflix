import { PLATFORM_NAME } from './constants';

export type Language = 'en' | 'ar';

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
}

export interface RouteSEOConfig {
  [key: string]: {
    [lang in Language]: SEOMetadata;
  };
}

// Base SEO configuration for all routes
export const BASE_SEO_CONFIG: RouteSEOConfig = {
  // Home/Landing page
  '/': {
    en: {
      title: `${PLATFORM_NAME} - AI-Powered Learning Platform`,
      description: `${PLATFORM_NAME} is a modern, AI-powered educational platform for students and teachers. Create, manage, and experience interactive courses, quizzes, and more.`,
      keywords: 'AI learning, online education, interactive courses, educational platform, student portal, teacher tools',
      ogType: 'website',
      ogImage: '/og-image.png',
      canonical: 'https://learnify.app/',
    },
    ar: {
      title: `${PLATFORM_NAME} - منصة التعلم الذكية المدعومة بالذكاء الاصطناعي`,
      description: `${PLATFORM_NAME} هي منصة تعليمية حديثة مدعومة بالذكاء الاصطناعي للطلاب والمعلمين. أنشئ وأدر واختبر الدورات التفاعلية والاختبارات والمزيد.`,
      keywords: 'التعلم الذكي، التعليم عبر الإنترنت، الدورات التفاعلية، المنصة التعليمية، بوابة الطلاب، أدوات المعلمين',
      ogType: 'website',
      ogImage: '/og-image.png',
      canonical: 'https://learnify.app/',
    },
  },

  // Auth pages
  '/auth': {
    en: {
      title: `Sign In | ${PLATFORM_NAME}`,
      description: 'Sign in to your account and access your personalized learning experience.',
      keywords: 'sign in, login, authentication, user account, learning platform',
      ogType: 'website',
      canonical: 'https://learnify.app/auth',
    },
    ar: {
      title: `تسجيل الدخول | ${PLATFORM_NAME}`,
      description: 'سجل دخولك إلى حسابك واحصل على تجربة التعلم الشخصية.',
      keywords: 'تسجيل دخول، مصادقة، حساب المستخدم، منصة التعلم',
      ogType: 'website',
      canonical: 'https://learnify.app/auth',
    },
  },

  // Courses page
  '/courses': {
    en: {
      title: `Courses | ${PLATFORM_NAME}`,
      description: 'Explore our comprehensive collection of courses designed to enhance your learning journey.',
      keywords: 'online courses, learning materials, educational content, skill development',
      ogType: 'website',
      canonical: 'https://learnify.app/courses',
    },
    ar: {
      title: `الدورات | ${PLATFORM_NAME}`,
      description: 'استكشف مجموعتنا الشاملة من الدورات المصممة لتعزيز رحلة التعلم الخاصة بك.',
      keywords: 'الدورات عبر الإنترنت، المواد التعليمية، المحتوى التعليمي، تطوير المهارات',
      ogType: 'website',
      canonical: 'https://learnify.app/courses',
    },
  },

  // Teacher dashboard
  '/teacher/dashboard': {
    en: {
      title: `Teacher Dashboard | ${PLATFORM_NAME}`,
      description: 'Manage your courses, track student progress, and create engaging learning experiences.',
      keywords: 'teacher dashboard, course management, student progress, educational tools',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/dashboard',
    },
    ar: {
      title: `لوحة تحكم المعلم | ${PLATFORM_NAME}`,
      description: 'أدر دوراتك، تتبع تقدم الطلاب، وأنشئ تجارب تعليمية جذابة.',
      keywords: 'لوحة تحكم المعلم، إدارة الدورات، تقدم الطلاب، الأدوات التعليمية',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/dashboard',
    },
  },

  // Teacher courses
  '/teacher/courses': {
    en: {
      title: `My Courses | ${PLATFORM_NAME}`,
      description: 'Create, edit, and manage your courses with our comprehensive course management tools.',
      keywords: 'course creation, course management, teaching tools, educational content',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/courses',
    },
    ar: {
      title: `دوراتي | ${PLATFORM_NAME}`,
      description: 'أنشئ وعدل وأدر دوراتك باستخدام أدوات إدارة الدورات الشاملة لدينا.',
      keywords: 'إنشاء الدورات، إدارة الدورات، أدوات التدريس، المحتوى التعليمي',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/courses',
    },
  },





  // Teacher groups (dynamic route)
  '/teacher/groups/dynamic': {
    en: {
      title: `Group Management | ${PLATFORM_NAME}`,
      description: 'Create and manage study groups to enhance student collaboration and learning.',
      keywords: 'group management, study groups, student collaboration, educational communities',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/groups',
    },
    ar: {
      title: `إدارة المجموعات | ${PLATFORM_NAME}`,
      description: 'أنشئ وأدر مجموعات الدراسة لتعزيز تعاون الطلاب والتعلم.',
      keywords: 'إدارة المجموعات، مجموعات الدراسة، تعاون الطلاب، المجتمعات التعليمية',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/groups',
    },
  },

  // Teacher groups (list page)
  '/teacher/groups': {
    en: {
      title: `My Groups | ${PLATFORM_NAME}`,
      description: 'Manage your study groups and create collaborative learning environments.',
      keywords: 'study groups, group management, collaborative learning, educational communities',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/groups',
    },
    ar: {
      title: `مجموعاتي | ${PLATFORM_NAME}`,
      description: 'أدر مجموعات الدراسة الخاصة بك وأنشئ بيئات التعلم التعاونية.',
      keywords: 'مجموعات الدراسة، إدارة المجموعات، التعلم التعاوني، المجتمعات التعليمية',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/groups',
    },
  },

  // Teacher chapters (list page)
  '/teacher/chapters': {
    en: {
      title: `My Chapters | ${PLATFORM_NAME}`,
      description: 'Organize your courses into structured chapters for better learning outcomes.',
      keywords: 'chapter management, course organization, structured learning, educational structure',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/chapters',
    },
    ar: {
      title: `فصولي | ${PLATFORM_NAME}`,
      description: 'نظم دوراتك في فصول منظمة لتحقيق نتائج تعليمية أفضل.',
      keywords: 'إدارة الفصول، تنظيم الدورات، التعلم المنظم، الهيكل التعليمي',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/chapters',
    },
  },

  // Teacher codes
  '/teacher/codes': {
    en: {
      title: `Access Codes | ${PLATFORM_NAME}`,
      description: 'Create and manage access codes for your courses and content.',
      keywords: 'access codes, course codes, student access, educational codes',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/codes',
    },
    ar: {
      title: `رموز الوصول | ${PLATFORM_NAME}`,
      description: 'أنشئ وأدر رموز الوصول لدوراتك ومحتواك.',
      keywords: 'رموز الوصول، رموز الدورات، وصول الطلاب، الرموز التعليمية',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/codes',
    },
  },

  // Teacher analytics
  '/teacher/analytics': {
    en: {
      title: `Analytics Dashboard | ${PLATFORM_NAME}`,
      description: 'Track student performance and course analytics to improve your teaching.',
      keywords: 'analytics, student performance, course statistics, teaching insights',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/analytics',
    },
    ar: {
      title: `لوحة التحليلات | ${PLATFORM_NAME}`,
      description: 'تتبع أداء الطلاب وتحليلات الدورات لتحسين تدريسك.',
      keywords: 'التحليلات، أداء الطلاب، إحصائيات الدورات، رؤى التدريس',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/analytics',
    },
  },

  // Teacher schedule
  '/teacher/schedule': {
    en: {
      title: `Teaching Schedule | ${PLATFORM_NAME}`,
      description: 'Manage your teaching schedule and upcoming sessions.',
      keywords: 'teaching schedule, session management, time management, educational planning',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/schedule',
    },
    ar: {
      title: `جدول التدريس | ${PLATFORM_NAME}`,
      description: 'أدر جدول التدريس الخاص بك والجلسات القادمة.',
      keywords: 'جدول التدريس، إدارة الجلسات، إدارة الوقت، التخطيط التعليمي',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/schedule',
    },
  },

  // Teacher notifications
  '/teacher/notifications': {
    en: {
      title: `Notifications | ${PLATFORM_NAME}`,
      description: 'Stay updated with important notifications about your courses and students.',
      keywords: 'notifications, course updates, student alerts, teaching notifications',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/notifications',
    },
    ar: {
      title: `الإشعارات | ${PLATFORM_NAME}`,
      description: 'ابق محدثًا بالإشعارات المهمة حول دوراتك وطلابك.',
      keywords: 'الإشعارات، تحديثات الدورات، تنبيهات الطلاب، إشعارات التدريس',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/notifications',
    },
  },

  // Teacher colors
  '/teacher/colors': {
    en: {
      title: `Branding & Colors | ${PLATFORM_NAME}`,
      description: 'Customize your platform colors and branding to match your style.',
      keywords: 'branding, custom colors, platform customization, visual identity',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/colors',
    },
    ar: {
      title: `العلامة التجارية والألوان | ${PLATFORM_NAME}`,
      description: 'خصص ألوان منصتك وعلامتك التجارية لتطابق أسلوبك.',
      keywords: 'العلامة التجارية، الألوان المخصصة، تخصيص المنصة، الهوية البصرية',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/colors',
    },
  },

  // Teacher students
  '/teacher/students': {
    en: {
      title: `My Students | ${PLATFORM_NAME}`,
      description: 'Manage and track your students across all your courses.',
      keywords: 'student management, student tracking, course enrollment, educational oversight',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/students',
    },
    ar: {
      title: `طلابي | ${PLATFORM_NAME}`,
      description: 'أدر وتتبع طلابك في جميع دوراتك.',
      keywords: 'إدارة الطلاب، تتبع الطلاب، تسجيل الدورات، الإشراف التعليمي',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/students',
    },
  },

  // Teacher multiplayer quiz
  '/teacher/multiplayer-quiz': {
    en: {
      title: `Quiz Management | ${PLATFORM_NAME}`,
      description: 'Create and manage multiplayer quiz games for your students.',
      keywords: 'quiz management, multiplayer games, educational games, interactive learning',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/multiplayer-quiz',
    },
    ar: {
      title: `إدارة الاختبارات | ${PLATFORM_NAME}`,
      description: 'أنشئ وأدر ألعاب الاختبارات متعددة اللاعبين لطلابك.',
      keywords: 'إدارة الاختبارات، الألعاب متعددة اللاعبين، الألعاب التعليمية، التعلم التفاعلي',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/multiplayer-quiz',
    },
  },

  // Teacher invoices
  '/teacher/invoices': {
    en: {
      title: `Invoice Management | ${PLATFORM_NAME}`,
      description: 'Manage and track all your course invoices, confirm payments, and enroll students automatically.',
      keywords: 'invoice management, payment tracking, student enrollment, course billing, payment confirmation',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/invoices',
    },
    ar: {
      title: `إدارة الفواتير | ${PLATFORM_NAME}`,
      description: 'أدر وتتبع جميع فواتير دوراتك، أكد المدفوعات، وسجل الطلاب تلقائياً.',
      keywords: 'إدارة الفواتير، تتبع المدفوعات، تسجيل الطلاب، فوترة الدورات، تأكيد الدفع',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/invoices',
    },
  },

  // Invoice detail page (dynamic)
  '/invoices/dynamic': {
    en: {
      title: `Invoice Details | ${PLATFORM_NAME}`,
      description: 'View detailed information about your invoice, payment status, and enrollment details.',
      keywords: 'invoice details, payment status, enrollment information, course access, payment history',
      ogType: 'website',
      canonical: 'https://learnify.app/invoices',
    },
    ar: {
      title: `تفاصيل الفاتورة | ${PLATFORM_NAME}`,
      description: 'عرض معلومات مفصلة حول فاتورتك وحالة الدفع وتفاصيل التسجيل.',
      keywords: 'تفاصيل الفاتورة، حالة الدفع، معلومات التسجيل، الوصول للدورة، سجل المدفوعات',
      ogType: 'website',
      canonical: 'https://learnify.app/invoices',
    },
  },



  // Student dashboard
  '/student/dashboard': {
    en: {
      title: `Student Dashboard | ${PLATFORM_NAME}`,
      description: 'Track your learning progress, access your courses, and manage your educational journey.',
      keywords: 'student dashboard, learning progress, course access, educational tracking',
      ogType: 'website',
      canonical: 'https://learnify.app/student/dashboard',
    },
    ar: {
      title: `لوحة تحكم الطالب | ${PLATFORM_NAME}`,
      description: 'تتبع تقدم تعلمك، واحصل على دوراتك، وأدر رحلتك التعليمية.',
      keywords: 'لوحة تحكم الطالب، تقدم التعلم، الوصول للدورات، التتبع التعليمي',
      ogType: 'website',
      canonical: 'https://learnify.app/student/dashboard',
    },
  },

  // Student courses
  '/student/courses': {
    en: {
      title: `My Learning | ${PLATFORM_NAME}`,
      description: 'Access your enrolled courses and continue your learning journey.',
      keywords: 'enrolled courses, learning progress, student portal, educational access',
      ogType: 'website',
      canonical: 'https://learnify.app/student/courses',
    },
    ar: {
      title: `تعلمي | ${PLATFORM_NAME}`,
      description: 'احصل على الدورات المسجلة واستمر في رحلة التعلم الخاصة بك.',
      keywords: 'الدورات المسجلة، تقدم التعلم، بوابة الطالب، الوصول التعليمي',
      ogType: 'website',
      canonical: 'https://learnify.app/student/courses',
    },
  },

  // Student chapters
  '/student/chapters': {
    en: {
      title: `My Chapters | ${PLATFORM_NAME}`,
      description: 'Access your enrolled learning chapters and structured educational content.',
      keywords: 'enrolled chapters, learning chapters, structured content, student portal',
      ogType: 'website',
      canonical: 'https://learnify.app/student/chapters',
    },
    ar: {
      title: `فصولي | ${PLATFORM_NAME}`,
      description: 'احصل على فصول التعلم المسجلة والمحتوى التعليمي المنظم.',
      keywords: 'الفصول المسجلة، فصول التعلم، المحتوى المنظم، بوابة الطالب',
      ogType: 'website',
      canonical: 'https://learnify.app/student/chapters',
    },
  },

  // Student groups
  '/student/groups': {
    en: {
      title: `My Study Groups | ${PLATFORM_NAME}`,
      description: 'Access your study groups, collaborate with peers, and enhance your learning experience.',
      keywords: 'study groups, collaboration, peer learning, student portal, educational communities',
      ogType: 'website',
      canonical: 'https://learnify.app/student/groups',
    },
    ar: {
      title: `مجموعات الدراسة الخاصة بي | ${PLATFORM_NAME}`,
      description: 'احصل على مجموعات الدراسة الخاصة بك، تعاون مع زملائك، وحسن تجربة التعلم الخاصة بك.',
      keywords: 'مجموعات الدراسة، التعاون، التعلم من الأقران، بوابة الطالب، المجتمعات التعليمية',
      ogType: 'website',
      canonical: 'https://learnify.app/student/groups',
    },
  },

  // Student transactions
  '/student/transactions': {
    en: {
      title: `My Transactions | ${PLATFORM_NAME}`,
      description: 'View your transaction history, wallet balance, and financial activity.',
      keywords: 'transactions, wallet balance, financial history, student portal, credits',
      ogType: 'website',
      canonical: 'https://learnify.app/student/transactions',
    },
    ar: {
      title: `معاملاتي | ${PLATFORM_NAME}`,
      description: 'عرض سجل المعاملات الخاصة بك ورصيد المحفظة والنشاط المالي.',
      keywords: 'المعاملات، رصيد المحفظة، السجل المالي، بوابة الطالب، الرصيد',
      ogType: 'website',
      canonical: 'https://learnify.app/student/transactions',
    },
  },

  // Chapters
  '/chapters': {
    en: {
      title: `Chapters | ${PLATFORM_NAME}`,
      description: 'Explore organized learning chapters and structured educational content.',
      keywords: 'learning chapters, structured content, educational organization, course structure',
      ogType: 'website',
      canonical: 'https://learnify.app/chapters',
    },
    ar: {
      title: `الفصول | ${PLATFORM_NAME}`,
      description: 'استكشف فصول التعلم المنظمة والمحتوى التعليمي المنظم.',
      keywords: 'فصول التعلم، المحتوى المنظم، التنظيم التعليمي، هيكل الدورة',
      ogType: 'website',
      canonical: 'https://learnify.app/chapters',
    },
  },

  // Groups
  '/groups': {
    en: {
      title: `Study Groups | ${PLATFORM_NAME}`,
      description: 'Join study groups, collaborate with peers, and enhance your learning experience.',
      keywords: 'study groups, collaboration, peer learning, group study, educational communities',
      ogType: 'website',
      canonical: 'https://learnify.app/groups',
    },
    ar: {
      title: `مجموعات الدراسة | ${PLATFORM_NAME}`,
      description: 'انضم إلى مجموعات الدراسة، تعاون مع زملائك، وحسن تجربة التعلم الخاصة بك.',
      keywords: 'مجموعات الدراسة، التعاون، التعلم من الأقران، الدراسة الجماعية، المجتمعات التعليمية',
      ogType: 'website',
      canonical: 'https://learnify.app/groups',
    },
  },

  // Questions
  '/questions': {
    en: {
      title: `Q&A | ${PLATFORM_NAME}`,
      description: 'Ask questions, get answers, and engage with the learning community.',
      keywords: 'questions and answers, learning community, educational support, student help',
      ogType: 'website',
      canonical: 'https://learnify.app/questions',
    },
    ar: {
      title: `الأسئلة والأجوبة | ${PLATFORM_NAME}`,
      description: 'اطرح الأسئلة، احصل على الإجابات، وتفاعل مع مجتمع التعلم.',
      keywords: 'الأسئلة والإجابات، مجتمع التعلم، الدعم التعليمي، مساعدة الطلاب',
      ogType: 'website',
      canonical: 'https://learnify.app/questions',
    },
  },

  // Teachers
  '/teachers': {
    en: {
      title: `Our Teachers | ${PLATFORM_NAME}`,
      description: 'Meet our experienced educators and discover their expertise and courses.',
      keywords: 'teachers, educators, instructors, teaching expertise, educational professionals',
      ogType: 'website',
      canonical: 'https://learnify.app/teachers',
    },
    ar: {
      title: `معلمونا | ${PLATFORM_NAME}`,
      description: 'تعرف على معلمينا ذوي الخبرة واكتشف خبراتهم ودوراتهم.',
      keywords: 'المعلمون، المربون، المدربون، خبرة التدريس، المتخصصون التعليميون',
      ogType: 'website',
      canonical: 'https://learnify.app/teachers',
    },
  },

  // Settings
  '/dashboard/settings': {
    en: {
      title: `Settings | ${PLATFORM_NAME}`,
      description: 'Customize your account settings and preferences.',
      keywords: 'account settings, preferences, user configuration, platform settings',
      ogType: 'website',
      canonical: 'https://learnify.app/dashboard/settings',
    },
    ar: {
      title: `الإعدادات | ${PLATFORM_NAME}`,
      description: 'خصص إعدادات حسابك وتفضيلاتك.',
      keywords: 'إعدادات الحساب، التفضيلات، تكوين المستخدم، إعدادات المنصة',
      ogType: 'website',
      canonical: 'https://learnify.app/dashboard/settings',
    },
  },

  // Redeem
  '/redeem': {
    en: {
      title: `Redeem Code | ${PLATFORM_NAME}`,
      description: 'Redeem your access code to unlock premium content and features.',
      keywords: 'redeem code, access code, premium content, unlock features',
      ogType: 'website',
      canonical: 'https://learnify.app/redeem',
    },
    ar: {
      title: `استبدال الكود | ${PLATFORM_NAME}`,
      description: 'استبدل كود الوصول الخاص بك لفتح المحتوى المميز والميزات.',
      keywords: 'استبدال الكود، كود الوصول، المحتوى المميز، فتح الميزات',
      ogType: 'website',
      canonical: 'https://learnify.app/redeem',
    },
  },

  // Multiplayer Quiz
  '/multiplayer-quiz': {
    en: {
      title: `Multiplayer Quiz | ${PLATFORM_NAME}`,
      description: 'Challenge your friends in real-time multiplayer quizzes and test your knowledge.',
      keywords: 'multiplayer quiz, real-time gaming, knowledge testing, educational games',
      ogType: 'website',
      canonical: 'https://learnify.app/multiplayer-quiz',
    },
    ar: {
      title: `اختبار متعدد اللاعبين | ${PLATFORM_NAME}`,
      description: 'تحدى أصدقائك في اختبارات متعددة اللاعبين في الوقت الفعلي واختبر معرفتك.',
      keywords: 'اختبار متعدد اللاعبين، ألعاب الوقت الفعلي، اختبار المعرفة، الألعاب التعليمية',
      ogType: 'website',
      canonical: 'https://learnify.app/multiplayer-quiz',
    },
  },

  // Store
  '/student/store': {
    en: {
      title: `Learning Store | ${PLATFORM_NAME}`,
      description: 'Discover premium courses, tools, and resources to enhance your learning.',
      keywords: 'learning store, premium courses, educational resources, learning tools',
      ogType: 'website',
      canonical: 'https://learnify.app/student/store',
    },
    ar: {
      title: `متجر التعلم | ${PLATFORM_NAME}`,
      description: 'اكتشف الدورات المميزة والأدوات والموارد لتعزيز تعلمك.',
      keywords: 'متجر التعلم، الدورات المميزة، الموارد التعليمية، أدوات التعلم',
      ogType: 'website',
      canonical: 'https://learnify.app/student/store',
    },
  },

  // Course View (dynamic route)
  '/courses/dynamic': {
    en: {
      title: `Course Details | ${PLATFORM_NAME}`,
      description: 'Explore course content, lessons, and learning materials.',
      keywords: 'course details, course content, lessons, learning materials, educational content',
      ogType: 'website',
      canonical: 'https://learnify.app/courses',
    },
    ar: {
      title: `تفاصيل الدورة | ${PLATFORM_NAME}`,
      description: 'استكشف محتوى الدورة والدروس والمواد التعليمية.',
      keywords: 'تفاصيل الدورة، محتوى الدورة، الدروس، المواد التعليمية، المحتوى التعليمي',
      ogType: 'website',
      canonical: 'https://learnify.app/courses',
    },
  },

  // Course Progress (dynamic route)
  '/courses/progress': {
    en: {
      title: `Course Progress | ${PLATFORM_NAME}`,
      description: 'Track your learning progress and continue your educational journey.',
      keywords: 'course progress, learning progress, educational tracking, student progress',
      ogType: 'website',
      canonical: 'https://learnify.app/courses',
    },
    ar: {
      title: `تقدم الدورة | ${PLATFORM_NAME}`,
      description: 'تتبع تقدم تعلمك واستمر في رحلتك التعليمية.',
      keywords: 'تقدم الدورة، تقدم التعلم، التتبع التعليمي، تقدم الطالب',
      ogType: 'website',
      canonical: 'https://learnify.app/courses',
    },
  },

  // Student Notifications
  '/student/notifications': {
    en: {
      title: `My Notifications | ${PLATFORM_NAME}`,
      description: 'Stay updated with your learning notifications and important updates.',
      keywords: 'notifications, learning updates, student alerts, educational notifications',
      ogType: 'website',
      canonical: 'https://learnify.app/student/notifications',
    },
    ar: {
      title: `إشعاراتي | ${PLATFORM_NAME}`,
      description: 'ابق على اطلاع بإشعارات التعلم والتحديثات المهمة.',
      keywords: 'الإشعارات، تحديثات التعلم، تنبيهات الطالب، الإشعارات التعليمية',
      ogType: 'website',
      canonical: 'https://learnify.app/student/notifications',
    },
  },





  // Teacher Profile (dynamic route)
  '/teachers/dynamic': {
    en: {
      title: `Teacher Profile | ${PLATFORM_NAME}`,
      description: 'Learn more about this expert teacher and explore their courses and expertise.',
      keywords: 'teacher profile, instructor bio, teacher courses, educator background',
      ogType: 'profile',
      canonical: 'https://learnify.app/teachers',
    },
    ar: {
      title: `ملف المعلم | ${PLATFORM_NAME}`,
      description: 'تعرف على المزيد حول هذا المعلم الخبير واستكشف دوراته وخبراته.',
      keywords: 'ملف المعلم، سيرة المدرب، دورات المعلم، خلفية المربي',
      ogType: 'profile',
      canonical: 'https://learnify.app/teachers',
    },
  },

  // Teacher Course Detail (dynamic route)
  '/teacher/courses/dynamic': {
    en: {
      title: `Course Management | ${PLATFORM_NAME}`,
      description: 'Manage your course content, lessons, quizzes, and student enrollments.',
      keywords: 'course management, lesson management, quiz management, student enrollments, course content',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/courses',
    },
    ar: {
      title: `إدارة الدورة | ${PLATFORM_NAME}`,
      description: 'أدر محتوى دورتك والدروس والاختبارات وتسجيلات الطلاب.',
      keywords: 'إدارة الدورة، إدارة الدروس، إدارة الاختبارات، تسجيلات الطلاب، محتوى الدورة',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/courses',
    },
  },

  // Teacher Course Management (dynamic route)
  '/teacher/courses/manage/dynamic': {
    en: {
      title: `Course Management | ${PLATFORM_NAME}`,
      description: 'Comprehensive course management tools for lessons, quizzes, and student progress.',
      keywords: 'course management, lesson editor, quiz editor, student progress, course administration',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/courses',
    },
    ar: {
      title: `إدارة الدورة | ${PLATFORM_NAME}`,
      description: 'أدوات إدارة الدورات الشاملة للدروس والاختبارات وتقدم الطلاب.',
      keywords: 'إدارة الدورة، محرر الدروس، محرر الاختبارات، تقدم الطلاب، إدارة الدورة',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/courses',
    },
  },

  // Teacher Chapter Management (dynamic route)
  '/teacher/chapters/dynamic': {
    en: {
      title: `Chapter Management | ${PLATFORM_NAME}`,
      description: 'Organize and manage your learning chapters with comprehensive tools.',
      keywords: 'chapter management, learning organization, educational structure, course chapters',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/chapters',
    },
    ar: {
      title: `إدارة الفصول | ${PLATFORM_NAME}`,
      description: 'نظم وأدر فصول التعلم الخاصة بك بأدوات شاملة.',
      keywords: 'إدارة الفصول، تنظيم التعلم، الهيكل التعليمي، فصول الدورات',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/chapters',
    },
  },

  // Teacher Student Detail (dynamic route)
  '/teacher/students/dynamic': {
    en: {
      title: `Student Profile | ${PLATFORM_NAME}`,
      description: 'View detailed student information, progress, and performance analytics.',
      keywords: 'student profile, student progress, performance analytics, student management, educational tracking',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/students',
    },
    ar: {
      title: `ملف الطالب | ${PLATFORM_NAME}`,
      description: 'عرض معلومات الطالب التفصيلية والتقدم وتحليلات الأداء.',
      keywords: 'ملف الطالب، تقدم الطالب، تحليلات الأداء، إدارة الطلاب، التتبع التعليمي',
      ogType: 'website',
      canonical: 'https://learnify.app/teacher/students',
    },
  },



  // Group Detail (dynamic route)
  '/groups/dynamic': {
    en: {
      title: `Study Group | ${PLATFORM_NAME}`,
      description: 'Join this study group to collaborate with peers and enhance your learning experience.',
      keywords: 'study group, group learning, peer collaboration, educational community',
      ogType: 'website',
      canonical: 'https://learnify.app/groups',
    },
    ar: {
      title: `مجموعة الدراسة | ${PLATFORM_NAME}`,
      description: 'انضم إلى مجموعة الدراسة هذه للتعاون مع الأقران وتعزيز تجربة التعلم.',
      keywords: 'مجموعة الدراسة، التعلم الجماعي، التعاون بين الأقران، المجتمع التعليمي',
      ogType: 'website',
      canonical: 'https://learnify.app/groups',
    },
  },

  // Auth Callback
  '/auth/callback': {
    en: {
      title: `Authentication | ${PLATFORM_NAME}`,
      description: 'Processing your authentication request. Please wait while we complete your login.',
      keywords: 'authentication, login processing, auth callback, user verification',
      ogType: 'website',
      canonical: 'https://learnify.app/auth/callback',
    },
    ar: {
      title: `المصادقة | ${PLATFORM_NAME}`,
      description: 'معالجة طلب المصادقة الخاص بك. يرجى الانتظار بينما نكمل تسجيل الدخول.',
      keywords: 'المصادقة، معالجة تسجيل الدخول، استدعاء المصادقة، التحقق من المستخدم',
      ogType: 'website',
      canonical: 'https://learnify.app/auth/callback',
    },
  },

  // Codes Redirect
  '/codes': {
    en: {
      title: `Access Codes | ${PLATFORM_NAME}`,
      description: 'Redirecting to code redemption page. Enter your access code to unlock premium content.',
      keywords: 'access codes, code redemption, premium content, unlock features',
      ogType: 'website',
      canonical: 'https://learnify.app/codes',
    },
    ar: {
      title: `رموز الوصول | ${PLATFORM_NAME}`,
      description: 'إعادة توجيه إلى صفحة استبدال الكود. أدخل رمز الوصول الخاص بك لفتح المحتوى المميز.',
      keywords: 'رموز الوصول، استبدال الكود، المحتوى المميز، فتح الميزات',
      ogType: 'website',
      canonical: 'https://learnify.app/codes',
    },
  },

  // Unauthorized
  '/unauthorized': {
    en: {
      title: `Access Denied | ${PLATFORM_NAME}`,
      description: 'You do not have permission to access this resource. Please contact an administrator for assistance.',
      keywords: 'access denied, unauthorized, permission error, access control',
      ogType: 'website',
      canonical: 'https://learnify.app/unauthorized',
    },
    ar: {
      title: `الوصول مرفوض | ${PLATFORM_NAME}`,
      description: 'ليس لديك إذن للوصول إلى هذا المورد. يرجى الاتصال بالمسؤول للحصول على المساعدة.',
      keywords: 'الوصول مرفوض، غير مصرح، خطأ في الإذن، التحكم في الوصول',
      ogType: 'website',
      canonical: 'https://learnify.app/unauthorized',
    },
  },

  // Not Found
  '*': {
    en: {
      title: `Page Not Found | ${PLATFORM_NAME}`,
      description: 'The page you are looking for could not be found.',
      keywords: '404, page not found, error page',
      ogType: 'website',
      canonical: 'https://learnify.app/404',
    },
    ar: {
      title: `الصفحة غير موجودة | ${PLATFORM_NAME}`,
      description: 'الصفحة التي تبحث عنها غير موجودة.',
      keywords: '404، صفحة غير موجودة، صفحة خطأ',
      ogType: 'website',
      canonical: 'https://learnify.app/404',
    },
  },
};

// Function to get SEO metadata for a specific route and language
export const getSEOMetadata = (
  route: string,
  language: Language,
  tenantName?: string
): SEOMetadata => {
  // Find the best matching route
  let config = BASE_SEO_CONFIG[route];
  
  if (!config) {
    // Handle dynamic routes with parameters
    if (route.startsWith('/courses/') && route.includes('/progress')) {
      // Course progress route
      config = BASE_SEO_CONFIG['/courses/progress'];
    } else if (route.startsWith('/courses/') && route.split('/').length === 3) {
      // Course detail route (e.g., /courses/123)
      config = BASE_SEO_CONFIG['/courses/dynamic'];
    } else if (route.startsWith('/chapters/') && route.split('/').length === 3) {
      // Chapter detail route (e.g., /chapters/123)
      config = BASE_SEO_CONFIG['/chapters'];
    } else if (route.startsWith('/teachers/') && route.split('/').length === 3) {
      // Teacher profile route (e.g., /teachers/john-doe)
      config = BASE_SEO_CONFIG['/teachers/dynamic'];
    } else if (route.startsWith('/groups/') && route.split('/').length === 3) {
      // Group detail route (e.g., /groups/123)
      config = BASE_SEO_CONFIG['/groups/dynamic'];
    } else if (route.startsWith('/teacher/courses/') && route.split('/').length === 3) {
      // Teacher course detail route (e.g., /teacher/courses/123)
      config = BASE_SEO_CONFIG['/teacher/courses/dynamic'];
    } else if (route.startsWith('/teacher/courses/') && route.includes('/manage') && route.split('/').length >= 4) {
      // Teacher course management route (e.g., /teacher/courses/123/manage, /teacher/courses/123/manage/lessons)
      config = BASE_SEO_CONFIG['/teacher/courses/manage/dynamic'];
    } else if (route.startsWith('/teacher/chapters/') && route.split('/').length === 3) {
      // Teacher chapter management route (e.g., /teacher/chapters/123)
      config = BASE_SEO_CONFIG['/teacher/chapters/dynamic'];
    } else if (route.startsWith('/teacher/groups/') && route.split('/').length === 3) {
      // Teacher group management route (e.g., /teacher/groups/123)
      config = BASE_SEO_CONFIG['/teacher/groups/dynamic'];
    } else if (route.startsWith('/teacher/students/') && route.split('/').length === 3) {
      // Teacher student detail route (e.g., /teacher/students/123)
      config = BASE_SEO_CONFIG['/teacher/students/dynamic'];
    } else if (route.startsWith('/invoices/') && route.split('/').length === 3) {
      // Invoice detail route (e.g., /invoices/123)
      config = BASE_SEO_CONFIG['/invoices/dynamic'];
    } else {
      // Try to find a partial match (e.g., /courses/123 -> /courses)
      const baseRoute = '/' + route.split('/')[1];
      config = BASE_SEO_CONFIG[baseRoute];
    }
  }
  
  if (!config) {
    // Fallback to 404
    config = BASE_SEO_CONFIG['*'];
  }

  const baseMetadata = config[language];
  
  // If we have a tenant name, customize the title and other metadata
  if (tenantName) {
    const tenantTitle = baseMetadata.title.replace(PLATFORM_NAME, tenantName);
    const tenantOgTitle = baseMetadata.ogTitle ? baseMetadata.ogTitle.replace(PLATFORM_NAME, tenantName) : tenantTitle;
    const tenantTwitterTitle = baseMetadata.twitterTitle ? baseMetadata.twitterTitle.replace(PLATFORM_NAME, tenantName) : tenantTitle;
    
    return {
      ...baseMetadata,
      title: tenantTitle,
      ogTitle: tenantOgTitle,
      twitterTitle: tenantTwitterTitle,
      // Also update description to include tenant context when appropriate
      description: baseMetadata.description.replace(PLATFORM_NAME, tenantName),
      ogDescription: baseMetadata.ogDescription ? baseMetadata.ogDescription.replace(PLATFORM_NAME, tenantName) : undefined,
      twitterDescription: baseMetadata.twitterDescription ? baseMetadata.twitterDescription.replace(PLATFORM_NAME, tenantName) : undefined,
    };
  }
  
  return baseMetadata;
};

// Function to get dynamic SEO metadata for specific content
export const getDynamicSEOMetadata = (
  baseRoute: string,
  language: Language,
  contentTitle: string,
  contentDescription: string,
  tenantName?: string
): SEOMetadata => {
  // Handle specific routes for better SEO
  let baseConfig;
  
  if (baseRoute === '/courses') {
    // For course-related pages
    baseConfig = BASE_SEO_CONFIG['/courses/dynamic'];
  } else if (baseRoute === '/chapters') {
    // For chapter-related pages
    baseConfig = BASE_SEO_CONFIG['/chapters'];
  } else if (baseRoute === '/teachers') {
    // For teacher profile pages
    baseConfig = BASE_SEO_CONFIG['/teachers/dynamic'];
  } else if (baseRoute === '/groups') {
    // For group detail pages
    baseConfig = BASE_SEO_CONFIG['/groups/dynamic'];
  } else if (baseRoute === '/teacher/courses') {
    // For teacher course pages
    baseConfig = BASE_SEO_CONFIG['/teacher/courses/dynamic'];
  } else if (baseRoute === '/teacher/chapters') {
    // For teacher chapter pages
    baseConfig = BASE_SEO_CONFIG['/teacher/chapters/dynamic'];
  } else if (baseRoute === '/teacher/groups') {
    // For teacher group pages
    baseConfig = BASE_SEO_CONFIG['/teacher/groups/dynamic'];
  } else if (baseRoute === '/teacher/students') {
    // For teacher student pages
    baseConfig = BASE_SEO_CONFIG['/teacher/students/dynamic'];
  } else if (baseRoute === '/invoices') {
    // For invoice detail pages
    baseConfig = BASE_SEO_CONFIG['/invoices/dynamic'];
  } else {
    // Fallback to the provided base route
    baseConfig = BASE_SEO_CONFIG[baseRoute];
  }
  
  if (!baseConfig) {
    return getSEOMetadata('*', language, tenantName);
  }

  const baseMetadata = baseConfig[language];
  const platformName = tenantName || PLATFORM_NAME;
  
  return {
    title: `${contentTitle} | ${platformName}`,
    description: contentDescription,
    keywords: baseMetadata.keywords,
    ogTitle: `${contentTitle} | ${platformName}`,
    ogDescription: contentDescription,
    ogImage: baseMetadata.ogImage,
    ogType: baseMetadata.ogType,
    twitterTitle: `${contentTitle} | ${platformName}`,
    twitterDescription: contentDescription,
    twitterImage: baseMetadata.twitterImage,
    canonical: baseMetadata.canonical,
  };
};
