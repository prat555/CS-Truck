import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import { X, Plus, Minus } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  total: number;
}

export default function CartModal({ isOpen, onClose, cart, onUpdateQuantity, total }: CartModalProps) {
  const [, setLocation] = useLocation();

  const handleCheckout = () => {
    // Save cart to localStorage for checkout page
    localStorage.setItem('cs-truck-cart', JSON.stringify(cart));
    onClose();
    setLocation('/checkout');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span data-testid="text-cart-title">Your Order</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              data-testid="button-close-cart"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground" data-testid="text-empty-cart">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-3 border-b border-border last:border-b-0" data-testid={`cart-item-${item.id}`}>
                  <div>
                    <h4 className="font-medium" data-testid={`text-cart-item-name-${item.id}`}>{item.name}</h4>
                    <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 p-0"
                      data-testid={`button-decrease-${item.id}`}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="font-medium w-8 text-center" data-testid={`text-cart-item-quantity-${item.id}`}>
                      {item.quantity}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 p-0"
                      data-testid={`button-increase-${item.id}`}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total:</span>
                <span className="text-primary" data-testid="text-cart-total">${total.toFixed(2)}</span>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-proceed-checkout"
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
