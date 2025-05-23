import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Topbar from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Download, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from "date-fns";
import type { Transaction } from "@shared/schema";

type DateRange = "thisMonth" | "lastMonth" | "last3Months" | "last6Months" | "thisYear" | "custom";

export default function Reports() {
  const [dateRange, setDateRange] = useState<DateRange>("thisMonth");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics/overview"],
  });

  // Filter transactions based on date range
  const getFilteredTransactions = () => {
    const now = new Date();
    let start: Date, end: Date;

    switch (dateRange) {
      case "thisMonth":
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case "lastMonth":
        const lastMonth = subMonths(now, 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      case "last3Months":
        start = startOfMonth(subMonths(now, 2));
        end = endOfMonth(now);
        break;
      case "last6Months":
        start = startOfMonth(subMonths(now, 5));
        end = endOfMonth(now);
        break;
      case "thisYear":
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      case "custom":
        if (!startDate || !endDate) return transactions;
        start = new Date(startDate);
        end = new Date(endDate);
        break;
      default:
        return transactions;
    }

    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= start && transactionDate <= end;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate metrics
  const income = filteredTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const expenses = filteredTransactions
    .filter(t => t.type === "expense" || t.type === "business" || t.type === "loan")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const netIncome = income - expenses;

  // Monthly trend data
  const getMonthlyTrend = () => {
    const months: Record<string, { income: number; expenses: number; month: string }> = {};
    
    filteredTransactions.forEach(transaction => {
      const monthKey = format(new Date(transaction.date), "MMM yyyy");
      if (!months[monthKey]) {
        months[monthKey] = { income: 0, expenses: 0, month: monthKey };
      }
      
      if (transaction.type === "income") {
        months[monthKey].income += parseFloat(transaction.amount);
      } else {
        months[monthKey].expenses += parseFloat(transaction.amount);
      }
    });

    return Object.values(months).sort((a, b) => 
      new Date(`01 ${a.month}`).getTime() - new Date(`01 ${b.month}`).getTime()
    );
  };

  // Category breakdown
  const getCategoryBreakdown = () => {
    const categories: Record<string, number> = {};
    
    filteredTransactions
      .filter(t => t.type === "expense" || t.type === "business")
      .forEach(transaction => {
        const category = transaction.category;
        categories[category] = (categories[category] || 0) + parseFloat(transaction.amount);
      });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categories
  };

  // Income vs Expenses by type
  const getIncomeVsExpenses = () => {
    const data = [
      { type: "Income", amount: income, color: "#059669" },
      { type: "Expenses", amount: expenses, color: "#dc2626" },
      { type: "Net", amount: netIncome, color: netIncome >= 0 ? "#059669" : "#dc2626" },
    ];
    return data;
  };

  const monthlyTrend = getMonthlyTrend();
  const categoryBreakdown = getCategoryBreakdown();
  const incomeVsExpenses = getIncomeVsExpenses();

  const COLORS = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed', '#0891b2', '#be123c', '#9333ea'];

  const exportReport = () => {
    const reportData = {
      dateRange,
      startDate: dateRange === "custom" ? startDate : "",
      endDate: dateRange === "custom" ? endDate : "",
      summary: {
        totalIncome: income,
        totalExpenses: expenses,
        netIncome,
        transactionCount: filteredTransactions.length,
      },
      categoryBreakdown,
      monthlyTrend,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial-report-${format(new Date(), "yyyy-MM-dd")}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <>
      <Topbar 
        title="Reports"
        subtitle="Analyze your financial data and trends"
        onAddTransaction={() => {}}
        onToggleMobileMenu={() => {}}
      />
      
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        {/* Date Range Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Report Period</span>
              <Button onClick={exportReport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={dateRange} onValueChange={(value: DateRange) => setDateRange(value)}>
                <SelectTrigger className="w-[200px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="last3Months">Last 3 Months</SelectItem>
                  <SelectItem value="last6Months">Last 6 Months</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
              
              {dateRange === "custom" && (
                <>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-[150px]"
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-[150px]"
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-green-600 text-xl" />
                </div>
              </div>
              <h3 className="text-slate-600 text-sm font-medium mb-1">Total Income</h3>
              <p className="text-2xl font-bold text-slate-800">${income.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="text-red-600 text-xl" />
                </div>
              </div>
              <h3 className="text-slate-600 text-sm font-medium mb-1">Total Expenses</h3>
              <p className="text-2xl font-bold text-slate-800">${expenses.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  netIncome >= 0 ? "bg-green-100" : "bg-red-100"
                }`}>
                  <TrendingUp className={`text-xl ${
                    netIncome >= 0 ? "text-green-600" : "text-red-600"
                  }`} />
                </div>
              </div>
              <h3 className="text-slate-600 text-sm font-medium mb-1">Net Income</h3>
              <p className={`text-2xl font-bold ${
                netIncome >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                ${netIncome.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="text-blue-600 text-xl" />
                </div>
              </div>
              <h3 className="text-slate-600 text-sm font-medium mb-1">Transactions</h3>
              <p className="text-2xl font-bold text-slate-800">{filteredTransactions.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Income vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-full rounded"></div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`]} />
                      <Bar dataKey="income" fill="#059669" name="Income" />
                      <Bar dataKey="expenses" fill="#dc2626" name="Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {isLoading ? (
                  <div className="animate-pulse bg-gray-200 h-full rounded"></div>
                ) : categoryBreakdown.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No expense data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`]} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Income vs Expenses Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {isLoading ? (
                <div className="animate-pulse bg-gray-200 h-full rounded"></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeVsExpenses} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="type" type="category" />
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`]} />
                    <Bar dataKey="amount" fill={(entry) => entry?.color || "#2563eb"} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
