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
  const { plan, trialDaysLeft, isTrialExpired, trialType } = useSubscription();
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [, setLocation] = useLocation();

  const freeFeatures = [
    { name: "Up to 50 transactions per month", included: true },
    { name: "5 basic expense categories", included: true },
    { name: "Simple income/expense tracking", included: true },
    { name: "Basic monthly reports", included: true },
    { name: "Light & dark theme", included: true },
    { name: "Mobile responsive design", included: true },
    { name: "Custom categories", included: false },
    { name: "Multi-currency support", included: false },
    { name: "Advanced reports", included: false },
    { name: "Loan management", included: false },
    { name: "Business expense tracking", included: false },
    { name: "Data export (CSV/JSON)", included: false },
    { name: "Priority support", included: false },
  ];

  const monthlyTrialFeatures = [
    { name: "🎉 15-day FREE trial included!", included: true },
    { name: "Then $2/month after trial", included: true },
    { name: "Unlimited transactions & categories", included: true },
    { name: "AI-powered spending insights", included: true },
    { name: "Receipt scanning & auto-categorization", included: true },
    { name: "Smart budget recommendations", included: true },
    { name: "Advanced reports & goal tracking", included: true },
    { name: "Loan & business expense management", included: true },
    { name: "70+ global currencies support", included: true },
    { name: "Data export & team collaboration", included: true },
    { name: "Priority email support", included: true },
    { name: "Cancel anytime during trial", included: true },
  ];

  const annualTrialFeatures = [
    { name: "🎉 1 MONTH FREE trial included!", included: true },
    { name: "Then $14/year after trial", included: true },
    { name: "Save $10 compared to monthly!", included: true },
    { name: "Unlimited transactions & categories", included: true },
    { name: "AI-powered spending insights", included: true },
    { name: "Receipt scanning & auto-categorization", included: true },
    { name: "Smart budget recommendations", included: true },
    { name: "Advanced reports & goal tracking", included: true },
    { name: "Loan & business expense management", included: true },
    { name: "70+ global currencies support", included: true },
    { name: "Data export & team collaboration", included: true },
    { name: "Priority email support", included: true },
  ];

  const premiumFeatures = [
    { name: "Everything in Free Forever +", included: true },
    { name: "Unlimited transactions & categories", included: true },
    { name: "🤖 AI-powered spending insights", included: true },
    { name: "📱 Receipt scanning & auto-categorization", included: true },
    { name: "💡 Smart budget recommendations", included: true },
    { name: "🎯 Goal tracking & financial planning", included: true },
    { name: "🏦 Advanced loan management", included: true },
    { name: "💼 Business expense tracking", included: true },
    { name: "🌍 70+ global currencies", included: true },
    { name: "📊 Advanced reports & analytics", included: true },
    { name: "💾 Data export (CSV/JSON/PDF)", included: true },
    { name: "👥 Team collaboration features", included: true },
    { name: "⭐ Priority email support", included: true },
    { name: "🚀 Early access to new features", included: true },
  ];

  const handleStartMonthlyTrial = () => {
    setLocation("/checkout?plan=monthly_trial");
  };

  const handleStartAnnualTrial = () => {
    setLocation("/checkout?plan=annual_trial");
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
    <div className="flex h-screen bg-background">
      <Topbar
        title="Subscription & Billing"
        subtitle="Choose the perfect plan for your financial tracking needs"
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
                  plan === "monthly" || plan === "annual" ? "bg-yellow-100" : 
                  plan === "monthly_trial" || plan === "annual_trial" ? "bg-green-100" : "bg-blue-100"
                }`}>
                  {(plan === "monthly" || plan === "annual") ? 
                    <Crown className="text-yellow-600 text-xl" /> :
                    (plan === "monthly_trial" || plan === "annual_trial") ?
                    <Star className="text-green-600 text-xl" /> :
                    <Zap className="text-blue-600 text-xl" />
                  }
                </div>
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>Current Plan: </span>
                    <Badge className={
                      (plan === "monthly" || plan === "annual") ? "bg-yellow-100 text-yellow-800" : 
                      (plan === "monthly_trial" || plan === "annual_trial") ? "bg-green-100 text-green-800" : 
                      "bg-blue-100 text-blue-800"
                    }>
                      {(plan === "monthly" || plan === "annual") ? "Premium" : 
                       (plan === "monthly_trial" || plan === "annual_trial") ? `${trialType} Trial (${trialDaysLeft} days left)` : 
                       "Free Forever"}
                    </Badge>
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {(plan === "monthly" || plan === "annual")
                      ? "You have access to all premium features" 
                      : (plan === "monthly_trial" || plan === "annual_trial") && !isTrialExpired
                        ? `Enjoying your free ${trialType} trial! ${trialDaysLeft} days remaining`
                        : (plan === "monthly_trial" || plan === "annual_trial") && isTrialExpired
                          ? "Your trial has expired. Upgrade to continue using premium features"
                          : "Try premium with free trials: 15 days (monthly) or 1 month (annual)!"
                    }
                  </p>
                </div>
              </div>
              
              {(plan === "monthly" || plan === "annual") && (
                <Button onClick={handleManageBilling} variant="outline">
                  Manage Billing
                </Button>
              )}
              
              {((plan === "monthly_trial" || plan === "annual_trial") && trialDaysLeft <= 3) && (
                <Button onClick={trialType === "monthly" ? handleUpgradeMonthly : handleUpgradeAnnual} className="bg-gradient-to-r from-primary to-purple-600">
                  Upgrade Now
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Feature Comparison */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-2">Choose Your Plan</h2>
          <p className="text-center text-muted-foreground mb-8">
            Start free forever or unlock premium features with generous free trials
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <PlanCard
              title="Free Forever"
              price="$0"
              period="forever"
              description="Perfect for getting started with basic expense tracking"
              features={freeFeatures}
              current={plan === "free"}
              onSelect={() => {}}
              buttonText={plan === "free" ? "Current Plan" : "Downgrade"}
            />

            <PlanCard
              title="Monthly Premium"
              price="$2"
              period="month"
              description="🎉 15-day FREE trial included!"
              features={monthlyTrialFeatures}
              current={plan === "monthly" || plan === "monthly_trial"}
              onSelect={plan === "free" ? handleStartMonthlyTrial : handleUpgradeMonthly}
              buttonText={
                plan === "monthly" || plan === "monthly_trial" ? "Current Plan" : 
                plan === "free" ? "Start 15-Day Free Trial" : "Switch to Monthly"
              }
            />

            <PlanCard
              title="Annual Premium"
              price="$14"
              period="year"
              description="🎉 1 MONTH FREE trial + Save $10/year!"
              features={annualTrialFeatures}
              popular={true}
              current={plan === "annual" || plan === "annual_trial"}
              onSelect={plan === "free" ? handleStartAnnualTrial : handleUpgradeAnnual}
              buttonText={
                plan === "annual" || plan === "annual_trial" ? "Current Plan" :
                plan === "free" ? "Start 1-Month Free Trial" : "Switch to Annual"
              }
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
                Get intelligent analysis of your spending patterns and personalized recommendations
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 border-green-200 bg-gradient-to-b from-green-50 to-white">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="font-semibold mb-2">Receipt Scanning</h3>
              <p className="text-sm text-muted-foreground">
                Simply snap a photo of receipts and let AI automatically categorize expenses
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-2 border-blue-200 bg-gradient-to-b from-blue-50 to-white">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="font-semibold mb-2">Smart Budgets</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered budget recommendations based on your income and spending habits
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
                Set financial goals and track progress with intelligent milestone suggestions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">What happens during the free trial?</h3>
              <p className="text-muted-foreground">
                You get full access to all premium features with no payment required upfront. Monthly plans include a 15-day trial, 
                and annual plans include a 1-month trial. Cancel anytime during the trial with no charges.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Can I switch between plans?</h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade, downgrade, or switch between monthly and annual billing at any time. 
                Changes take effect at your next billing cycle.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Is my financial data secure?</h3>
              <p className="text-muted-foreground">
                Absolutely. We use bank-level encryption and never store sensitive banking credentials. 
                Your data is encrypted both in transit and at rest.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">What currencies are supported?</h3>
              <p className="text-muted-foreground">
                Premium plans support 70+ global currencies with real-time exchange rates. 
                Perfect for international business and travel expense tracking.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}