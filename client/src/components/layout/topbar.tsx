import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { CurrencySelector } from "@/components/currency-selector";
import { useCurrency } from "@/context/currency-context";
import { Menu, Plus, User } from "lucide-react";

interface TopbarProps {
  title: string;
  subtitle: string;
  onAddTransaction: () => void;
  onToggleMobileMenu: () => void;
}

export default function Topbar({ title, subtitle, onAddTransaction, onToggleMobileMenu }: TopbarProps) {
  const { currency, setCurrency } = useCurrency();

  return (
    <header className="bg-background dark:bg-background border-b border-border p-4 lg:p-6 shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            className="lg:hidden text-muted-foreground" 
            onClick={onToggleMobileMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <CurrencySelector 
            selectedCurrency={currency}
            onCurrencyChange={setCurrency}
          />
          
          <ThemeToggle />
          
          <Button 
            onClick={onAddTransaction}
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Transaction</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
            <User className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </header>
  );
}
