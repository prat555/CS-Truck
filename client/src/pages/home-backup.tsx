import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Star, Coffee, Users, Clock, Settings, Package, History } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import OrderHistory from "@/components/order-history";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import ProductCard from "@/components/product-card";
import CartModal from "@/components/cart-modal";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/lib/constants";
import type { Product } from "@shared/schema";
import { Link } from "wouter";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function Home() {
  const { user, logout } = useAuth();
  const { userProfile } = useOrders();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(PRODUCT_CATEGORIES.ALL);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cs-truck-cart') || '[]');
    setCart(savedCart);
  }, []);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', selectedCategory],
    // Allow browsing products without authentication
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      let newCart;
      if (existingItem) {
        newCart = prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...prev, {
          id: product.id,
          name: product.name,
          price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
          quantity: 1,
        }];
      }
      // Save to localStorage
      localStorage.setItem('cs-truck-cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    setCart(prev => {
      let newCart;
      if (newQuantity === 0) {
        newCart = prev.filter(item => item.id !== productId);
      } else {
        newCart = prev.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        );
      }
      // Save to localStorage
      localStorage.setItem('cs-truck-cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const categories = [
    { id: PRODUCT_CATEGORIES.ALL, label: "All Items" },
    { id: PRODUCT_CATEGORIES.COFFEE, label: "Coffee & Tea" },
    { id: PRODUCT_CATEGORIES.BREAKFAST, label: "Breakfast" },
    { id: PRODUCT_CATEGORIES.PASTRIES, label: "Pastries" },
  ];

  return (
    <>
      {/* Order History Modal */}
      <OrderHistory 
        open={showOrderHistory} 
        onClose={() => setShowOrderHistory(false)} 
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 bg-card border-b border-border z-40 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Truck className="text-primary-foreground text-lg" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground" data-testid="text-app-title">CS-Truck</h1>
                <p className="text-xs text-muted-foreground">Fresh on Wheels</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <div className="flex items-center space-x-1 bg-accent px-2 py-1 rounded-full">
                    <Star className="text-primary text-sm w-4 h-4" />
                    <span className="text-sm font-medium" data-testid="text-user-points">
                      {userProfile?.points || 0}
                    </span>
                  </div>
                  <Button
                    onClick={() => setShowOrderHistory(true)}
                    variant="outline"
                    size="sm"
                    data-testid="button-order-history"
                  >
                    <History className="w-4 h-4" />
                  </Button>
                  <Link href="/admin">
                    <Button variant="outline" size="sm" data-testid="button-admin">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    onClick={logout}
                    variant="outline"
                    size="sm"
                    data-testid="button-logout"
                  >
                    Logout
                  </Button>
                </>
              </div>
            </div>
          </div>
        </header>

      {/* Category Navigation */}
      <nav className="bg-card border-b border-border sticky top-16 z-30">
        <div className="overflow-x-auto">
          <div className="flex space-x-1 px-4 py-3 min-w-max">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
                data-testid={`button-category-${category.id}`}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </nav>

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground p-6 m-4 rounded-xl">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold" data-testid="text-welcome">
              {user ? `Welcome back, ${user.displayName?.split(' ')[0] || 'Foodie'}! 👋` : 'Welcome to CS-Truck! 🚚'}
            </h2>
            <p className="text-primary-foreground/90">
              {user ? 'What can we get started for you today?' : 'Fresh coffee, breakfast, and pastries made with love'}
            </p>
            {user && userProfile && (
              <div className="flex justify-center items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>{userProfile.points} points</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Package className="w-4 h-4" />
                  <span>{userProfile.totalOrders} orders</span>
                </div>
              </div>
            )}
            <div className="flex justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Coffee className="w-4 h-4" />
                <span>Fresh Daily</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Quick Service</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Family Owned</span>
              </div>
            </div>
          </div>
        </div>      {/* Special Offers Banner */}
      <div className="bg-gradient-to-r from-accent/80 to-accent text-accent-foreground p-4 m-4 rounded-xl border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold" data-testid="text-offer-title">Today's Special!</h3>
            <p className="text-sm opacity-90">Buy 2 coffees, get 1 pastry free</p>
          </div>
          <Star className="text-2xl text-primary" />
        </div>
      </div>

      {/* Product Grid */}
      <main className="px-4 pb-32">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="w-full h-48 bg-muted animate-pulse" />
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                    <div className="h-8 bg-muted rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground" data-testid="text-no-products">No products available in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => setIsCartOpen(true)}
            className="bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 relative"
            data-testid="button-cart"
          >
            <div className="flex items-center space-x-2">
              <span className="text-xl">🛒</span>
              <span className="font-semibold">₹{cartTotal.toFixed(2)}</span>
            </div>
            <Badge
              className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground"
              data-testid="text-cart-count"
            >
              {cartItemCount}
            </Badge>
          </Button>
        </div>
      )}

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateCartQuantity}
        total={cartTotal}
      />

      {/* Footer */}
      <footer className="w-full border-t border-border bg-card py-6 mt-8">
        <div className="max-w-2xl mx-auto flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <a href="/refund-policy" className="hover:underline">Refund Policy</a>
          <a href="/contact-us" className="hover:underline">Contact Us</a>
          <a href="/privacy-policy" className="hover:underline">Privacy Policy</a>
          <a href="/terms-and-conditions" className="hover:underline">Terms &amp; Conditions</a>
          <a href="/shipping-policy" className="hover:underline">Shipping Policy</a>
        </div>
      </footer>
    </div>
    </>
  );
}
