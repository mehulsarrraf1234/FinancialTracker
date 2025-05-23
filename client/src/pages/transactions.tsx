import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import Topbar from "@/components/layout/topbar";
import AddTransactionModal from "@/components/modals/add-transaction-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Search, Filter, Download, Trash2, Edit } from "lucide-react";
import type { Transaction } from "@shared/schema";

export default function Transactions() {
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({ title: "Transaction deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete transaction", variant: "destructive" });
    },
  });

  const exportTransactionsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/export/transactions");
      if (!response.ok) throw new Error("Export failed");
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transactions.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "Transactions exported successfully" });
    },
    onError: () => {
      toast({ title: "Failed to export transactions", variant: "destructive" });
    },
  });

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "income": return "bg-green-100 text-green-800";
      case "expense": return "bg-red-100 text-red-800";
      case "business": return "bg-blue-100 text-blue-800";
      case "loan": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getAmountColor = (type: string) => {
    return type === "income" ? "text-green-600 font-semibold" : "text-red-600 font-semibold";
  };

  return (
    <>
      <Topbar 
        title="Transactions"
        subtitle="Manage your financial transactions"
        onAddTransaction={() => setIsAddTransactionModalOpen(true)}
        onToggleMobileMenu={() => {}}
      />
      
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>All Transactions</CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={() => exportTransactionsMutation.mutate()}
                  variant="outline"
                  size="sm"
                  disabled={exportTransactionsMutation.isPending}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button onClick={() => setIsAddTransactionModalOpen(true)} size="sm">
                  Add Transaction
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="loan">Loan</SelectItem>
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
                <p className="text-gray-500">No transactions found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        transaction.type === "income" ? "bg-green-100" :
                        transaction.type === "expense" ? "bg-red-100" :
                        transaction.type === "business" ? "bg-blue-100" : "bg-orange-100"
                      }`}>
                        <span className="text-sm font-medium">
                          {transaction.type === "income" ? "💰" :
                           transaction.type === "expense" ? "💸" :
                           transaction.type === "business" ? "💼" : "🤝"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{transaction.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getTypeColor(transaction.type)}>
                            {transaction.type}
                          </Badge>
                          <span className="text-sm text-slate-500">{transaction.category}</span>
                          <span className="text-sm text-slate-500">•</span>
                          <span className="text-sm text-slate-500">
                            {format(new Date(transaction.date), "MMM dd, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={getAmountColor(transaction.type)}>
                        {transaction.type === "income" ? "+" : "-"}${parseFloat(transaction.amount).toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTransactionMutation.mutate(transaction.id)}
                        disabled={deleteTransactionMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
      />
    </>
  );
}
