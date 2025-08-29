import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

// Payment integration disabled - simplified checkout page

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Payment integration temporarily disabled
  useEffect(() => {
    toast({
      title: "Payment Integration Disabled",
      description: "Payment functionality is temporarily disabled. Redirecting to menu...",
      variant: "destructive",
    });
    setTimeout(() => setLocation('/'), 2000);
  }, [setLocation, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4 p-8">
        <h2 className="text-2xl font-bold">Payment Integration Disabled</h2>
        <p className="text-muted-foreground">Payment functionality is temporarily disabled.</p>
        <Button onClick={() => setLocation('/')} data-testid="button-back-to-menu">
          Back to Menu
        </Button>
      </div>
    </div>
  );
}
