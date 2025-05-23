import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

interface UpgradePromptProps {
  title: string;
  description: string;
  features: string[];
  className?: string;
}

export function UpgradePrompt({ title, description, features, className }: UpgradePromptProps) {
  const [, setLocation] = useLocation();

  return (
    <Card className={`border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-purple-50 dark:to-purple-900/20 ${className}`}>
      <CardHeader className="text-center pb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-white" />
        </div>
        
        <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white mb-2 mx-auto w-fit">
          <Sparkles className="w-3 h-3 mr-1" />
          Premium Feature
        </Badge>
        
        <CardTitle className="text-xl">{title}</CardTitle>
        <p className="text-muted-foreground">{description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Unlock with Premium ($2/month):</h4>
          <ul className="space-y-1">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                {feature}
              </li>
            ))}
          </ul>
        </div>
        
        <Button 
          onClick={() => setLocation("/subscription")}
          className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white"
        >
          Upgrade to Premium
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        
        <p className="text-xs text-center text-muted-foreground">
          Cancel anytime • Secure payment with Stripe
        </p>
      </CardContent>
    </Card>
  );
}