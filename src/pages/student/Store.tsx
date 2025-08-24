import React, { useState } from 'react';
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

const Store = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { toast } = useToast();
  const { t } = useTranslation('dashboard');
  const [loading, setLoading] = useState<string | null>(null);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showMinutesModal, setShowMinutesModal] = useState(false);
  const [selectedCreditsPackage, setSelectedCreditsPackage] = useState<typeof creditPackages[0] | null>(null);
  const [selectedMinutesPackage, setSelectedMinutesPackage] = useState<typeof minutePackages[0] | null>(null);
  const bgClass = useRandomBackground();
  const dispatch = useDispatch();

  const creditPackages = [
    {
      id: 'basic',
      name: t('studentStore.basicPackage'),
      credits: 50,
      price: 25, // EGP
      popular: false,
      description: t('studentStore.perfectForGettingStarted')
    },
    {
      id: 'popular',
      name: t('studentStore.popularPackage'),
      credits: 120,
      price: 50, // EGP
      popular: true,
      description: t('studentStore.mostChosenByStudents'),
      bonus: 20 // bonus credits
    },
    {
      id: 'premium',
      name: t('studentStore.premiumPackage'),
      credits: 300,
      price: 100, // EGP
      popular: false,
      description: t('studentStore.maximumValueForHeavyUsers'),
      bonus: 50 // bonus credits
    }
  ];

  const minutePackages = [
    {
      id: 'starter',
      name: t('studentStore.extraMinutes'),
      minutes: 30,
      cost: 30, // credits (for display purposes)
      price: 15, // EGP price for real money purchase
      description: t('studentStore.perfectForShortSessions')
    },
    {
      id: 'standard',
      name: t('studentStore.studySession'),
      minutes: 60,
      cost: 50, // credits (for display purposes)
      price: 25, // EGP price for real money purchase
      description: t('studentStore.greatForFocusedLearning'),
      savings: 10
    },
    {
      id: 'extended',
      name: t('studentStore.deepLearning'),
      minutes: 120,
      cost: 90, // credits (for display purposes)
      price: 45, // EGP price for real money purchase
      description: t('studentStore.forComprehensiveStudy'),
      savings: 30
    }
  ];

  const handlePurchaseCredits = (pkg: typeof creditPackages[0]) => {
    setSelectedCreditsPackage(pkg);
    setShowCreditsModal(true);
  };

  const handlePurchaseMinutes = (pkg: typeof minutePackages[0]) => {
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{t('studentStore.yourBalance')}</div>
                  <div className="text-2xl font-bold">{user?.wallet || 0} {t('studentStore.credits')}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary-600" />
                </div>
                <div>
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
            {minutePackages.map((pkg) => (
              <Card key={pkg.id}>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                  <div className="mt-4">
                    <div className="text-3xl font-bold">{pkg.price} {t('studentStore.egp')}</div>
                    <div className="text-lg text-muted-foreground">
                      {pkg.minutes} {t('studentStore.minutes')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t('studentStore.creditEquivalent')}: {pkg.cost} {t('studentStore.credits')}
                    </div>
                    {pkg.savings && (
                      <div className="text-primary-600 text-sm">
                        {t('studentStore.savings')} {pkg.savings} {t('studentStore.credits')}!
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
                  
                  <div className="text-center text-xs text-muted-foreground mt-2">
                    {t('studentStore.creditEquivalent')}: {pkg.cost} {t('studentStore.credits')}
                  </div>
                </CardContent>
              </Card>
            ))}
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
