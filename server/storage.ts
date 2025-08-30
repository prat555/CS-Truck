import type { Product, InsertProduct } from "@shared/schema";

// Mock data stores
let orderCounter = 1;
const mockOrders: any[] = [];
const mockUsers: any[] = [];

// Mock product data
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Three pancakes with syrup",
    description: "Three fluffy pancakes served with maple syrup.",
  price: 180,
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
  price: 120,
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
  price: 100,
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
  price: 90,
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
  price: 80,
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
  price: 60,
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
  price: 100,
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
  price: 150,
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
  price: 110,
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
  price: 70,
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
      price: typeof product.price === 'string' ? parseFloat(product.price.replace(/[^\d.]/g, '')) : product.price,
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
      price: product.price !== undefined
        ? (typeof product.price === 'string' ? parseFloat(product.price.replace(/[^\d.]/g, '')) : product.price)
        : mockProducts[idx].price,
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

  // Order methods
  async generateOrderNumber(): Promise<string> {
    return `CS-${String(orderCounter++).padStart(3, '0')}`;
  },

  async createOrder(orderData: any): Promise<any> {
    const order = {
      id: (mockOrders.length + 1).toString(),
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockOrders.push(order);
    return order;
  },

  async getOrder(id: string): Promise<any> {
    return mockOrders.find(order => order.id === id);
  },

  async getOrderByNumber(orderNumber: string): Promise<any> {
    return mockOrders.find(order => order.orderNumber === orderNumber);
  },

  async getUserOrders(userId: string): Promise<any[]> {
    return mockOrders.filter(order => order.userId === userId);
  },

  async updateOrderStatus(id: string, status: string): Promise<any> {
    const order = mockOrders.find(order => order.id === id);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date();
    return order;
  },

  async getOrders(limit?: number): Promise<any[]> {
    return limit ? mockOrders.slice(0, limit) : mockOrders;
  },

  async getPendingOrders(): Promise<any[]> {
    return mockOrders.filter(order => order.status === 'pending');
  },

  async createOrderItem(itemData: any): Promise<any> {
    // In a real implementation, this would create order items
    // For now, just return the data
    return { id: Date.now().toString(), ...itemData };
  },

  // User methods  
  async getUser(userId: string): Promise<any> {
    let user = mockUsers.find(u => u.id === userId);
    if (!user) {
      user = {
        id: userId,
        points: 0,
        totalOrders: 0,
        totalSpent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUsers.push(user);
    }
    return user;
  },
};