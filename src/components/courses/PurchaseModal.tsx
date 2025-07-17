
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Wallet, CreditCard, Percent, AlertCircle } from 'lucide-react';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: any;
  userWallet: number;
  onPurchaseSuccess: () => void;
}

export const PurchaseModal = ({ isOpen, onClose, course, userWallet, onPurchaseSuccess }: PurchaseModalProps) => {
  const { toast } = useToast();
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState<any>(null);
  const [finalPrice, setFinalPrice] = useState(course?.price || 0);
  const [loading, setLoading] = useState(false);

  const applyDiscount = async () => {
    if (!discountCode.trim()) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('course_codes')
        .select('*')
        .eq('code', discountCode.toUpperCase())
        .eq('course_id', course.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: 'Invalid Code',
          description: 'The discount code is not valid for this course.',
          variant: 'destructive',
        });
        return;
      }

      // Check if code is expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast({
          title: 'Expired Code',
          description: 'This discount code has expired.',
          variant: 'destructive',
        });
        return;
      }

      // Check if max uses reached
      if (data.max_uses && data.current_uses >= data.max_uses) {
        toast({
          title: 'Code Limit Reached',
          description: 'This discount code has reached its usage limit.',
          variant: 'destructive',
        });
        return;
      }

      let discount = 0;
      if (data.discount_percentage) {
        discount = Math.round((course.price * data.discount_percentage) / 100);
      } else if (data.discount_amount) {
        discount = data.discount_amount;
      }

      const newPrice = Math.max(0, course.price - discount);
      setFinalPrice(newPrice);
      setDiscountApplied({ ...data, discount });

      toast({
        title: 'Discount Applied!',
        description: `You saved ${discount} credits!`,
      });
    } catch (error: any) {
      console.error('Error applying discount:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply discount code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('enroll_with_payment', {
        p_course_id: course.id,
        p_discount_code: discountCode.trim() || null
      });

      if (error) throw error;

      const result = data as any;

      if (!result.success) {
        toast({
          title: 'Purchase Failed',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }

      // Create notification for the instructor
      await createNotification(
        course.instructor_id,
        'New Course Purchase!',
        `A student has purchased your course "${course.title}" for ${result.amount_paid} credits.`,
        'course_purchase'
      );

      toast({
        title: 'Purchase Successful!',
        description: result.message,
      });

      onPurchaseSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error purchasing course:', error);
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
    setFinalPrice(course?.price || 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Purchase Course
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="font-semibold text-lg">{course?.title}</h3>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="outline">
                Original Price: {course?.price} Credits
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Wallet className="h-5 w-5" />
              <span>Your Wallet: {userWallet} Credits</span>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Discount Code (Optional)</label>
              <div className="flex gap-2">
                <Input
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="Enter discount code"
                  disabled={loading || !!discountApplied}
                />
                {!discountApplied ? (
                  <Button
                    variant="outline"
                    onClick={applyDiscount}
                    disabled={!discountCode.trim() || loading}
                  >
                    <Percent className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="outline" onClick={removeDiscount}>
                    Remove
                  </Button>
                )}
              </div>
            </div>

            {discountApplied && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <Percent className="h-4 w-4" />
                  <span className="font-medium">Discount Applied!</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  You saved {discountApplied.discount} credits
                  {discountApplied.discount_percentage && ` (${discountApplied.discount_percentage}% off)`}
                </p>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Final Price:</span>
                <span>{finalPrice} Credits</span>
              </div>
            </div>

            {userWallet < finalPrice && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Insufficient Funds</span>
                </div>
                <p className="text-sm text-red-600 mt-1">
                  You need {finalPrice - userWallet} more credits to purchase this course.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={userWallet < finalPrice || loading}
              className="flex-1"
            >
              {loading ? 'Processing...' : `Purchase for ${finalPrice} Credits`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
