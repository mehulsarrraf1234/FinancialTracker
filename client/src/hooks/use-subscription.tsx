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
}

interface SubscriptionContextType {
  plan: "free" | "premium";
  features: SubscriptionFeatures;
  upgradeRequired: (feature: keyof SubscriptionFeatures) => boolean;
  transactionCount: number;
  setTransactionCount: (count: number) => void;
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
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<"free" | "premium">("free");
  const [transactionCount, setTransactionCount] = useState(0);
  
  // In a real app, this would come from your backend/user data
  useEffect(() => {
    const savedPlan = localStorage.getItem("subscription-plan") as "free" | "premium" | null;
    if (savedPlan) {
      setPlan(savedPlan);
    }
  }, []);

  const features = plan === "premium" ? premiumFeatures : freeFeatures;

  const upgradeRequired = (feature: keyof SubscriptionFeatures) => {
    if (feature === "maxTransactions") {
      return transactionCount >= freeFeatures.maxTransactions && plan === "free";
    }
    return !features[feature] && plan === "free";
  };

  return (
    <SubscriptionContext.Provider value={{
      plan,
      features,
      upgradeRequired,
      transactionCount,
      setTransactionCount,
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