import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Language = 'ar' | 'en';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<Language>('ar');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize language from localStorage or default to Arabic
  useEffect(() => {
    const savedLanguage = localStorage.getItem('i18nextLng') as Language;
    
    if (savedLanguage && (savedLanguage === 'ar' || savedLanguage === 'en')) {
      // Set the language in i18n first
      i18n.changeLanguage(savedLanguage);
      // Then update our local state
      setCurrentLanguage(savedLanguage);
    } else {
      // Default to Arabic if no saved language
      i18n.changeLanguage('ar');
      setCurrentLanguage('ar');
      localStorage.setItem('i18nextLng', 'ar');
    }
    
    setIsInitialized(true);
  }, [i18n]);

  // Sync with i18n language changes from external sources
  useEffect(() => {
    if (!isInitialized) return;

    const handleLanguageChanged = (lng: string) => {
      if (lng === 'ar' || lng === 'en') {
        const newLang = lng as Language;
        if (newLang !== currentLanguage) {
          setCurrentLanguage(newLang);
          localStorage.setItem('i18nextLng', newLang);
        }
      }
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n, currentLanguage, isInitialized]);

  // Update document language attribute
  useEffect(() => {
    if (!isInitialized) return;
    
    const html = document.documentElement;
    html.setAttribute('lang', currentLanguage);
  }, [currentLanguage, isInitialized]);

  // Ensure sync with i18n current language on mount
  useEffect(() => {
    if (i18n.language && (i18n.language === 'ar' || i18n.language === 'en')) {
      const i18nLang = i18n.language as Language;
      if (i18nLang !== currentLanguage) {
        setCurrentLanguage(i18nLang);
      }
    }
  }, [i18n.language, currentLanguage]);

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    toggleLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
