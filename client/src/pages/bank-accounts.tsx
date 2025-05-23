import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { usePlaidLink } from "react-plaid-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Topbar from "@/components/layout/topbar";
import { 
  Building2, 
  CreditCard, 
  Wallet, 
  RefreshCw, 
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Banknote
} from "lucide-react";
import type { BankAccount } from "@shared/schema";

export default function BankAccounts() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  // Fetch user's connected bank accounts
  const { data: bankAccounts = [], isLoading } = useQuery({
    queryKey: ["/api/bank-accounts"],
  });

  // Fetch link token for Plaid
  const { data: linkTokenData } = useQuery({
    queryKey: ["/api/plaid/create-link-token"],
  });

  // Connect bank account mutation
  const connectBankMutation = useMutation({
    mutationFn: async ({ public_token, metadata }: { public_token: string; metadata: any }) => {
      const response = await apiRequest("POST", "/api/plaid/exchange-public-token", {
        public_token,
        metadata,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bank Account Connected!",
        description: "Your bank account has been successfully linked. Transactions will sync automatically.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bank-accounts"] });
      setIsConnecting(false);
    },
    onError: () => {
      toast({
        title: "Connection Failed",
        description: "Unable to connect your bank account. Please try again.",
        variant: "destructive",
      });
      setIsConnecting(false);
    },
  });

  // Sync transactions mutation
  const syncTransactionsMutation = useMutation({
    mutationFn: async (accountId: number) => {
      const response = await apiRequest("POST", "/api/bank-accounts/sync", { accountId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Transactions Synced!",
        description: "Your latest bank transactions have been imported.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
  });

  const { open, ready } = usePlaidLink({
    token: linkTokenData?.link_token,
    onSuccess: (public_token, metadata) => {
      setIsConnecting(true);
      connectBankMutation.mutate({ public_token, metadata });
    },
    onExit: (err) => {
      if (err) {
        toast({
          title: "Connection Cancelled",
          description: "Bank connection was cancelled or failed.",
          variant: "destructive",
        });
      }
    },
  });

  const formatBalance = (balance: string | null, currency: string = "USD") => {
    if (!balance) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(parseFloat(balance));
  };

  const getAccountIcon = (accountType: string) => {
    switch (accountType.toLowerCase()) {
      case "checking":
        return <Wallet className="w-5 h-5" />;
      case "savings":
        return <Banknote className="w-5 h-5" />;
      case "credit":
        return <CreditCard className="w-5 h-5" />;
      default:
        return <Building2 className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Topbar
        title="Bank Accounts"
        subtitle="Connect your bank accounts for automatic transaction tracking"
        onAddTransaction={() => {}}
        onToggleMobileMenu={() => {}}
      />
      
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        {/* Connection Status & Actions */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5" />
                  <span>Bank Account Integration</span>
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Securely connect your bank accounts for automatic expense tracking
                </p>
              </div>
              <Button 
                onClick={open} 
                disabled={!ready || isConnecting}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isConnecting ? "Connecting..." : "Connect Bank Account"}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Security Notice */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900">Bank-Grade Security</h3>
                <p className="text-blue-700 text-sm mt-1">
                  We use Plaid's secure banking infrastructure, trusted by major financial institutions worldwide. 
                  Your banking credentials are never stored on our servers, and all data is encrypted end-to-end.
                  Supports banks from India, US, Canada, UK, and 20+ other countries.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connected Accounts */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : bankAccounts.length > 0 ? (
          <>
            <h2 className="text-xl font-semibold mb-4">Connected Accounts ({bankAccounts.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bankAccounts.map((account: BankAccount) => (
                <Card key={account.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getAccountIcon(account.accountType)}
                        <Badge variant="outline" className="text-xs">
                          {account.accountType}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-muted-foreground">Active</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-lg">{account.accountName}</p>
                        <p className="text-sm text-muted-foreground">{account.institutionName}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Current Balance</span>
                          <span className="font-semibold">
                            {formatBalance(account.currentBalance, account.isoPrimaryCurrency)}
                          </span>
                        </div>
                        
                        {account.availableBalance && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Available</span>
                            <span className="text-sm">
                              {formatBalance(account.availableBalance, account.isoPrimaryCurrency)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Last synced: {new Date(account.lastSynced).toLocaleDateString()}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => syncTransactionsMutation.mutate(account.id)}
                            disabled={syncTransactionsMutation.isPending}
                          >
                            <RefreshCw className={`w-3 h-3 mr-1 ${syncTransactionsMutation.isPending ? 'animate-spin' : ''}`} />
                            Sync
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Bank Accounts Connected</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Connect your bank accounts to automatically import transactions, track spending, 
                and get real-time balance updates. Works with banks worldwide including India.
              </p>
              <Button 
                onClick={open} 
                disabled={!ready}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Connect Your First Bank Account
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Automatic Tracking</h3>
              <p className="text-sm text-muted-foreground">
                All your transactions are imported automatically, categorized intelligently using AI
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Real-Time Balances</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your account balances and spending in real-time across all connected accounts
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <AlertCircle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Smart Insights</h3>
              <p className="text-sm text-muted-foreground">
                Get AI-powered insights about your spending patterns and financial health
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}