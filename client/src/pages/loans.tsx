import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useSubscription } from "@/hooks/use-subscription";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import Topbar from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Edit, Calendar, DollarSign } from "lucide-react";
import { insertLoanSchema } from "@shared/schema";
import type { Loan, InsertLoan } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";

const loanFormSchema = insertLoanSchema.extend({
  name: z.string().min(1, "Loan name is required"),
  totalAmount: z.string().min(1, "Total amount is required"),
  remainingAmount: z.string().min(1, "Remaining amount is required"),
  interestRate: z.string().optional(),
  monthlyPayment: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(["active", "paid", "overdue"]).default("active"),
});

export default function Loans() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const { toast } = useToast();
  const { upgradeRequired } = useSubscription();

  // Show upgrade prompt for free users trying to access loan management
  if (upgradeRequired('loanManagement')) {
    return (
      <>
        <Topbar 
          title="Loans"
          subtitle="Track and manage your loans and debts"
          onAddTransaction={() => {}}
          onToggleMobileMenu={() => {}}
        />
        
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <UpgradePrompt
            title="Loan Management"
            description="Take control of your debt with comprehensive loan tracking, payment schedules, and interest calculations."
            features={[
              "Track multiple loans and debts",
              "Monitor payment schedules",
              "Calculate interest and payoff times",
              "Payment history tracking",
              "Loan progress visualization"
            ]}
            className="max-w-2xl mx-auto mt-8"
          />
        </div>
      </>
    );
  }

  const { data: loans = [], isLoading } = useQuery<Loan[]>({
    queryKey: ["/api/loans"],
  });

  const form = useForm<z.infer<typeof loanFormSchema>>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      name: "",
      totalAmount: "",
      remainingAmount: "",
      interestRate: "",
      monthlyPayment: "",
      dueDate: "",
      status: "active",
    },
  });

  const createLoanMutation = useMutation({
    mutationFn: async (data: InsertLoan) => {
      const response = await apiRequest("POST", "/api/loans", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      setIsAddModalOpen(false);
      form.reset();
      toast({ title: "Loan created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create loan", variant: "destructive" });
    },
  });

  const updateLoanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertLoan> }) => {
      const response = await apiRequest("PUT", `/api/loans/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      setEditingLoan(null);
      form.reset();
      toast({ title: "Loan updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update loan", variant: "destructive" });
    },
  });

  const deleteLoanMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/loans/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      toast({ title: "Loan deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete loan", variant: "destructive" });
    },
  });

  const onSubmit = (data: z.infer<typeof loanFormSchema>) => {
    const loanData: InsertLoan = {
      name: data.name,
      totalAmount: data.totalAmount,
      remainingAmount: data.remainingAmount,
      interestRate: data.interestRate || null,
      monthlyPayment: data.monthlyPayment || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status: data.status,
    };

    if (editingLoan) {
      updateLoanMutation.mutate({ id: editingLoan.id, data: loanData });
    } else {
      createLoanMutation.mutate(loanData);
    }
  };

  const handleEdit = (loan: Loan) => {
    setEditingLoan(loan);
    form.reset({
      name: loan.name,
      totalAmount: loan.totalAmount,
      remainingAmount: loan.remainingAmount,
      interestRate: loan.interestRate || "",
      monthlyPayment: loan.monthlyPayment || "",
      dueDate: loan.dueDate ? format(new Date(loan.dueDate), "yyyy-MM-dd") : "",
      status: loan.status as "active" | "paid" | "overdue",
    });
    setIsAddModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-100 text-blue-800";
      case "paid": return "bg-green-100 text-green-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const calculateProgress = (total: string, remaining: string) => {
    const totalAmount = parseFloat(total);
    const remainingAmount = parseFloat(remaining);
    if (totalAmount === 0) return 0;
    return ((totalAmount - remainingAmount) / totalAmount) * 100;
  };

  const totalLoanAmount = loans.reduce((sum, loan) => sum + parseFloat(loan.totalAmount), 0);
  const totalRemainingAmount = loans.reduce((sum, loan) => sum + parseFloat(loan.remainingAmount), 0);
  const totalPaidAmount = totalLoanAmount - totalRemainingAmount;

  return (
    <>
      <Topbar 
        title="Loans"
        subtitle="Manage your loans and payments"
        onAddTransaction={() => {}}
        onToggleMobileMenu={() => {}}
      />
      
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-blue-600 text-xl" />
                </div>
              </div>
              <h3 className="text-slate-600 text-sm font-medium mb-1">Total Loans</h3>
              <p className="text-2xl font-bold text-slate-800">${totalLoanAmount.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-red-600 text-xl" />
                </div>
              </div>
              <h3 className="text-slate-600 text-sm font-medium mb-1">Remaining</h3>
              <p className="text-2xl font-bold text-slate-800">${totalRemainingAmount.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-green-600 text-xl" />
                </div>
              </div>
              <h3 className="text-slate-600 text-sm font-medium mb-1">Paid</h3>
              <p className="text-2xl font-bold text-slate-800">${totalPaidAmount.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Your Loans</h2>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingLoan(null);
                form.reset();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Loan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingLoan ? "Edit Loan" : "Add New Loan"}
                </DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Home Mortgage" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="totalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Amount</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="remainingAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Remaining Amount</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="interestRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interest Rate (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="monthlyPayment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Payment</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createLoanMutation.isPending || updateLoanMutation.isPending}
                    >
                      {editingLoan ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : loans.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">No loans found</p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Loan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loans.map((loan) => (
              <Card key={loan.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{loan.name}</CardTitle>
                    <Badge className={getStatusColor(loan.status)}>
                      {loan.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Progress</span>
                    <span>{calculateProgress(loan.totalAmount, loan.remainingAmount).toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={calculateProgress(loan.totalAmount, loan.remainingAmount)} 
                    className="h-2"
                  />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Amount:</span>
                      <span className="font-medium">${parseFloat(loan.totalAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Remaining:</span>
                      <span className="font-medium text-red-600">${parseFloat(loan.remainingAmount).toFixed(2)}</span>
                    </div>
                    {loan.interestRate && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Interest Rate:</span>
                        <span className="font-medium">{parseFloat(loan.interestRate).toFixed(2)}%</span>
                      </div>
                    )}
                    {loan.monthlyPayment && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Monthly Payment:</span>
                        <span className="font-medium">${parseFloat(loan.monthlyPayment).toFixed(2)}</span>
                      </div>
                    )}
                    {loan.dueDate && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Due Date:</span>
                        <span className="font-medium">{format(new Date(loan.dueDate), "MMM dd, yyyy")}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(loan)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteLoanMutation.mutate(loan.id)}
                      disabled={deleteLoanMutation.isPending}
                      className="flex-1"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
