import { Link, useLocation } from "wouter";
import { 
  Home, 
  ArrowLeftRight, 
  Tags, 
  Handshake, 
  Briefcase, 
  BarChart3, 
  Settings,
  TrendingUp,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { name: "Categories", href: "/categories", icon: Tags },
  { name: "Loans", href: "/loans", icon: Handshake },
  { name: "Business", href: "/business", icon: Briefcase },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [location] = useLocation();

  if (!isOpen) return null;

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden">
      <div className="bg-white w-64 h-full shadow-lg">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">FinanceTracker</h1>
                <p className="text-sm text-slate-500">Pro</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5 text-slate-400" />
            </Button>
          </div>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <a 
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isActive 
                          ? "bg-primary text-white" 
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                      onClick={handleLinkClick}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
