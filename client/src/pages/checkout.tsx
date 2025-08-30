import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from "@/hooks/use-toast";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Star, Gift, ArrowLeft } from "lucide-react";
import LoginModal from "@/components/login-modal";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { userProfile, placeOrder, orderLoading, loading } = useOrders();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [showLogin, setShowLogin] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cs-truck-cart') || '[]');
    setCart(savedCart);
  }, []);

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      setShowLogin(true);
    } else {
      setShowLogin(false);
    }
  }, [user]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = subtotal * 0.05; // 5% discount
  const afterDiscount = subtotal - discount;
  const gst = afterDiscount * 0.18; // 18% GST
  const pointsDiscount = Math.floor(Math.min(pointsToUse, userProfile?.points || 0) / 10);
  const total = Math.max(0, afterDiscount + gst - pointsDiscount);

  const handleRazorpayPayment = async () => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    try {
      // Create Razorpay order first (don't place order in Firebase yet)
      const res = await fetch('/api/payments/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: total, 
          currency: 'INR',
          receipt: `receipt_${Date.now()}`
        }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to create payment order');
      }
      
      const razorpayOrder = await res.json();
      if (!razorpayOrder.id) throw new Error('Failed to create Razorpay order');

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
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'CS-Truck',
        description: 'Food Order Payment',
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          try {
            // Payment successful, now place the order
            const orderId = await placeOrder(cart, total, pointsToUse);
            if (orderId) {
              toast({
                title: 'Payment Successful! 🎉',
                description: `Order ${orderId} confirmed. You earned ${Math.floor(total / 10)} points (₹${Math.floor(total / 10)} value)!`,
              });
              localStorage.removeItem('cs-truck-cart');
              setTimeout(() => setLocation('/'), 2000);
            }
          } catch (error) {
            toast({
              title: 'Order Failed',
              description: 'Payment successful but order creation failed. Please contact support.',
              variant: 'destructive',
            });
          }
        },
        modal: {
          ondismiss: function() {
            toast({
              title: 'Payment Cancelled',
              description: 'Payment was cancelled. Your cart is saved.',
              variant: 'destructive',
            });
          }
        },
        prefill: {
          name: user.displayName || '',
          email: user.email || '',
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
    }
  };

  const handleDirectOrder = async () => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    const orderId = await placeOrder(cart, total, pointsToUse);
    if (orderId) {
      toast({
        title: 'Order Placed! 🎉',
        description: `Order ${orderId} confirmed. You earned ${Math.floor(total / 10)} points (₹${Math.floor(total / 10)} value)!`,
      });
      localStorage.removeItem('cs-truck-cart');
      setTimeout(() => setLocation('/'), 2000);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
          <p className="text-muted-foreground">Add some items to your cart first</p>
          <Button onClick={() => setLocation('/')} data-testid="button-back-to-menu">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
      
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Checkout</h1>
            <Button variant="outline" onClick={() => setLocation('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
          </div>

          {/* User Info & Points */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Your Rewards
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading your rewards...</span>
                  </div>
                ) : userProfile ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{userProfile.points || 0} points available</p>
                        <p className="text-sm text-muted-foreground">
                          You'll earn {Math.floor(total / 10)} points from this order
                        </p>
                      </div>
                      <Badge variant="secondary">
                        <Gift className="w-4 h-4 mr-1" />
                        ₹{Math.floor((userProfile.points || 0) / 10)} value
                      </Badge>
                    </div>
                    
                    {(userProfile.points || 0) > 0 && (
                      <div className="mt-4 space-y-2">
                        <Label htmlFor="points">Use points (10 points = ₹1 discount)</Label>
                        <Input
                          id="points"
                          type="number"
                          min="0"
                          max={Math.min(userProfile.points || 0, (afterDiscount + gst) * 10)}
                          value={pointsToUse}
                          onChange={(e) => setPointsToUse(Number(e.target.value))}
                          placeholder="Enter points to use"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">Setting up your rewards profile...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-green-600">
                  <span>Discount (5%)</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>After Discount</span>
                  <span>₹{afterDiscount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Points Discount</span>
                    <span>-₹{pointsDiscount.toFixed(2)}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Options */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleRazorpayPayment} 
                disabled={loading || orderLoading || total === 0}
                className="w-full"
                size="lg"
                data-testid="button-razorpay-pay"
              >
                {loading ? 'Processing...' : `Pay ₹${total.toFixed(2)} with Razorpay`}
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">or</div>
              
              <Button 
                onClick={handleDirectOrder} 
                disabled={orderLoading || total === 0}
                variant="outline"
                className="w-full"
                size="lg"
                data-testid="button-direct-order"
              >
                {orderLoading ? 'Placing Order...' : 'Order without Payment (Pay Later)'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
