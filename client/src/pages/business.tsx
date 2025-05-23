import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSubscription } from "@/hooks/use-subscription";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import Topbar from "@/components/layout/topbar";
import AddTransactionModal from "@/components/modals/add-transaction-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, TrendingUp, DollarSign, Search, Filter, Calendar } from "lucide-react";
import { format } from "date-fns";
import type { Transaction } from "@shared/schema";

export default function Business() {
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { upgradeRequired } = useSubscription();

  const { data: allTransactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Show upgrade prompt for free users trying to access business tracking
  if (upgradeRequired('businessTracking')) {
    return (
      <>
        <Topbar 
          title="Business"
          subtitle="Track your business expenses and analyze spending"
          onAddTransaction={() => setIsAddTransactionModalOpen(true)}
          onToggleMobileMenu={() => {}}
        />
        
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <UpgradePrompt
            title="Business Expense Tracking"
            description="Track and categorize your business expenses separately from personal spending for better financial management and tax preparation."
            features={[
              "Unlimited business transactions",
              "Custom business categories",
              "Separate business reports",
              "Tax-ready expense summaries",
              "Business vs personal insights"
            ]}
            className="max-w-2xl mx-auto mt-8"
          />
        </div>
      </>
    );
  }

  const businessTransactions = allTransactions.filter(t => t.type === "business");

  const filteredTransactions = businessTransactions.filter((transaction) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || transaction.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate business metrics
  const totalBusinessExpenses = businessTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  // Get current month transactions
  const currentDate = new Date();
  const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const currentMonthTransactions = businessTransactions.filter(t => 
    new Date(t.date) >= currentMonthStart
  );
  const currentMonthExpenses = currentMonthTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Get unique categories for filter
  const businessCategories = [...new Set(businessTransactions.map(t => t.category))];

  // Category breakdown
  const categoryBreakdown = businessTransactions.reduce((acc, transaction) => {
    const category = transaction.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += parseFloat(transaction.amount);
    return acc;
  }, {} as Record<string, number>);

  const categoryBreakdownArray = Object.entries(categoryBreakdown)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <>
      <Topbar 
        title="Business"
        subtitle="Track your business expenses and analyze spending"
        onAddTransaction={() => setIsAddTransactionModalOpen(true)}
        onToggleMobileMenu={() => {}}
      />
      
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        {/* Business Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="text-blue-600 text-xl" />
                </div>
              </div>
              <h3 className="text-slate-600 text-sm font-medium mb-1">Total Business Expenses</h3>
              <p className="text-2xl font-bold text-slate-800">${totalBusinessExpenses.toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-2">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="text-orange-600 text-xl" />
                </div>
              </div>
              <h3 className="text-slate-600 text-sm font-medium mb-1">This Month</h3>
              <p className="text-2xl font-bold text-slate-800">${currentMonthExpenses.toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-2">{currentMonthTransactions.length} transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-green-600 text-xl" />
                </div>
              </div>
              <h3 className="text-slate-600 text-sm font-medium mb-1">Categories</h3>
              <p className="text-2xl font-bold text-slate-800">{businessCategories.length}</p>
              <p className="text-xs text-slate-500 mt-2">Expense categories</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : categoryBreakdownArray.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No business expenses yet</p>
              ) : (
                <div className="space-y-4">
                  {categoryBreakdownArray.map(({ category, amount }) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <span className="text-slate-700">{category}</span>
                      </div>
                      <span className="font-semibold text-slate-800">${amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Add Business Expense */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  onClick={() => setIsAddTransactionModalOpen(true)}
                  className="flex items-center justify-center space-x-2 h-16"
                >
                  <DollarSign className="h-5 w-5" />
                  <span>Add Business Expense</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex items-center justify-center space-x-2 h-16"
                  onClick={() => {
                    // This could open a specific business report modal
                    window.location.href = "/reports";
                  }}
                >
                  <TrendingUp className="h-5 w-5" />
                  <span>View Business Reports</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Transactions */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Business Transactions</CardTitle>
              <Button onClick={() => setIsAddTransactionModalOpen(true)} size="sm">
                Add Business Expense
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search business transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {businessCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  {businessTransactions.length === 0 
                    ? "No business transactions yet" 
                    : "No transactions match your filters"
                  }
                </p>
                <Button onClick={() => setIsAddTransactionModalOpen(true)}>
                  Add Business Expense
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{transaction.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className="bg-blue-100 text-blue-800">
                            {transaction.category}
                          </Badge>
                          <span className="text-sm text-slate-500">•</span>
                          <span className="text-sm text-slate-500">
                            {format(new Date(transaction.date), "MMM dd, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="font-semibold text-red-600">
                      -${parseFloat(transaction.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddTransactionModal
        isOpen={isAddTransactionModalOpen}
        onClose={() => setIsAddTransactionModalOpen(false)}
        defaultType="business"
      />
    </>
  );
}
