import { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Get cart from localStorage
  const cart = JSON.parse(localStorage.getItem('cs-truck-cart') || '[]');
  const total = cart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

  const handleRazorpayPayment = async () => {
    setLoading(true);
    try {
      // Create order on backend
      const res = await fetch('/api/payments/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, currency: 'INR' }),
      });
      const order = await res.json();
      if (!order.id) throw new Error('Failed to create Razorpay order');

      // Load Razorpay script if not present
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const options = {
        key: 'rzp_test_RBJQ1I0Gt91gCd',
        amount: order.amount,
        currency: order.currency,
        name: 'CS-Truck',
        description: 'Order Payment',
        order_id: order.id,
        handler: function (response: any) {
          toast({
            title: 'Payment Successful',
            description: `Payment ID: ${response.razorpay_payment_id}`,
            variant: 'success',
          });
          localStorage.removeItem('cs-truck-cart');
          setTimeout(() => setLocation('/'), 2000);
        },
        prefill: {
          name: '',
          email: '',
        },
        theme: { color: '#6366f1' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast({
        title: 'Payment Failed',
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4 p-8">
        <h2 className="text-2xl font-bold">Checkout</h2>
        <p className="text-muted-foreground mb-4">Total: <span className="font-bold">₹{total.toFixed(2)}</span></p>
        <Button onClick={handleRazorpayPayment} disabled={loading || total === 0} data-testid="button-razorpay-pay">
          {loading ? 'Processing...' : 'Pay with Razorpay'}
        </Button>
        <Button onClick={() => setLocation('/')} variant="outline" className="ml-2" data-testid="button-back-to-menu">
          Back to Menu
        </Button>
      </div>
    </div>
  );
}
