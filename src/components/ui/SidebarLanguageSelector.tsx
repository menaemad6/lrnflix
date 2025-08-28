import React from 'react';
import { Button } from './button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Languages } from 'lucide-react';

interface SidebarLanguageSelectorProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export const SidebarLanguageSelector: React.FC<SidebarLanguageSelectorProps> = ({ 
  variant = 'default',
  className = ''
}) => {
  const { currentLanguage, setLanguage } = useLanguage();

  const handleLanguageChange = (lang: 'ar' | 'en') => {
    setLanguage(lang);
  };

  if (variant === 'compact') {
    return (
      <div className={`mx-3 p-2.5 rounded-lg bg-muted/50 backdrop-blur-sm border border-border/40 ${className}`}>
        <div className="font-medium text-xs mb-2 text-muted-foreground">Choose Language</div>
        <div className="grid grid-cols-2 gap-1.5">
          <Button
            variant={currentLanguage === 'en' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleLanguageChange('en')}
            className="h-8 rounded-md text-xs px-2"
          >
            <span className="text-xs font-medium">EN</span>
          </Button>
          <Button
            variant={currentLanguage === 'ar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleLanguageChange('ar')}
            className="h-8 rounded-md text-xs px-2"
          >
            <span className="text-xs font-medium">العربية</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-4 p-3 rounded-xl bg-muted/50 backdrop-blur-sm border border-border/40 ${className}`}>
      <div className="font-medium text-sm mb-2 text-muted-foreground">Choose Language</div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={currentLanguage === 'en' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleLanguageChange('en')}
          className="h-9 rounded-lg"
        >
          <Languages className="h-4 w-4 mr-1.5" />
          English
        </Button>
        <Button
          variant={currentLanguage === 'ar' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleLanguageChange('ar')}
          className="h-9 rounded-lg"
        >
          <Languages className="h-4 w-4 mr-1.5" />
          العربية
        </Button>
      </div>
    </div>
  );
};

export default SidebarLanguageSelector;
