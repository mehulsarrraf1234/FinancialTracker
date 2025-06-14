import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { CurrencyProvider } from "@/context/currency-context";
import { SubscriptionProvider } from "@/hooks/use-subscription";
import { useState } from "react";
import Dashboard from "@/pages/dashboard";
import Transactions from "@/pages/transactions";
import Categories from "@/pages/categories";
import Loans from "@/pages/loans";
import Business from "@/pages/business";
import Reports from "@/pages/reports";
import Subscription from "@/pages/subscription";
import Checkout from "@/pages/checkout";
import BankAccounts from "@/pages/bank-accounts";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/sidebar";
import MobileMenu from "@/components/modals/mobile-menu";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/categories" component={Categories} />
      <Route path="/loans" component={Loans} />
      <Route path="/business" component={Business} />
      <Route path="/reports" component={Reports} />
      <Route path="/bank-accounts" component={BankAccounts} />
      <Route path="/subscription" component={Subscription} />
      <Route path="/checkout" component={Checkout} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <ThemeProvider defaultTheme="light" storageKey="finance-tracker-theme">
      <CurrencyProvider>
        <SubscriptionProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <div className="min-h-screen flex bg-background dark:bg-background">
                <Sidebar />
                <MobileMenu 
                  isOpen={isMobileMenuOpen} 
                  onClose={() => setIsMobileMenuOpen(false)} 
                />
                <main className="flex-1 flex flex-col">
                  <Router />
                </main>
              </div>
              <Toaster />
            </TooltipProvider>
          </QueryClientProvider>
        </SubscriptionProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}

export default App;
