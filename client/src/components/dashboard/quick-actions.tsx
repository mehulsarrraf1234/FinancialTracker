import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Handshake, BarChart3, Download, ChevronRight } from "lucide-react";

interface QuickActionsProps {
  onAddTransaction: () => void;
}

export default function QuickActions({ onAddTransaction }: QuickActionsProps) {
  const actions = [
    {
      id: "addIncome",
      title: "Add Income",
      icon: Plus,
      color: "bg-green-100",
      iconColor: "text-green-600",
      action: () => onAddTransaction(),
    },
    {
      id: "addExpense", 
      title: "Add Expense",
      icon: Minus,
      color: "bg-red-100",
      iconColor: "text-red-600", 
      action: () => onAddTransaction(),
    },
    {
      id: "manageLoans",
      title: "Manage Loans",
      icon: Handshake,
      color: "bg-orange-100", 
      iconColor: "text-orange-600",
      action: () => window.location.href = "/loans",
    },
    {
      id: "generateReport",
      title: "Generate Report", 
      icon: BarChart3,
      color: "bg-blue-100",
      iconColor: "text-blue-600",
      action: () => window.location.href = "/reports",
    },
    {
      id: "exportData",
      title: "Export Data",
      icon: Download,
      color: "bg-slate-100",
      iconColor: "text-slate-600",
      action: () => {
        // Trigger CSV export
        const link = document.createElement('a');
        link.href = '/api/export/transactions';
        link.download = 'transactions.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="ghost"
                className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors h-auto"
                onClick={action.action}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center`}>
                    <Icon className={`${action.iconColor} text-sm h-4 w-4`} />
                  </div>
                  <span className="font-medium text-slate-700">{action.title}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
