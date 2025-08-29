import type { Product, InsertProduct } from "@shared/schema";

// Mock product data
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Three pancakes with syrup",
    description: "Three fluffy pancakes served with maple syrup.",
    price: "7.25",
    category: "breakfast",
    imageUrl: "https://pixabay.com/get/gfb52014a5f0ce875b1dd72141c58c477dc333b86fa46156250238c2174d29003e8bf8e30c01086a2eaa8497985aa10a2b6e7323f162c3fc68615906b1063569e_1280.jpg",
    available: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Smooth latte with vanilla syrup",
    description: "A smooth latte with a hint of vanilla syrup.",
    price: "4.75",
    category: "coffee",
    imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    available: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Creamy espresso with steamed milk",
    description: "Espresso with creamy steamed milk.",
    price: "4.25",
    category: "coffee",
    imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    available: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    name: "Flaky, buttery French pastry",
    description: "A classic French pastry, flaky and buttery.",
    price: "3.95",
    category: "pastries",
    imageUrl: "https://pixabay.com/get/g0877ffe8254c67443db88168e6265b6612a4f391d2e1476aa6618c34b6ac7b109ceb2545520a2c32fb30803c8f6570f2a15e60bd8bde03358791849da61d3709_1280.jpg",
    available: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    name: "Rich, bold espresso shot",
    description: "A shot of rich, bold espresso.",
    price: "3.50",
    category: "coffee",
    imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    available: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "6",
    name: "Classic glazed with sprinkles",
    description: "Classic glazed pastry with colorful sprinkles.",
    price: "2.75",
    category: "pastries",
    imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    available: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "7",
    name: "Warm roll with cinnamon glaze",
    description: "Warm roll topped with sweet cinnamon glaze.",
    price: "4.25",
    category: "pastries",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    available: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "8",
    name: "Egg, cheese & bacon on brioche",
    description: "Egg, cheese, and bacon on a soft brioche bun.",
    price: "6.50",
    category: "breakfast",
    imageUrl: "https://images.unsplash.com/photo-1481070555726-e2fe8357725c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    available: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "9",
    name: "Rich chocolate chip muffin",
    description: "A rich muffin loaded with chocolate chips.",
    price: "4.50",
    category: "pastries",
    imageUrl: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    available: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "10",
    name: "Refreshing cold brew tea",
    description: "Iced cold brew tea, refreshing and light.",
    price: "2.95",
    category: "coffee",
    imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    available: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
].map(p => ({
  ...p,
  description: p.description ?? null,
  imageUrl: p.imageUrl ?? null,
  available: p.available ?? true,
  createdAt: p.createdAt ?? null,
  updatedAt: p.updatedAt ?? null,
}));

export const storage = {
  async getProducts(): Promise<Product[]> {
    return mockProducts.filter(p => p.available);
  },
  async getProductsByCategory(category: string): Promise<Product[]> {
    return mockProducts.filter(p => p.available && p.category === category);
  },
  async getProduct(id: string): Promise<Product | undefined> {
    return mockProducts.find(p => p.id === id && p.available);
  },
  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: (mockProducts.length + 1).toString(),
      available: true,
      description: product.description ?? null,
      imageUrl: product.imageUrl ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockProducts.push(newProduct);
    return newProduct;
  },
  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const idx = mockProducts.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    mockProducts[idx] = {
      ...mockProducts[idx],
      ...product,
      description: product.description ?? mockProducts[idx].description ?? null,
      imageUrl: product.imageUrl ?? mockProducts[idx].imageUrl ?? null,
      updatedAt: new Date(),
    };
    return mockProducts[idx];
  },
  async deleteProduct(id: string): Promise<boolean> {
    const idx = mockProducts.findIndex(p => p.id === id);
    if (idx === -1) return false;
    mockProducts[idx].available = false;
    mockProducts[idx].updatedAt = new Date();
    return true;
  },
};
