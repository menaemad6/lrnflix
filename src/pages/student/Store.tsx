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

const Store = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const bgClass = useRandomBackground();

  const creditPackages = [
    {
      id: 'basic',
      name: 'Basic Package',
      credits: 50,
      price: 25, // EGP
      popular: false,
      description: 'Perfect for getting started'
    },
    {
      id: 'popular',
      name: 'Popular Package',
      credits: 120,
      price: 50, // EGP
      popular: true,
      description: 'Most chosen by students',
      bonus: 20 // bonus credits
    },
    {
      id: 'premium',
      name: 'Premium Package',
      credits: 300,
      price: 100, // EGP
      popular: false,
      description: 'Maximum value for heavy users',
      bonus: 50 // bonus credits
    }
  ];

  const minutePackages = [
    {
      id: 'starter',
      name: 'Extra Minutes',
      minutes: 30,
      cost: 30, // credits
      description: 'Perfect for short sessions'
    },
    {
      id: 'standard',
      name: 'Study Session',
      minutes: 60,
      cost: 50, // credits (discounted)
      description: 'Great for focused learning',
      savings: 10
    },
    {
      id: 'extended',
      name: 'Deep Learning',
      minutes: 120,
      cost: 90, // credits (more discounted)
      description: 'For comprehensive study',
      savings: 30
    }
  ];

  const handlePurchaseCredits = async (packageId: string) => {
    setLoading(packageId);
    
    // Simulate credit purchase (you'll integrate real payment later)
    setTimeout(() => {
      toast({
        title: "Payment Integration Required",
        description: "This will be integrated with your EGP payment gateway",
        variant: "default"
      });
      setLoading(null);
    }, 2000);
  };

  const handlePurchaseMinutes = async (pkg: typeof minutePackages[0]) => {
    if (!user) return;
    
    setLoading(pkg.id);
    
    try {
      const { data, error } = await supabase.rpc('purchase_minutes', {
        p_minutes: pkg.minutes,
        p_cost_per_minute: Math.ceil(pkg.cost / pkg.minutes)
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string };

      if (result.success) {
        toast({
          title: "Minutes Purchased!",
          description: `Successfully purchased ${pkg.minutes} assistant minutes`,
        });
      } else {
        toast({
          title: "Purchase Failed",
          description: result.error || "Something went wrong",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error purchasing minutes:', error);
      toast({
        title: "Error",
        description: "Failed to purchase minutes",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={bgClass + " min-h-screen"}>
      <div className="container mx-auto px-4 py-8 max-w-6xl pt-[120px]">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold gradient-text">Student Store</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Purchase credits and assistant minutes to enhance your learning experience
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
                  <div className="text-sm text-muted-foreground">Your Balance</div>
                  <div className="text-2xl font-bold">{user?.wallet || 0} Credits</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Assistant Minutes</div>
                  <div className="text-2xl font-bold">{user?.minutes || 0} Minutes</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit Packages */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-bold">Credit Packages</h2>
            <Badge variant="secondary">Pay with EGP</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {creditPackages.map((pkg) => (
              <Card key={pkg.id} className={`relative ${pkg.popular ? 'border-primary ring-2 ring-primary/20' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                  <div className="mt-4">
                    <div className="text-3xl font-bold">{pkg.price} EGP</div>
                    <div className="text-lg text-muted-foreground">
                      {pkg.credits} Credits
                      {pkg.bonus && (
                        <span className="text-green-600 text-sm ml-2">
                          +{pkg.bonus} Bonus!
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <Button 
                    className="w-full" 
                    variant={pkg.popular ? "default" : "outline"}
                    onClick={() => handlePurchaseCredits(pkg.id)}
                    disabled={loading === pkg.id}
                  >
                    {loading === pkg.id ? "Processing..." : "Purchase Package"}
                  </Button>
                  
                  <div className="text-center text-xs text-muted-foreground mt-2">
                    ≈ {(pkg.price / (pkg.credits + (pkg.bonus || 0))).toFixed(2)} EGP per credit
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
            <h2 className="text-2xl font-bold">Assistant Minutes</h2>
            <Badge variant="secondary">Pay with Credits</Badge>
          </div>

          {/* Free Minutes Info */}
          <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Gift className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-400">Daily Free Minutes</h3>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    Every student gets 5 minutes of AI assistant conversation for free every day!
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
                    <div className="text-3xl font-bold">{pkg.cost} Credits</div>
                    <div className="text-lg text-muted-foreground">
                      {pkg.minutes} Minutes
                    </div>
                    {pkg.savings && (
                      <div className="text-green-600 text-sm">
                        Save {pkg.savings} credits!
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => handlePurchaseMinutes(pkg)}
                    disabled={loading === pkg.id || (user?.wallet || 0) < pkg.cost}
                  >
                    {loading === pkg.id ? "Processing..." : "Buy Minutes"}
                  </Button>
                  
                  {(user?.wallet || 0) < pkg.cost && (
                    <div className="text-center text-xs text-red-500 mt-2">
                      Need {pkg.cost - (user?.wallet || 0)} more credits
                    </div>
                  )}
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
                <span className="font-semibold">Pro Tip</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Use your free 5 minutes daily to get started, then purchase additional minutes 
                when you need extended AI tutoring sessions for deep learning!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Store;
