import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import static translations for initial load
import enCommon from './locales/en/common.json';
import arCommon from './locales/ar/common.json';
import enDashboard from './locales/en/dashboard.json';
import arDashboard from './locales/ar/dashboard.json';
import enAuth from './locales/en/auth.json';
import arAuth from './locales/ar/auth.json';
import enCourses from './locales/en/courses.json';
import arCourses from './locales/ar/courses.json';
import enTeacher from './locales/en/teacher.json';
import arTeacher from './locales/ar/teacher.json';
import enNavigation from './locales/en/navigation.json';
import arNavigation from './locales/ar/navigation.json';
import enOther from './locales/en/other.json';
import arOther from './locales/ar/other.json';

const resources = {
  en: {
    common: enCommon,
    dashboard: enDashboard,
    auth: enAuth,
    courses: enCourses,
    teacher: enTeacher,
    navigation: enNavigation,
    other: enOther,
  },
  ar: {
    common: arCommon,
    dashboard: arDashboard,
    auth: arAuth,
    courses: arCourses,
    teacher: arTeacher,
    navigation: arNavigation,
    other: arOther,
  },
};

// Get the saved language from localStorage before initializing i18n
const savedLanguage = localStorage.getItem('i18nextLng');
const initialLanguage = (savedLanguage === 'en' || savedLanguage === 'ar') ? savedLanguage : 'en';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en', // Default to English
    lng: initialLanguage, // Use saved language or default to English
    debug: process.env.NODE_ENV === 'development',
    
    // Backend configuration for dynamic loading
    backend: {
      loadPath: '/src/i18n/locales/{{lng}}/{{ns}}.json',
    },
    
    // Language detection - prioritize localStorage over browser detection
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    
    // Interpolation
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    // Namespace handling
    defaultNS: 'common',
    ns: ['common', 'dashboard', 'auth', 'courses', 'teacher', 'navigation', 'other'],
    
    // React specific
    react: {
      useSuspense: false,
    },
  });

export default i18n;
