import { useState } from "react";
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
  const { plan } = useSubscription();
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);

  const freeFeatures = [
    { name: "Up to 50 transactions per month", included: true },
    { name: "5 basic expense categories", included: true },
    { name: "Current month reports only", included: true },
    { name: "Light & dark themes", included: true },
    { name: "Basic transaction management", included: true },
    { name: "Custom categories", included: false },
    { name: "Advanced reports & analytics", included: false },
    { name: "Loan management", included: false },
    { name: "Business expense tracking", included: false },
    { name: "Multi-currency support", included: false },
    { name: "Data export (CSV)", included: false },
    { name: "Unlimited transactions", included: false },
  ];

  const premiumFeatures = [
    { name: "Unlimited transactions", included: true },
    { name: "Custom categories with icons", included: true },
    { name: "Advanced reports & analytics", included: true },
    { name: "Loan management & tracking", included: true },
    { name: "Business expense tracking", included: true },
    { name: "70+ global currencies", included: true },
    { name: "Data export (CSV/JSON)", included: true },
    { name: "All time period reports", included: true },
    { name: "Category breakdown charts", included: true },
    { name: "Monthly trend analysis", included: true },
    { name: "Priority email support", included: true },
    { name: "Early access to new features", included: true },
  ];

  const handleUpgrade = () => {
    // Will implement Stripe checkout when keys are provided
    console.log("Upgrading to premium...");
  };

  const handleManageBilling = () => {
    // Will implement Stripe customer portal when keys are provided
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
                  plan === "premium" ? "bg-yellow-100" : "bg-blue-100"
                }`}>
                  {plan === "premium" ? 
                    <Crown className="text-yellow-600 text-xl" /> : 
                    <Zap className="text-blue-600 text-xl" />
                  }
                </div>
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>Current Plan: </span>
                    <Badge className={plan === "premium" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}>
                      {plan === "premium" ? "Premium" : "Free"}
                    </Badge>
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {plan === "premium" 
                      ? "You have access to all premium features" 
                      : "Upgrade to unlock powerful features for just $2/month"
                    }
                  </p>
                </div>
              </div>
              
              {plan === "premium" && (
                <Button onClick={handleManageBilling} variant="outline">
                  Manage Billing
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Feature Comparison */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-2">Choose Your Plan</h2>
          <p className="text-muted-foreground text-center mb-8">
            Start free and upgrade when you need more powerful features
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
            
            <PlanCard
              title="Premium Plan"
              price="$2"
              period="month"
              description="Unlock all features for serious financial management"
              features={premiumFeatures}
              popular={true}
              current={plan === "premium"}
              onSelect={handleUpgrade}
              buttonText={plan === "premium" ? "Current Plan" : "Upgrade Now"}
            />
          </div>
        </div>

        {/* Premium Features Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Infinity className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Unlimited Transactions</h3>
              <p className="text-sm text-muted-foreground">
                Track as many transactions as you need without limits
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Building className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Business Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Separate business expenses for tax and accounting
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">70+ Currencies</h3>
              <p className="text-sm text-muted-foreground">
                Track expenses in any currency worldwide
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Advanced Reports</h3>
              <p className="text-sm text-muted-foreground">
                Detailed analytics and insights into your spending
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