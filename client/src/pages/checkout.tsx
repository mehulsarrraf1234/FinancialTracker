import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Calendar, DollarSign } from "lucide-react";
import { useLocation } from "wouter";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ planType }: { planType: 'monthly' | 'annual' | 'trial' }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!stripe || !elements) {
      setIsLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/subscription?success=true",
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Handle trial activation without payment
      if (planType === 'trial') {
        localStorage.setItem("subscription-plan", "trial");
        localStorage.setItem("trial-start-date", new Date().toISOString());
        toast({
          title: "Trial Activated!",
          description: "Your 15-day free trial has started. Enjoy all premium features!",
        });
        setLocation("/dashboard");
      } else {
        localStorage.setItem("subscription-plan", "premium");
        toast({
          title: "Payment Successful!",
          description: "Welcome to Premium! All features are now unlocked.",
        });
        setLocation("/dashboard");
      }
    }
    setIsLoading(false);
  };

  const planDetails = {
    monthly: { price: "$2", period: "month", savings: null },
    annual: { price: "$10", period: "year", savings: "Save $14!" },
    trial: { price: "Free", period: "15 days", savings: "No payment required" }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="mb-6">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            Premium Plan
            {planDetails[planType].savings && (
              <Badge className="bg-green-100 text-green-800">
                {planDetails[planType].savings}
              </Badge>
            )}
          </CardTitle>
          <div className="text-3xl font-bold">
            {planDetails[planType].price}
            <span className="text-sm text-muted-foreground ml-1">
              /{planDetails[planType].period}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-6">
            <div className="flex items-center text-sm">
              <Zap className="w-4 h-4 mr-2 text-green-500" />
              <span>Unlimited transactions & categories</span>
            </div>
            <div className="flex items-center text-sm">
              <Zap className="w-4 h-4 mr-2 text-green-500" />
              <span>AI-powered spending insights</span>
            </div>
            <div className="flex items-center text-sm">
              <Zap className="w-4 h-4 mr-2 text-green-500" />
              <span>Receipt scanning & auto-categorization</span>
            </div>
            <div className="flex items-center text-sm">
              <Zap className="w-4 h-4 mr-2 text-green-500" />
              <span>Smart budget recommendations</span>
            </div>
            <div className="flex items-center text-sm">
              <Zap className="w-4 h-4 mr-2 text-green-500" />
              <span>Advanced reports & goal tracking</span>
            </div>
            <div className="flex items-center text-sm">
              <Zap className="w-4 h-4 mr-2 text-green-500" />
              <span>Multi-currency support</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        {planType !== 'trial' && <PaymentElement />}
        <Button 
          type="submit" 
          className="w-full mt-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white"
          disabled={!stripe || isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Processing...
            </div>
          ) : planType === 'trial' ? (
            "Start Free Trial"
          ) : (
            `Subscribe ${planDetails[planType].price}/${planDetails[planType].period}`
          )}
        </Button>
        
        {planType === 'trial' && (
          <p className="text-xs text-center text-muted-foreground mt-3">
            No payment required • Cancel anytime during trial
          </p>
        )}
        
        {planType !== 'trial' && (
          <p className="text-xs text-center text-muted-foreground mt-3">
            Secure payment with Stripe • Cancel anytime
          </p>
        )}
      </form>
    </div>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [planType, setPlanType] = useState<'monthly' | 'annual' | 'trial'>('monthly');
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Get plan type from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan') as 'monthly' | 'annual' | 'trial';
    if (plan) {
      setPlanType(plan);
    }

    // For trial, we don't need to create a payment intent
    if (plan === 'trial') {
      return;
    }

    // Create PaymentIntent for subscription
    const amount = plan === 'annual' ? 1000 : 200; // $10 or $2 in cents
    
    apiRequest("POST", "/api/create-subscription-intent", { 
      planType: plan,
      amount 
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        console.error("Error creating payment intent:", error);
        setLocation("/subscription");
      });
  }, [setLocation]);

  if (planType === 'trial') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 flex items-center justify-center p-4">
        <CheckoutForm planType={planType} />
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          <span>Setting up secure checkout...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 flex items-center justify-center p-4">
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm planType={planType} />
      </Elements>
    </div>
  );
}