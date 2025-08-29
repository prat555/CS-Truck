export const PRODUCT_CATEGORIES = {
  ALL: 'all',
  COFFEE: 'coffee',
  BREAKFAST: 'breakfast',
  PASTRIES: 'pastries',
} as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[keyof typeof PRODUCT_CATEGORIES];

export const ORDER_STATUSES = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const DEFAULT_PRODUCTS = [
  {
    name: "Classic Espresso",
    description: "Rich, bold espresso shot",
    price: "3.50",
    category: "coffee",
    imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
  },
  {
    name: "Cappuccino",
    description: "Creamy espresso with steamed milk",
    price: "4.25",
    category: "coffee",
    imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
  },
  {
    name: "Vanilla Latte",
    description: "Smooth latte with vanilla syrup",
    price: "4.75",
    category: "coffee",
    imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
  },
  {
    name: "Fresh Iced Tea",
    description: "Refreshing cold brew tea",
    price: "2.95",
    category: "coffee",
    imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
  },
  {
    name: "Breakfast Sandwich",
    description: "Egg, cheese & bacon on brioche",
    price: "6.50",
    category: "breakfast",
    imageUrl: "https://images.unsplash.com/photo-1481070555726-e2fe8357725c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
  },
  {
    name: "Fluffy Pancakes",
    description: "Three pancakes with syrup",
    price: "7.25",
    category: "breakfast",
    imageUrl: "https://pixabay.com/get/gfb52014a5f0ce875b1dd72141c58c477dc333b86fa46156250238c2174d29003e8bf8e30c01086a2eaa8497985aa10a2b6e7323f162c3fc68615906b1063569e_1280.jpg",
  },
  {
    name: "Butter Croissant",
    description: "Flaky, buttery French pastry",
    price: "3.95",
    category: "pastries",
    imageUrl: "https://pixabay.com/get/g0877ffe8254c67443db88168e6265b6612a4f391d2e1476aa6618c34b6ac7b109ceb2545520a2c32fb30803c8f6570f2a15e60bd8bde03358791849da61d3709_1280.jpg",
  },
  {
    name: "Chocolate Muffin",
    description: "Rich chocolate chip muffin",
    price: "4.50",
    category: "pastries",
    imageUrl: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
  },
  {
    name: "Glazed Donut",
    description: "Classic glazed with sprinkles",
    price: "2.75",
    category: "pastries",
    imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
  },
  {
    name: "Cinnamon Roll",
    description: "Warm roll with cinnamon glaze",
    price: "4.25",
    category: "pastries",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
  },
];
