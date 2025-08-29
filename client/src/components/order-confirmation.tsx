import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { CheckCircle, Truck } from "lucide-react";

interface OrderConfirmationProps {
  orderNumber: string;
}

export default function OrderConfirmation({ orderNumber }: OrderConfirmationProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold" data-testid="text-confirmation-title">
              Order Confirmed! 🎉
            </h2>
            <p className="text-muted-foreground">
              Your order has been placed successfully
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Order Number</p>
            <p className="text-2xl font-bold text-primary" data-testid="text-order-number">
              {orderNumber}
            </p>
          </div>

          <div className="bg-accent/50 p-4 rounded-lg text-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Truck className="w-4 h-4 text-primary" />
              <span className="font-medium">What's next?</span>
            </div>
            <p className="text-accent-foreground/80">
              We'll prepare your order and notify you when it's ready for pickup at the CS-Truck!
            </p>
          </div>

          <Button
            onClick={() => setLocation('/')}
            className="w-full"
            data-testid="button-continue-shopping"
          >
            Continue Shopping
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
