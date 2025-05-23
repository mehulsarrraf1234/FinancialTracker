import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap } from "lucide-react";

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PlanCardProps {
  title: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  current?: boolean;
  onSelect: () => void;
  buttonText: string;
}

export function PlanCard({ 
  title, 
  price, 
  period, 
  description, 
  features, 
  popular, 
  current, 
  onSelect, 
  buttonText 
}: PlanCardProps) {
  return (
    <Card className={`relative ${popular ? 'border-primary border-2' : 'border-border'}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-3 py-1">
            <Crown className="w-3 h-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-muted-foreground ml-1">/{period}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      </CardHeader>
      
      <CardContent>
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className={`h-4 w-4 mr-3 ${
                feature.included ? 'text-green-500' : 'text-muted-foreground opacity-30'
              }`} />
              <span className={`text-sm ${
                feature.included ? 'text-foreground' : 'text-muted-foreground line-through'
              }`}>
                {feature.name}
              </span>
            </li>
          ))}
        </ul>
        
        <Button 
          onClick={onSelect}
          className={`w-full ${
            current 
              ? 'bg-green-600 hover:bg-green-700' 
              : popular 
                ? 'bg-primary hover:bg-primary/90' 
                : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
          }`}
          disabled={current}
        >
          {current && <Zap className="w-4 h-4 mr-2" />}
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}