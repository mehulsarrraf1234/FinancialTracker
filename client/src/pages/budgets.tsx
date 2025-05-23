import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useCurrency } from "@/context/currency-context";
import Topbar from "@/components/layout/topbar";
import { 
  PiggyBank, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  TrendingUp,
  Target,
  DollarSign,
  Edit,
  Trash2,
  AlertCircle
} from "lucide-react";
import type { Budget, Category } from "@shared/schema";

export default function Budgets() {
  const [isAddBudgetModalOpen, setIsAddBudgetModalOpen] = useState(false);
  const { formatAmount } = useCurrency();
  const { toast } = useToast();

  // Fetch budgets and categories
  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ["/api/budgets"],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const getBudgetProgress = (budget: Budget) => {
    // This will be calculated on the backend based on actual spending
    const spent = parseFloat(budget.currentAmount || "0");
    const target = parseFloat(budget.targetAmount);
    return (spent / target) * 100;
  };

  const getBudgetStatus = (progress: number, alertThreshold: number = 80) => {
    if (progress >= 100) return { status: "exceeded", color: "destructive" };
    if (progress >= alertThreshold) return { status: "warning", color: "warning" };
    if (progress >= 50) return { status: "on-track", color: "default" };
    return { status: "good", color: "success" };
  };

  const getPeriodText = (period: string) => {
    switch (period) {
      case "weekly": return "This Week";
      case "monthly": return "This Month";
      case "quarterly": return "This Quarter";
      case "yearly": return "This Year";
      default: return period;
    }
  };

  const getRemainingDays = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="flex h-screen bg-background">
      <Topbar
        title="Budget Planning"
        subtitle="Track your spending and stay within your budget limits"
        onAddTransaction={() => setIsAddBudgetModalOpen(true)}
        onToggleMobileMenu={() => {}}
      />
      
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        {/* Budget Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <PiggyBank className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Budgets</p>
                  <p className="text-2xl font-bold">{budgets.filter((b: Budget) => b.isActive).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">On Track</p>
                  <p className="text-2xl font-bold">
                    {budgets.filter((b: Budget) => {
                      const progress = getBudgetProgress(b);
                      return progress < 80 && b.isActive;
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">At Risk</p>
                  <p className="text-2xl font-bold">
                    {budgets.filter((b: Budget) => {
                      const progress = getBudgetProgress(b);
                      return progress >= 80 && progress < 100 && b.isActive;
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Exceeded</p>
                  <p className="text-2xl font-bold">
                    {budgets.filter((b: Budget) => {
                      const progress = getBudgetProgress(b);
                      return progress >= 100 && b.isActive;
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Budget Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Budgets</h2>
          <Button 
            onClick={() => setIsAddBudgetModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Budget
          </Button>
        </div>

        {/* Budget Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-32 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : budgets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget: Budget) => {
              const progress = getBudgetProgress(budget);
              const status = getBudgetStatus(progress, parseFloat(budget.alertThreshold || "80"));
              const remainingDays = getRemainingDays(budget.endDate);
              const categoryName = categories.find((c: Category) => c.id === budget.categoryId)?.name || "General";

              return (
                <Card key={budget.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{budget.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{categoryName}</p>
                      </div>
                      <Badge variant={status.color === "destructive" ? "destructive" : 
                                     status.color === "warning" ? "secondary" : "default"}>
                        {getPeriodText(budget.period)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Spent: {formatAmount(parseFloat(budget.currentAmount || "0"))}</span>
                        <span>Budget: {formatAmount(parseFloat(budget.targetAmount))}</span>
                      </div>
                      <Progress 
                        value={Math.min(progress, 100)} 
                        className={`h-2 ${
                          progress >= 100 ? "bg-red-100" : 
                          progress >= 80 ? "bg-yellow-100" : "bg-green-100"
                        }`}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{progress.toFixed(1)}% used</span>
                        <span>
                          {remainingDays > 0 ? `${remainingDays} days left` : "Period ended"}
                        </span>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center space-x-1">
                        {progress >= 100 ? (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        ) : progress >= 80 ? (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                        <span className="text-xs font-medium">
                          {progress >= 100 ? "Budget Exceeded" : 
                           progress >= 80 ? "Approaching Limit" : "On Track"}
                        </span>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <PiggyBank className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Budgets Created Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start planning your finances by creating budgets for different categories. 
                Track your spending and stay within your limits!
              </p>
              <Button 
                onClick={() => setIsAddBudgetModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Budget
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Budget Tips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="text-center border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Smart Budgeting</h3>
              <p className="text-sm text-muted-foreground">
                Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings and debt repayment
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <Target className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Set Realistic Goals</h3>
              <p className="text-sm text-muted-foreground">
                Start with achievable budget amounts and adjust as you learn your spending patterns
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-purple-200 bg-purple-50">
            <CardContent className="pt-6">
              <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Regular Reviews</h3>
              <p className="text-sm text-muted-foreground">
                Review and adjust your budgets monthly to stay on track with your financial goals
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}