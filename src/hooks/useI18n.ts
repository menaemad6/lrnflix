import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';

export const useI18n = (namespace?: string) => {
  const { t, i18n } = useTranslation(namespace);
  const { currentLanguage, setLanguage, toggleLanguage } = useLanguage();

  const changeLanguage = (lang: 'ar' | 'en') => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = currentLanguage === 'ar' ? 'ar-SA' : 'en-US';
    
    return dateObj.toLocaleDateString(locale, options);
  };

  const formatNumber = (number: number, options?: Intl.NumberFormatOptions) => {
    const locale = currentLanguage === 'ar' ? 'ar-SA' : 'en-US';
    
    return number.toLocaleString(locale, options);
  };

  const formatCurrency = (amount: number, currency = 'USD', options?: Intl.NumberFormatOptions) => {
    const locale = currentLanguage === 'ar' ? 'ar-SA' : 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      ...options,
    }).format(amount);
  };

  return {
    t,
    i18n,
    currentLanguage,
    setLanguage: changeLanguage,
    toggleLanguage,
    formatDate,
    formatNumber,
    formatCurrency,
  };
};
