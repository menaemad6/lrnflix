import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { useRandomBackground } from "../hooks/useRandomBackground";
import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/components/seo';

export const Unauthorized = () => {
  const bgClass = useRandomBackground();
  const { t } = useTranslation('dashboard');
  
  return (
    <>
      <SEOHead />
      <div className={bgClass + " min-h-screen flex items-center justify-center bg-gray-50 px-4"}>
        <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 text-red-500">
            <AlertTriangle size={48} />
          </div>
          <CardTitle>{t('unauthorized.title')}</CardTitle>
          <CardDescription>
            {t('unauthorized.message')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/">{t('unauthorized.goHome')}</Link>
          </Button>
        </CardContent>
      </Card>
      </div>
    </>
  );
};
