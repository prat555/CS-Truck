import {
  users,
  products,
  orders,
  orderItems,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type OrderWithItems,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPoints(userId: string, points: number): Promise<User | undefined>;
  updateUserStripeInfo(userId: string, customerId: string, subscriptionId?: string): Promise<User | undefined>;

  // Product operations
  getProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<OrderWithItems | undefined>;
  getOrderByNumber(orderNumber: string): Promise<OrderWithItems | undefined>;
  getOrders(limit?: number): Promise<OrderWithItems[]>;
  getUserOrders(userId: string): Promise<OrderWithItems[]>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  getPendingOrders(): Promise<OrderWithItems[]>;

  // Order item operations
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: string): Promise<(OrderItem & { product: Product })[]>;

  // Order number generation
  generateOrderNumber(): Promise<string>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserPoints(userId: string, points: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        points: sql`${users.points} + ${points}`,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, customerId: string, subscriptionId?: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.available, true));
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(and(eq(products.category, category), eq(products.available, true)));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db
      .update(products)
      .set({ available: false, updatedAt: new Date() })
      .where(eq(products.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(eq(orders.id, id));

    if (!order) return undefined;

    const items = await this.getOrderItems(id);
    
    return {
      ...order.orders,
      user: order.users || undefined,
      orderItems: items,
    };
  }

  async getOrderByNumber(orderNumber: string): Promise<OrderWithItems | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(eq(orders.orderNumber, orderNumber));

    if (!order) return undefined;

    const items = await this.getOrderItems(order.orders.id);
    
    return {
      ...order.orders,
      user: order.users || undefined,
      orderItems: items,
    };
  }

  async getOrders(limit = 50): Promise<OrderWithItems[]> {
    const orderResults = await db
      .select()
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt))
      .limit(limit);

    const ordersWithItems = await Promise.all(
      orderResults.map(async (orderResult) => {
        const items = await this.getOrderItems(orderResult.orders.id);
        return {
          ...orderResult.orders,
          user: orderResult.users || undefined,
          orderItems: items,
        };
      })
    );

    return ordersWithItems;
  }

  async getUserOrders(userId: string): Promise<OrderWithItems[]> {
    const orderResults = await db
      .select()
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    const ordersWithItems = await Promise.all(
      orderResults.map(async (orderResult) => {
        const items = await this.getOrderItems(orderResult.orders.id);
        return {
          ...orderResult.orders,
          user: orderResult.users || undefined,
          orderItems: items,
        };
      })
    );

    return ordersWithItems;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async getPendingOrders(): Promise<OrderWithItems[]> {
    const orderResults = await db
      .select()
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(eq(orders.status, "pending"))
      .orderBy(orders.createdAt);

    const ordersWithItems = await Promise.all(
      orderResults.map(async (orderResult) => {
        const items = await this.getOrderItems(orderResult.orders.id);
        return {
          ...orderResult.orders,
          user: orderResult.users || undefined,
          orderItems: items,
        };
      })
    );

    return ordersWithItems;
  }

  // Order item operations
  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db.insert(orderItems).values(orderItem).returning();
    return newOrderItem;
  }

  async getOrderItems(orderId: string): Promise<(OrderItem & { product: Product })[]> {
    const items = await db
      .select()
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));

    return items.map(item => ({
      ...item.order_items,
      product: item.products,
    }));
  }

  // Order number generation
  async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Get count of orders today
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(sql`DATE(created_at) = CURRENT_DATE`);
    
    const dailyCount = (result?.count || 0) + 1;
    return `CS${dateStr}${String(dailyCount).padStart(3, '0')}`;
  }
}

export const storage = new DatabaseStorage();
