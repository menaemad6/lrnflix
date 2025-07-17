import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Clock, CreditCard, Zap, AlertTriangle } from 'lucide-react';

interface MinutesPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredMinutes: number;
  currentCredits: number;
  onPurchaseSuccess?: () => void;
}

export const MinutesPurchaseModal: React.FC<MinutesPurchaseModalProps> = ({
  isOpen,
  onClose,
  requiredMinutes,
  currentCredits,
  onPurchaseSuccess
}) => {
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  const [minutesPrice, setMinutesPrice] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchUserData();
    }
  }, [isOpen]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in to purchase minutes.',
          variant: 'destructive',
        });
        return;
      }

      // Fetch user profile to get credits
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('wallet')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      const credits = profileData?.wallet || 0;
      setUserCredits(credits);

      // Fetch minutes price from settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('ai_assistant_settings')
        .select('setting_value')
        .eq('setting_key', 'minutes_price')
        .maybeSingle();

      if (settingsError) {
        console.error('Error fetching minutes price:', settingsError);
      }

      const price = settingsData ? parseFloat(settingsData.setting_value) : 1;
      setMinutesPrice(price);

      // Find the minimum package that covers required minutes
      const minRequiredPackage = packages.find(pkg => pkg.minutes >= requiredMinutes);
      const defaultSelection = minRequiredPackage ? packages.indexOf(minRequiredPackage) : 1;
      setSelectedPackage(defaultSelection);

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const packages = [
    { minutes: 10, popular: false },
    { minutes: 30, popular: true },
    { minutes: 60, popular: false },
    { minutes: 120, popular: false },
  ];

  const handlePurchase = async () => {
    const pkg = packages[selectedPackage];
    const cost = Math.ceil(pkg.minutes * minutesPrice);
    
    if (userCredits < cost) {
      toast({
        title: 'Insufficient Credits',
        description: `You need ${cost - userCredits} more credits to purchase this package.`,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('purchase_minutes', {
        p_minutes: pkg.minutes,
        p_cost_per_minute: minutesPrice
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string };
      
      if (result.success) {
        toast({
          title: 'Purchase Successful!',
          description: `You've purchased ${pkg.minutes} minutes for ${cost} credits.`,
        });
        onClose();
        if (onPurchaseSuccess) {
          onPurchaseSuccess();
        }
      } else {
        throw new Error(result.error || 'Purchase failed');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast({
        title: 'Purchase Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2 text-xl">
            <Clock className="h-6 w-6 text-primary" />
            Purchase Minutes
          </DialogTitle>
          <DialogDescription>
            {requiredMinutes > 0 
              ? `You need ${requiredMinutes} more minutes to start this session. Choose a package below:`
              : 'Choose a package to purchase additional minutes:'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Credits Display */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Available Credits</span>
                </div>
                <Badge variant="outline" className="font-bold">
                  {userCredits} credits
                </Badge>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Price: {minutesPrice} credit per minute
              </div>
            </CardContent>
          </Card>

          {/* Package Selection */}
          <div className="space-y-3">
            {packages.map((pkg, index) => {
              const cost = Math.ceil(pkg.minutes * minutesPrice);
              return (
                <Card 
                  key={index}
                  className={`cursor-pointer transition-all border-2 ${
                    selectedPackage === index 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedPackage(index)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedPackage === index 
                            ? 'border-primary bg-primary' 
                            : 'border-muted-foreground'
                        }`}>
                          {selectedPackage === index && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            {pkg.minutes} Minutes
                            {pkg.popular && (
                              <Badge className="bg-primary text-primary-foreground">
                                <Zap className="h-3 w-3 mr-1" />
                                Popular
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {minutesPrice} credit per minute
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{cost}</div>
                        <div className="text-sm text-muted-foreground">credits</div>
                      </div>
                    </div>
                    {pkg.minutes >= requiredMinutes && pkg.minutes < requiredMinutes + 10 && requiredMinutes > 0 && (
                      <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                        <span>✓ Covers your {requiredMinutes} minute requirement</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Purchase Button */}
          <div className="pt-4 space-y-3">
            {userCredits < Math.ceil(packages[selectedPackage]?.minutes * minutesPrice) && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-700 dark:text-amber-300">
                  You need {Math.ceil(packages[selectedPackage]?.minutes * minutesPrice) - userCredits} more credits to purchase this package.
                </span>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handlePurchase} 
                disabled={isLoading || userCredits < Math.ceil(packages[selectedPackage]?.minutes * minutesPrice)}
                className="flex-1"
              >
                {isLoading ? 'Processing...' : `Purchase ${packages[selectedPackage]?.minutes} Minutes`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
