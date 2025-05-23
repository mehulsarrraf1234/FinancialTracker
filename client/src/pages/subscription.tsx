import { useState } from "react";
import { useLocation } from "wouter";
import { PlanCard } from "@/components/subscription-plan-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";
import Topbar from "@/components/layout/topbar";
import { 
  Crown, 
  Zap, 
  Shield, 
  TrendingUp, 
  Globe, 
  Download,
  Building,
  Calculator,
  Infinity,
  Star
} from "lucide-react";

export default function Subscription() {
  const { plan, trialDaysLeft, isTrialExpired } = useSubscription();
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [, setLocation] = useLocation();

  const freeFeatures = [
    { name: "Up to 50 transactions per month", included: true },
    { name: "5 basic expense categories", included: true },
    { name: "Current month reports only", included: true },
    { name: "Light & dark themes", included: true },
    { name: "Basic transaction management", included: true },
    { name: "Custom categories with AI suggestions", included: false },
    { name: "AI-powered spending insights", included: false },
    { name: "Receipt scanning & auto-categorization", included: false },
    { name: "Smart budget recommendations", included: false },
    { name: "Advanced reports & analytics", included: false },
    { name: "Loan management & tracking", included: false },
    { name: "Business expense tracking", included: false },
    { name: "Multi-currency support (70+ currencies)", included: false },
    { name: "Goal tracking & financial planning", included: false },
    { name: "Data export (CSV/JSON)", included: false },
    { name: "Priority support", included: false },
  ];

  const trialFeatures = [
    { name: "🎉 15-day FREE trial - no payment required!", included: true },
    { name: "Unlimited transactions & categories", included: true },
    { name: "AI-powered spending insights", included: true },
    { name: "Receipt scanning & auto-categorization", included: true },
    { name: "Smart budget recommendations", included: true },
    { name: "Advanced reports & goal tracking", included: true },
    { name: "Loan & business expense management", included: true },
    { name: "70+ global currencies support", included: true },
    { name: "Data export & team collaboration", included: true },
    { name: "Priority email support", included: true },
    { name: "All premium features unlocked", included: true },
    { name: "Cancel anytime during trial", included: true },
  ];

  const premiumFeatures = [
    { name: "Everything in Free Trial +", included: true },
    { name: "Unlimited transactions & categories", included: true },
    { name: "🤖 AI-powered spending insights", included: true },
    { name: "📱 Receipt scanning & auto-categorization", included: true },
    { name: "💡 Smart budget recommendations", included: true },
    { name: "📊 Advanced reports & analytics", included: true },
    { name: "🏦 Loan management & tracking", included: true },
    { name: "💼 Business expense tracking", included: true },
    { name: "🌍 70+ global currencies", included: true },
    { name: "🎯 Goal tracking & financial planning", included: true },
    { name: "📥 Data export (CSV/JSON)", included: true },
    { name: "👥 Team collaboration features", included: true },
    { name: "⭐ Priority email support", included: true },
    { name: "🚀 Early access to new features", included: true },
  ];

  const handleStartTrial = () => {
    setLocation("/checkout?plan=trial");
  };

  const handleUpgradeMonthly = () => {
    setLocation("/checkout?plan=monthly");
  };

  const handleUpgradeAnnual = () => {
    setLocation("/checkout?plan=annual");
  };

  const handleManageBilling = () => {
    // Will implement Stripe customer portal
    console.log("Opening billing portal...");
  };

  return (
    <>
      <Topbar 
        title="Subscription Plans"
        subtitle="Choose the plan that fits your financial tracking needs"
        onAddTransaction={() => setIsAddTransactionModalOpen(true)}
        onToggleMobileMenu={() => {}}
      />
      
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        {/* Current Plan Status */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  plan === "premium" ? "bg-yellow-100" : 
                  plan === "trial" ? "bg-green-100" : "bg-blue-100"
                }`}>
                  {plan === "premium" ? 
                    <Crown className="text-yellow-600 text-xl" /> :
                    plan === "trial" ?
                    <Star className="text-green-600 text-xl" /> :
                    <Zap className="text-blue-600 text-xl" />
                  }
                </div>
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>Current Plan: </span>
                    <Badge className={
                      plan === "premium" ? "bg-yellow-100 text-yellow-800" : 
                      plan === "trial" ? "bg-green-100 text-green-800" : 
                      "bg-blue-100 text-blue-800"
                    }>
                      {plan === "premium" ? "Premium" : 
                       plan === "trial" ? `Trial (${trialDaysLeft} days left)` : 
                       "Free"}
                    </Badge>
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {plan === "premium" 
                      ? "You have access to all premium features" 
                      : plan === "trial" && !isTrialExpired
                        ? `Enjoying your free trial! ${trialDaysLeft} days remaining`
                        : plan === "trial" && isTrialExpired
                          ? "Your trial has expired. Upgrade to continue using premium features"
                          : "Start your 15-day free trial or upgrade for just $2/month"
                    }
                  </p>
                </div>
              </div>
              
              {plan === "premium" && (
                <Button onClick={handleManageBilling} variant="outline">
                  Manage Billing
                </Button>
              )}
              
              {(plan === "trial" && trialDaysLeft <= 3) && (
                <Button onClick={handleUpgradeMonthly} className="bg-gradient-to-r from-primary to-purple-600">
                  Upgrade Now
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Feature Comparison */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-2">Choose Your Plan</h2>
          <p className="text-muted-foreground text-center mb-8">
            Start with a 15-day free trial - no payment required!
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <PlanCard
              title="Free Plan"
              price="$0"
              period="forever"
              description="Perfect for getting started with basic expense tracking"
              features={freeFeatures}
              current={plan === "free"}
              onSelect={() => {}}
              buttonText={plan === "free" ? "Current Plan" : "Downgrade"}
            />

            {plan !== "trial" && plan !== "premium" && (
              <PlanCard
                title="Free Trial"
                price="FREE"
                period="15 days"
                description="Try all premium features with no payment required!"
                features={trialFeatures}
                popular={true}
                current={false}
                onSelect={handleStartTrial}
                buttonText="Start Free Trial"
              />
            )}
            
            <PlanCard
              title="Monthly Plan"
              price="$2"
              period="month"
              description="Full access to all premium features"
              features={premiumFeatures}
              current={plan === "premium"}
              onSelect={handleUpgradeMonthly}
              buttonText={plan === "premium" ? "Current Plan" : "Upgrade Monthly"}
            />

            <PlanCard
              title="Annual Plan"
              price="$10"
              period="year"
              description="Save $14 with annual billing - best value!"
              features={[
                { name: "🎉 SAVE $14 per year!", included: true },
                ...premiumFeatures
              ]}
              popular={plan === "free"}
              current={false}
              onSelect={handleUpgradeAnnual}
              buttonText="Upgrade Annual"
            />
          </div>
        </div>

        {/* Premium Features Highlight - Unique AI-Powered Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="text-center border-2 border-purple-200 bg-gradient-to-b from-purple-50 to-white">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="font-semibold mb-2">AI Spending Insights</h3>
              <p className="text-sm text-muted-foreground">
                Get personalized AI recommendations to optimize your spending habits
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 border-blue-200 bg-gradient-to-b from-blue-50 to-white">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="font-semibold mb-2">Receipt Scanning</h3>
              <p className="text-sm text-muted-foreground">
                Snap photos of receipts for automatic expense categorization
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 border-green-200 bg-gradient-to-b from-green-50 to-white">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="font-semibold mb-2">Smart Budgets</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered budget suggestions based on your spending patterns
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 border-orange-200 bg-gradient-to-b from-orange-50 to-white">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold mb-2">Goal Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Set and track financial goals with progress visualization
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Can I cancel anytime?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Yes! Cancel your subscription anytime. You'll keep premium features until the end of your billing period.
                </p>
                
                <h4 className="font-semibold mb-2">What happens to my data if I downgrade?</h4>
                <p className="text-sm text-muted-foreground">
                  Your data is always safe. Free users are limited to 50 transactions per month, but all your historical data remains accessible.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Is there a free trial?</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  The free plan is permanent! Start with basic features and upgrade when you need more powerful tools.
                </p>
                
                <h4 className="font-semibold mb-2">How secure are my payments?</h4>
                <p className="text-sm text-muted-foreground">
                  We use Stripe for secure payment processing. Your card details are never stored on our servers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}