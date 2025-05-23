import { useState } from "react";
import Topbar from "@/components/layout/topbar";
import FinancialCards from "@/components/dashboard/financial-cards";
import ExpenseChart from "@/components/dashboard/expense-chart";
import CategoryBreakdown from "@/components/dashboard/category-breakdown";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import QuickActions from "@/components/dashboard/quick-actions";
import AddTransactionModal from "@/components/modals/add-transaction-modal";

export default function Dashboard() {
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <Topbar 
        title="Dashboard"
        subtitle="Welcome back, Alex Johnson"
        onAddTransaction={() => setIsAddTransactionModalOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
      />
      
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <FinancialCards />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <ExpenseChart />
          </div>
          <CategoryBreakdown />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentTransactions />
          </div>
          <QuickActions onAddTransaction={() => setIsAddTransactionModalOpen(true)} />
        </div>
      </div>

      <AddTransactionModal
        isOpen={isAddTransactionModalOpen}
        onClose={() => setIsAddTransactionModalOpen(false)}
      />
    </>
  );
}
