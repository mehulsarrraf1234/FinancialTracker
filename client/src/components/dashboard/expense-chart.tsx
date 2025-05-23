import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import type { Transaction } from "@shared/schema";

export default function ExpenseChart() {
  const [period, setPeriod] = useState<"7D" | "30D" | "90D">("7D");
  
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const getChartData = () => {
    const days = period === "7D" ? 7 : period === "30D" ? 30 : 90;
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);

    // Create array of dates
    const dateArray = [];
    for (let i = 0; i < days; i++) {
      const date = subDays(endDate, days - 1 - i);
      dateArray.push({
        date: startOfDay(date),
        day: format(date, period === "7D" ? "EEE" : "MMM dd"),
        expenses: 0
      });
    }

    // Aggregate transactions by date
    transactions
      .filter(t => t.type === "expense" || t.type === "business" || t.type === "loan")
      .forEach(transaction => {
        const transactionDate = startOfDay(new Date(transaction.date));
        const dayData = dateArray.find(d => d.date.getTime() === transactionDate.getTime());
        if (dayData) {
          dayData.expenses += parseFloat(transaction.amount);
        }
      });

    return dateArray.map(({ day, expenses }) => ({ day, expenses }));
  };

  const chartData = getChartData();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-6">
          <CardTitle>Expense Trends</CardTitle>
          <div className="flex space-x-2">
            {(["7D", "30D", "90D"] as const).map((p) => (
              <Button
                key={p}
                variant={period === p ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(p)}
                className="px-3 py-1 text-xs"
              >
                {p}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-64">
          {isLoading ? (
            <div className="animate-pulse bg-gray-200 h-full rounded"></div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, "Expenses"]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar dataKey="expenses" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
