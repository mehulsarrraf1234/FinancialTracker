import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CategoryBreakdown() {
  const { data: breakdown = [], isLoading } = useQuery<Array<{category: string, amount: number}>>({
    queryKey: ["/api/analytics/category-breakdown", { type: "expense" }],
  });

  const colors = [
    "#2563eb", // blue
    "#059669", // green
    "#d97706", // orange
    "#dc2626", // red
    "#7c2d12", // brown
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
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
        <CardTitle>Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {breakdown.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No expense data available</p>
          ) : (
            breakdown.slice(0, 5).map((item, index) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: colors[index] }}
                  ></div>
                  <span className="text-slate-700">{item.category}</span>
                </div>
                <span className="font-semibold text-slate-800">${item.amount.toFixed(2)}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
