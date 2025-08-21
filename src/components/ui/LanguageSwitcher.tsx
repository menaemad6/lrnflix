import React from 'react';
import { Button } from './button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Languages } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { currentLanguage, setLanguage } = useLanguage();

  const handleLanguageChange = (lang: 'ar' | 'en') => {
    setLanguage(lang);
  };

  return (
    <div className="flex items-center gap-2">
      <Languages className="h-4 w-4 text-muted-foreground" />
      <div className="flex rounded-md border border-border overflow-hidden">
        <Button
          variant={currentLanguage === 'ar' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleLanguageChange('ar')}
          className={`px-3 py-1 text-sm font-medium transition-all ${
            currentLanguage === 'ar'
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted'
          }`}
        >
          العربية
        </Button>
        <Button
          variant={currentLanguage === 'en' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleLanguageChange('en')}
          className={`px-3 py-1 text-sm font-medium transition-all ${
            currentLanguage === 'en'
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted'
          }`}
        >
          English
        </Button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
