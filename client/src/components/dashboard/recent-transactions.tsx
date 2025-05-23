import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ShoppingCart, DollarSign, Car, Coffee } from "lucide-react";
import type { Transaction } from "@shared/schema";

export default function RecentTransactions() {
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const recentTransactions = transactions.slice(0, 4);

  const getTransactionIcon = (category: string, type: string) => {
    if (type === "income") return DollarSign;
    
    switch (category.toLowerCase()) {
      case "food & dining":
        return ShoppingCart;
      case "transportation":
        return Car;
      case "shopping":
        return ShoppingCart;
      default:
        return Coffee;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "income": return "text-green-600 bg-green-100";
      case "expense": return "text-red-600 bg-red-100";
      case "business": return "text-blue-600 bg-blue-100";
      case "loan": return "text-orange-600 bg-orange-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getAmountColor = (type: string) => {
    return type === "income" ? "text-green-600 font-semibold" : "text-red-600 font-semibold";
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "income": return "bg-green-100 text-green-800";
      case "expense": return "bg-red-100 text-red-800";
      case "business": return "bg-blue-100 text-blue-800";
      case "loan": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-6">
            <CardTitle>Recent Transactions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg animate-pulse">
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-6">
          <CardTitle>Recent Transactions</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <a href="/transactions" className="text-primary text-sm font-medium hover:text-blue-700">
              View All
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400 mt-2">Add your first transaction to get started</p>
            </div>
          ) : (
            recentTransactions.map((transaction) => {
              const Icon = getTransactionIcon(transaction.category, transaction.type);
              return (
                <div key={transaction.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconColor(transaction.type)}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{transaction.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getTypeColor(transaction.type)}>
                          {transaction.type}
                        </Badge>
                        <span className="text-sm text-slate-500">•</span>
                        <span className="text-sm text-slate-500">{transaction.category}</span>
                        <span className="text-sm text-slate-500">•</span>
                        <span className="text-sm text-slate-500">
                          {format(new Date(transaction.date), "MMM dd, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={getAmountColor(transaction.type)}>
                    {transaction.type === "income" ? "+" : "-"}${parseFloat(transaction.amount).toFixed(2)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
