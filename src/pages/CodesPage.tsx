import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SEOHead } from '@/components/seo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const CodesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation('dashboard');
  const code = searchParams.get('code');

  useEffect(() => {
    // If there's a code parameter, redirect to redeem page
    if (code) {
      navigate(`/redeem?code=${code}`, { replace: true });
    }
  }, [code, navigate]);

  const handleRedirectToRedeem = () => {
    navigate('/redeem');
  };

  const handleRedirectToStore = () => {
    navigate('/student/store');
  };

  return (
    <>
      <SEOHead />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Card className="border-0 shadow-2xl bg-card/60 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-primary to-purple-600 mb-6 shadow-lg">
                <Code className="w-10 h-10 text-primary-foreground" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {t('codesRedirect.title', 'Access Codes')}
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                {t('codesRedirect.description', 'Redirecting to code redemption...')}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center text-muted-foreground">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                  <span>{t('codesRedirect.processing', 'Processing...')}</span>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    onClick={handleRedirectToRedeem}
                    className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground"
                    size="lg"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    {t('codesRedirect.redeemCode', 'Redeem Code')}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleRedirectToStore}
                    className="w-full"
                    size="lg"
                  >
                    {t('codesRedirect.getCodes', 'Get Access Codes')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CodesPage;
