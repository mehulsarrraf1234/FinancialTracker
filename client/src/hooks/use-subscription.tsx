import { createContext, useContext, useState, useEffect } from "react";

interface SubscriptionFeatures {
  maxTransactions: number;
  customCategories: boolean;
  advancedReports: boolean;
  loanManagement: boolean;
  businessTracking: boolean;
  multiCurrency: boolean;
  dataExport: boolean;
  cloudSync: boolean;
  aiInsights: boolean;
  receiptScanning: boolean;
  smartBudgets: boolean;
  goalTracking: boolean;
  teamCollaboration: boolean;
  prioritySupport: boolean;
}

interface SubscriptionContextType {
  plan: "free" | "premium" | "trial";
  features: SubscriptionFeatures;
  upgradeRequired: (feature: keyof SubscriptionFeatures) => boolean;
  transactionCount: number;
  setTransactionCount: (count: number) => void;
  trialDaysLeft: number;
  isTrialExpired: boolean;
}

const freeFeatures: SubscriptionFeatures = {
  maxTransactions: 50,
  customCategories: false,
  advancedReports: false,
  loanManagement: false,
  businessTracking: false,
  multiCurrency: false,
  dataExport: false,
  cloudSync: false,
  aiInsights: false,
  receiptScanning: false,
  smartBudgets: false,
  goalTracking: false,
  teamCollaboration: false,
  prioritySupport: false,
};

const premiumFeatures: SubscriptionFeatures = {
  maxTransactions: Infinity,
  customCategories: true,
  advancedReports: true,
  loanManagement: true,
  businessTracking: true,
  multiCurrency: true,
  dataExport: true,
  cloudSync: true,
  aiInsights: true,
  receiptScanning: true,
  smartBudgets: true,
  goalTracking: true,
  teamCollaboration: true,
  prioritySupport: true,
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<"free" | "premium" | "trial">("free");
  const [transactionCount, setTransactionCount] = useState(0);
  const [trialStartDate, setTrialStartDate] = useState<Date | null>(null);
  
  // Calculate trial days left
  const trialDaysLeft = trialStartDate 
    ? Math.max(0, 15 - Math.floor((Date.now() - trialStartDate.getTime()) / (1000 * 60 * 60 * 24)))
    : 15;
  
  const isTrialExpired = plan === "trial" && trialDaysLeft <= 0;
  
  // In a real app, this would come from your backend/user data
  useEffect(() => {
    const savedPlan = localStorage.getItem("subscription-plan") as "free" | "premium" | "trial" | null;
    const savedTrialStart = localStorage.getItem("trial-start-date");
    
    if (savedPlan) {
      setPlan(savedPlan);
    }
    
    if (savedTrialStart) {
      setTrialStartDate(new Date(savedTrialStart));
    }
  }, []);

  const features = (plan === "premium" || (plan === "trial" && !isTrialExpired)) ? premiumFeatures : freeFeatures;

  const upgradeRequired = (feature: keyof SubscriptionFeatures) => {
    if (feature === "maxTransactions") {
      return transactionCount >= freeFeatures.maxTransactions && (plan === "free" || isTrialExpired);
    }
    return !features[feature] && (plan === "free" || isTrialExpired);
  };

  return (
    <SubscriptionContext.Provider value={{
      plan,
      features,
      upgradeRequired,
      transactionCount,
      setTransactionCount,
      trialDaysLeft,
      isTrialExpired,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}