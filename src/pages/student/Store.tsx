import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSelector } from 'react-redux';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { 
  CreditCard, 
  Clock, 
  Zap, 
  Gift, 
  Star, 
  Sparkles,
  Wallet,
  MessageSquare
} from 'lucide-react';
import type { RootState } from '@/store/store';
import { useRandomBackground } from "../../hooks/useRandomBackground";
import { useDispatch } from 'react-redux';
import { updateUser } from '@/store/slices/authSlice';
import { useTranslation } from 'react-i18next';
import { SEOHead } from '@/components/seo';
import { PurchaseChoicesModal } from '@/components/courses/PurchaseChoicesModal';
import { useAiAssistantSettings } from '@/hooks/useAiAssistantSettings';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular: boolean;
  description: string;
  bonus?: number;
}

interface MinutePackage {
  id: string;
  name: string;
  minutes: number;
  cost: number;
  price: number;
  description: string;
  savings?: number;
}

const Store = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { toast } = useToast();
  const { t } = useTranslation('dashboard');
  const [loading, setLoading] = useState<string | null>(null);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showMinutesModal, setShowMinutesModal] = useState(false);
  const [selectedCreditsPackage, setSelectedCreditsPackage] = useState<CreditPackage | null>(null);
  const [selectedMinutesPackage, setSelectedMinutesPackage] = useState<MinutePackage | null>(null);
  const bgClass = useRandomBackground();
  const dispatch = useDispatch();
  const { values: aiSettings, loading: settingsLoading } = useAiAssistantSettings();

  const creditPackages: CreditPackage[] = [
    {
      id: 'basic',
      name: t('studentStore.basicPackage'),
      credits: 50,
      price: 50, // EGP
      popular: false,
      description: t('studentStore.perfectForGettingStarted')
    },
    {
      id: 'popular',
      name: t('studentStore.popularPackage'),
      credits: 150,
      price: 140, // EGP
      popular: true,
      description: t('studentStore.mostChosenByStudents'),
      bonus: 10 // bonus credits
    },
    {
      id: 'premium',
      name: t('studentStore.premiumPackage'),
      credits: 300,
      price: 270, // EGP
      popular: false,
      description: t('studentStore.maximumValueForHeavyUsers'),
      bonus: 30 // bonus credits
    }
  ];

  // Calculate minutes packages dynamically based on database setting
  const minutePackages = useMemo(() => {
    const minutesPrice = aiSettings.minutes_price ? parseFloat(aiSettings.minutes_price) : 1; // Default to 1 credit per minute
    
    const packages: MinutePackage[] = [
      {
        id: 'starter',
        name: t('studentStore.extraMinutes'),
        minutes: 5,
        cost: 5 * minutesPrice, // Calculate cost based on minutes price
        price: Math.round((5 * minutesPrice)), // EGP price (50% of credit cost)
        description: t('studentStore.perfectForShortSessions'),
        // savings: Math.round(2 * minutesPrice) // Calculate savings based on minutes price
      },
      {
        id: 'standard',
        name: t('studentStore.studySession'),
        minutes: 10,
        cost: 10 * minutesPrice, // Calculate cost based on minutes price
        price: Math.round((8 * minutesPrice) ), // EGP price (50% of credit cost)
        description: t('studentStore.greatForFocusedLearning'),
        savings: Math.round(2 * minutesPrice) // Calculate savings based on minutes price
      },
      {
        id: 'extended',
        name: t('studentStore.deepLearning'),
        minutes: 30,
        cost:30 * minutesPrice, // Calculate cost based on minutes price
        price: Math.round((25 * minutesPrice) ), // EGP price (50% of credit cost)
        description: t('studentStore.forComprehensiveStudy'),
        savings: Math.round(5 * minutesPrice) // Calculate savings based on minutes price
      }
    ];
    
    return packages;
  }, [aiSettings.minutes_price, t]);

  const handlePurchaseCredits = (pkg: CreditPackage) => {
    setSelectedCreditsPackage(pkg);
    setShowCreditsModal(true);
  };

  const handlePurchaseMinutes = (pkg: MinutePackage) => {
    setSelectedMinutesPackage(pkg);
    setShowMinutesModal(true);
  };

  const handleCreditsModalClose = () => {
    setShowCreditsModal(false);
    setSelectedCreditsPackage(null);
  };

  const handleMinutesModalClose = () => {
    setShowMinutesModal(false);
    setSelectedMinutesPackage(null);
  };


  return (
    <>
      <SEOHead />
      <div className={bgClass + " min-h-screen"}>
        <div className="container mx-auto px-4 py-8 max-w-6xl pt-[120px]">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-primary">{t('studentStore.store')}</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('studentStore.purchaseCreditsAndMinutes')}
          </p>
        </div>

        {/* Current Balance */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-start">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-sm text-muted-foreground">{t('studentStore.yourBalance')}</div>
                  <div className="text-2xl font-bold">{user?.wallet || 0} {t('studentStore.egp')}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-start">
                <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-primary-600" />
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-sm text-muted-foreground">{t('studentStore.assistantMinutes')}</div>
                  <div className="text-2xl font-bold">{user?.minutes || 0} {t('studentStore.minutes')}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit Packages */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-bold">{t('studentStore.creditPackages')}</h2>
            <Badge variant="default">{t('studentStore.payWithEgp')}</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {creditPackages.map((pkg) => (
              <Card key={pkg.id} className={`relative ${pkg.popular ? 'border-primary ring-2 ring-primary/20' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge variant='default'>
                      <Star className="h-3 w-3 mr-1" />
                      {t('studentStore.mostPopular')}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                  <div className="mt-4">
                    <div className="text-3xl font-bold">{pkg.price} {t('studentStore.egp')}</div>
                    <div className="text-lg text-muted-foreground">
                      {pkg.credits} {t('studentStore.credits')}
                      {pkg.bonus && (
                        <span className="text-primary-600 text-sm ml-2">
                          +{pkg.bonus} {t('studentStore.bonus')}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <Button 
                    className="w-full" 
                    variant={pkg.popular ? "default" : "outline"}
                    onClick={() => handlePurchaseCredits(pkg)}
                    disabled={loading === pkg.id}
                  >
                    {loading === pkg.id ? t('studentStore.processing') : t('studentStore.purchasePackage')}
                  </Button>
                  
                  <div className="text-center text-xs text-muted-foreground mt-2">
                    ≈ {(pkg.price / (pkg.credits + (pkg.bonus || 0))).toFixed(2)} {t('studentStore.egpPerCredit')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator className="my-8" />

        {/* Assistant Minutes */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-bold">{t('studentStore.assistantMinutesTitle')}</h2>
            <Badge variant="default">{t('studentStore.payWithEgp')}</Badge>
          </div>

          {/* Free Minutes Info */}
          <Card className="mb-6 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center">
                  <Gift className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-800 dark:text-primary-400">{t('studentStore.dailyFreeMinutes')}</h3>
                  <p className="text-primary-700 dark:text-primary-300 text-sm">
                    {t('studentStore.everyStudentGets5Minutes')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {settingsLoading ? (
              // Skeleton loader for minutes packages
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={`skeleton-${index}`}>
                  <CardHeader className="text-center pb-4">
                    <div className="h-6 bg-muted rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-muted rounded animate-pulse mb-4"></div>
                    <div className="mt-4">
                      <div className="h-8 bg-muted rounded animate-pulse mb-2"></div>
                      <div className="h-5 bg-muted rounded animate-pulse"></div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-10 bg-muted rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              minutePackages.map((pkg) => (
                <Card key={pkg.id}>
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                    <div className="mt-4">
                      <div className="text-3xl font-bold">{pkg.minutes} {t('studentStore.minutes')}</div>
                      <div className="text-lg text-muted-foreground">
                      {pkg.price} {t('studentStore.egp')}
                      </div>

                      {pkg.savings && (
                        <div className="text-primary-600 text-sm">
                          {t('studentStore.savings')} {pkg.savings} {t('studentStore.egp')}!
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => handlePurchaseMinutes(pkg)}
                      disabled={loading === pkg.id}
                    >
                      {loading === pkg.id ? t('studentStore.processing') : t('studentStore.purchaseMinutes')}
                    </Button>
                    
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-semibold">{t('studentStore.proTip')}</span>
              </div>
              <p className="text-muted-foreground text-sm">
                {t('studentStore.useFreeMinutesDaily')}
              </p>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>

      {/* Credits Purchase Modal */}
      {selectedCreditsPackage && (
        <PurchaseChoicesModal
          isOpen={showCreditsModal}
          onClose={handleCreditsModalClose}
          item={{
            title: selectedCreditsPackage.name,
            price: selectedCreditsPackage.price,
            type: 'credits',
            credits_amount: selectedCreditsPackage.credits + (selectedCreditsPackage.bonus || 0)
          }}
          showWalletPayment={false} // Don't show wallet payment for credits purchases
        />
      )}

      {/* Minutes Purchase Modal */}
      {selectedMinutesPackage && (
        <PurchaseChoicesModal
          isOpen={showMinutesModal}
          onClose={handleMinutesModalClose}
          item={{
            title: selectedMinutesPackage.name,
            price: selectedMinutesPackage.price,
            type: 'ai_minutes',
            minutes_amount: selectedMinutesPackage.minutes
          }}
          showWalletPayment={false} // Don't show wallet payment for minutes purchases
        />
      )}
    </>
  );
};

export default Store;
