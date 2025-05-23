import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Handshake } from "lucide-react";
import { useCurrency } from "@/context/currency-context";

export default function FinancialCards() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics/overview"],
  });
  const { formatAmount } = useCurrency();

  const cards = [
    {
      title: "Total Income",
      value: analytics?.totalIncome || 0,
      icon: TrendingUp,
      color: "bg-green-100",
      iconColor: "text-green-600",
      change: "+12.5%",
      period: "This month"
    },
    {
      title: "Total Expenses", 
      value: analytics?.totalExpenses || 0,
      icon: TrendingDown,
      color: "bg-red-100",
      iconColor: "text-red-600", 
      change: "+8.2%",
      period: "This month"
    },
    {
      title: "Net Balance",
      value: analytics?.netBalance || 0,
      icon: Wallet,
      color: "bg-blue-100",
      iconColor: "text-blue-600",
      change: "+$1,200",
      period: "Available"
    },
    {
      title: "Loan Balance",
      value: analytics?.totalLoanBalance || 0,
      icon: Handshake,
      color: "bg-orange-100", 
      iconColor: "text-orange-600",
      change: "Due soon",
      period: "Remaining"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
              <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${card.iconColor} text-xl`} />
                </div>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                  {card.change}
                </span>
              </div>
              <h3 className="text-slate-600 text-sm font-medium mb-1">{card.title}</h3>
              <p className="text-2xl font-bold text-foreground">
                {formatAmount(Math.abs(card.value))}
              </p>
              <p className="text-xs text-slate-500 mt-2">{card.period}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
