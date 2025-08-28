
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Wallet, CreditCard, Percent, AlertCircle, Gift, CheckCircle } from 'lucide-react';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    title: string;
    price: number;
    instructor_id: string;
    type?: 'course' | 'chapter' | 'lesson' | 'quiz';
  };
  userWallet: number;
  onPurchaseSuccess: () => void;
}

export const PurchaseModal = ({ isOpen, onClose, item, userWallet, onPurchaseSuccess }: PurchaseModalProps) => {
  const { toast } = useToast();
  const { t } = useTranslation('dashboard');
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState<any>(null);
  const [finalPrice, setFinalPrice] = useState(item?.price || 0);
  const [loading, setLoading] = useState(false);

  const applyDiscount = async () => {
    if (!discountCode.trim()) return;

    // Disable discount codes for non-course items
    if (item.type !== 'course') {
      toast({
        title: t('purchaseModal.discountNotAvailable'),
        description: t('purchaseModal.discountNotAvailableDesc'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('course_codes')
        .select('*')
        .eq('code', discountCode.toUpperCase())
        .eq('course_id', item.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: t('purchaseModal.invalidCode'),
          description: t('purchaseModal.invalidCodeDesc'),
          variant: 'destructive',
        });
        return;
      }

      // Check if code is active (treat null as active for backward compatibility)
      if (data.is_active === false) {
        toast({
          title: t('purchaseModal.inactiveCode'),
          description: t('purchaseModal.inactiveCodeDesc'),
          variant: 'destructive',
        });
        return;
      }

      // Check if code is expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast({
          title: t('purchaseModal.expiredCode'),
          description: t('purchaseModal.expiredCodeDesc'),
          variant: 'destructive',
        });
        return;
      }

      // Check if max uses reached
      if (data.max_uses && (data.current_uses || 0) >= data.max_uses) {
        toast({
          title: t('purchaseModal.codeLimitReached'),
          description: t('purchaseModal.codeLimitReachedDesc'),
          variant: 'destructive',
        });
        return;
      }

      let discount = 0;
      if (data.discount_percentage) {
        discount = Math.round((item.price * data.discount_percentage) / 100);
      } else if (data.discount_amount) {
        discount = data.discount_amount;
      }

      const newPrice = Math.max(0, item.price - discount);
      setFinalPrice(newPrice);
      setDiscountApplied({ ...data, discount });

      toast({
        title: t('purchaseModal.discountAppliedSuccess'),
        description: t('purchaseModal.discountAppliedDesc', { amount: discount }),
      });
    } catch (error: any) {
      console.error('Error applying discount:', error);
      toast({
        title: t('purchaseModal.error'),
        description: t('purchaseModal.failedToApply'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    try {
      setLoading(true);

      let result;
      
      if (item.type === 'chapter') {
        // Use chapter enrollment function
        const { data, error } = await supabase.rpc('enroll_chapter_with_payment', {
          p_chapter_id: item.id
        });
        
        if (error) throw error;
        result = data;
      } else {
        // Use course enrollment function
        const { data, error } = await supabase.rpc('enroll_with_payment', {
          p_course_id: item.id,
          p_discount_code: discountCode.trim() || null
        });
        
        if (error) throw error;
        result = data;
      }

      if (!result.success) {
        toast({
          title: t('purchaseModal.purchaseFailed'),
          description: result.error,
          variant: 'destructive',
        });
        return;
      }

      // Create notification for the instructor
      const itemType = item.type === 'chapter' ? 'chapter' : 'course';
      const notificationMessage = item.price === 0 
        ? `A student has enrolled in your free ${itemType} "${item.title}".`
        : `A student has purchased your ${itemType} "${item.title}" for ${result.amount_paid || item.price} credits.`;
      
      await createNotification(
        item.instructor_id,
        item.price === 0 
          ? `New Free ${itemType.charAt(0).toUpperCase() + itemType.slice(1)} Enrollment!`
          : `New ${itemType.charAt(0).toUpperCase() + itemType.slice(1)} Purchase!`,
        notificationMessage,
        `${itemType}_${item.price === 0 ? 'enrollment' : 'purchase'}`
      );

      toast({
        title: t('purchaseModal.purchaseSuccessful'),
        description: result.message,
      });

      onPurchaseSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error purchasing item:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async (userId: string, title: string, message: string, type: string) => {
    try {
      await supabase.functions.invoke('create-notification', {
        body: { userId, title, message, type }
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const removeDiscount = () => {
    setDiscountCode('');
    setDiscountApplied(null);
    setFinalPrice(item?.price || 0);
  };

  // If the item is free (price === 0), show the free enrollment screen
  if (item?.price === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-green-600" />
              {item.type === 'chapter' ? t('purchaseModal.freeChapterTitle', 'Free Chapter Enrollment') : t('purchaseModal.freeCourseTitle', 'Free Course Enrollment')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Gift className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{item?.title}</h3>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {t('studentCourseView.free')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {t('purchaseModal.freeCourseDescription', 'This course is completely free! Enroll now and start learning.')}
              </p>
            </div>



            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1 hover:bg-destructive">
                {t('purchaseModal.cancel')}
              </Button>
              <Button
                onClick={handlePurchase}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? t('purchaseModal.processing') : t('purchaseModal.enrollForFree', 'Enroll for Free')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {t('purchaseModal.title')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="font-semibold text-lg">{item?.title}</h3>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="outline">
                {t('purchaseModal.originalPrice', { price: item?.price })}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Wallet className="h-5 w-5" />
              <span>{t('purchaseModal.yourWallet', { amount: userWallet })}</span>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('purchaseModal.discountCode')}</label>
              <div className="flex gap-2">
                <Input
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder={t('purchaseModal.enterDiscountCode')}
                  disabled={loading || !!discountApplied || item.type !== 'course'}
                />
                {!discountApplied ? (
                  <Button
                    variant="outline"
                    onClick={applyDiscount}
                    disabled={!discountCode.trim() || loading || item.type !== 'course'}
                  >
                    <Percent className="h-4 w-4" />
                    {t('purchaseModal.apply')}
                  </Button>
                ) : (
                  <Button variant="outline" onClick={removeDiscount}>
                    {t('purchaseModal.remove')}
                  </Button>
                )}
              </div>
              {item.type !== 'course' && (
                <p className="text-xs text-muted-foreground">
                  {t('purchaseModal.discountNotAvailableForChapters')}
                </p>
              )}
            </div>

            {discountApplied && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <Percent className="h-4 w-4" />
                  <span className="font-medium">{t('purchaseModal.discountApplied')}</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  {t('purchaseModal.youSaved', { amount: discountApplied.discount })}
                  {discountApplied.discount_percentage && ` (${discountApplied.discount_percentage}% off)`}
                </p>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>{t('purchaseModal.finalPrice')}</span>
                <span>{finalPrice} {t("studentCourseView.egp")}</span>
              </div>
            </div>

            {userWallet < finalPrice && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">{t('purchaseModal.insufficientFunds')}</span>
                </div>
                <p className="text-sm text-red-600 mt-1">
                  {t('purchaseModal.needMoreCredits', { amount: finalPrice - userWallet })}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              {t('purchaseModal.cancel')}
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={userWallet < finalPrice || loading}
              className="flex-1"
            >
              {loading ? t('purchaseModal.processing') : t('purchaseModal.purchaseForCredits', { amount: finalPrice })}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
