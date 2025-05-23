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
  plan: "free" | "monthly_trial" | "annual_trial" | "monthly" | "annual";
  features: SubscriptionFeatures;
  upgradeRequired: (feature: keyof SubscriptionFeatures) => boolean;
  transactionCount: number;
  setTransactionCount: (count: number) => void;
  trialDaysLeft: number;
  isTrialExpired: boolean;
  trialType: "monthly" | "annual" | null;
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
  const [plan, setPlan] = useState<"free" | "monthly_trial" | "annual_trial" | "monthly" | "annual">("free");
  const [transactionCount, setTransactionCount] = useState(0);
  const [trialStartDate, setTrialStartDate] = useState<Date | null>(null);
  const [trialType, setTrialType] = useState<"monthly" | "annual" | null>(null);
  
  // Calculate trial days left based on trial type
  const getTrialDuration = () => {
    if (trialType === "monthly") return 15; // 15 days for monthly trial
    if (trialType === "annual") return 30; // 30 days (1 month) for annual trial
    return 0;
  };
  
  const trialDaysLeft = trialStartDate 
    ? Math.max(0, getTrialDuration() - Math.floor((Date.now() - trialStartDate.getTime()) / (1000 * 60 * 60 * 24)))
    : getTrialDuration();
  
  const isTrialExpired = (plan === "monthly_trial" || plan === "annual_trial") && trialDaysLeft <= 0;
  
  // In a real app, this would come from your backend/user data
  useEffect(() => {
    const savedPlan = localStorage.getItem("subscription-plan") as "free" | "monthly_trial" | "annual_trial" | "monthly" | "annual" | null;
    const savedTrialStart = localStorage.getItem("trial-start-date");
    const savedTrialType = localStorage.getItem("trial-type") as "monthly" | "annual" | null;
    
    if (savedPlan) {
      setPlan(savedPlan);
    }
    
    if (savedTrialStart) {
      setTrialStartDate(new Date(savedTrialStart));
    }
    
    if (savedTrialType) {
      setTrialType(savedTrialType);
    }
  }, []);

  const features = (plan === "monthly" || plan === "annual" || ((plan === "monthly_trial" || plan === "annual_trial") && !isTrialExpired)) 
    ? premiumFeatures 
    : freeFeatures;

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
      trialType,
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