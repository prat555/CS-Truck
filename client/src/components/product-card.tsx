import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Card className="overflow-hidden fade-in bg-card border border-border shadow-sm hover:shadow-md transition-shadow" data-testid={`card-product-${product.id}`}>
      <img
        src={product.imageUrl || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"}
        alt={product.name}
        className="w-full h-48 object-cover"
        data-testid={`img-product-${product.id}`}
      />
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-foreground" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
          <span className="text-lg font-bold text-primary" data-testid={`text-product-price-${product.id}`}>
            ${product.price}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-3" data-testid={`text-product-description-${product.id}`}>
          {product.description || "Delicious item from CS-Truck"}
        </p>
        <Button
          onClick={() => onAddToCart(product)}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          data-testid={`button-add-to-cart-${product.id}`}
        >
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}
