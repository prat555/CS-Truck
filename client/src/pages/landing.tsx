import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Star, Coffee, Users, Clock } from "lucide-react";
import ProductCard from "@/components/product-card";
import CartModal from "@/components/cart-modal";
import LoginModal from "@/components/login-modal";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/lib/constants";
import type { Product } from "@shared/schema";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function Landing() {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(PRODUCT_CATEGORIES.ALL);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', selectedCategory],
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
        quantity: 1,
      }];
    });
  };

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(prev => prev.filter(item => item.id !== productId));
    } else {
      setCart(prev =>
        prev.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
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
            <Button
              onClick={() => setShowLoginModal(true)}
              variant="outline"
              size="sm"
              data-testid="button-login"
            >
              Login
            </Button>
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

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground p-6 m-4 rounded-xl">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold" data-testid="text-hero-title">Welcome to CS-Truck!</h2>
          <p className="text-primary-foreground/90">Fresh coffee, breakfast, and pastries made with love</p>
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
      </div>

      {/* Special Offers Banner */}
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

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Footer */}
      <footer className="w-full border-t border-border bg-card py-6 mt-8">
        <div className="max-w-2xl mx-auto flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:underline">About Us</a>
          <a href="#" className="hover:underline">Contact Us</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms & Conditions</a>
          <a href="#" className="hover:underline">Refund Policy</a>
          <a href="#" className="hover:underline">Shipping Policy</a>
        </div>
        <div className="text-center mt-4 text-xs text-muted-foreground">
          © 2024 CS-Truck. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
