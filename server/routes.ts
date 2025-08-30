import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertOrderItemSchema, insertProductSchema } from "@shared/schema";
import { sendOrderConfirmationEmail } from "./emailService";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // No authentication middleware

  // Auth routes (now just dummy endpoints)
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Return a mock user since we removed authentication
      const mockUser = {
        id: 'mock-user-id',
        firstName: 'Local',
        lastName: 'User',
        points: 0
      };
      res.json(mockUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const { category } = req.query;
      let products;
      
      if (category && category !== 'all') {
        products = await storage.getProductsByCategory(category as string);
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post('/api/products', async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put('/api/products/:id', async (req, res) => {
    try {
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, productData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/products/:id', async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Order routes
  app.get('/api/orders', async (req: any, res) => {
    try {
      // Since we removed auth, return all orders or use a mock user ID
      const userId = 'mock-user-id';
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.get('/api/orders/number/:orderNumber', async (req, res) => {
    try {
      const order = await storage.getOrderByNumber(req.params.orderNumber);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.put('/api/orders/:id/status', async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Admin routes
  app.get('/api/admin/orders', async (req, res) => {
    try {
      const { limit } = req.query;
      const orders = await storage.getOrders(limit ? parseInt(limit as string) : undefined);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/admin/orders/pending', async (req, res) => {
    try {
      const orders = await storage.getPendingOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching pending orders:", error);
      res.status(500).json({ message: "Failed to fetch pending orders" });
    }
  });

  app.post('/api/admin/orders/offline', async (req, res) => {
    try {
      const { customerName, customerPhone, customerEmail, items } = req.body;
      // Validate items
      const orderItemsSchema = z.array(z.object({
        productId: z.string(),
        quantity: z.number().positive(),
        price: z.number().positive(),
        name: z.string().optional(),
      }));
      const validatedItems = orderItemsSchema.parse(items);
      // Calculate total
      const total = validatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      // Generate order number
      const orderNumber = await storage.generateOrderNumber();
      // Create order
      const orderData = {
        orderNumber,
        customerName,
        customerPhone,
        total: total.toString(),
        status: "pending",
        isOffline: true,
        pointsEarned: Math.floor(total), // 1 point per dollar
      };
      const order = await storage.createOrder(orderData);
      // Create order items
      for (const item of validatedItems) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price.toString(),
        });
      }
      const fullOrder = await storage.getOrder(order.id);

      // Send order confirmation email if email provided
      if (customerEmail) {
        await sendOrderConfirmationEmail({
          orderNumber,
          customerName,
          customerEmail,
          items: validatedItems.map(item => ({
            name: item.name || item.productId,
            quantity: item.quantity,
            price: item.price
          })),
          total,
          pointsEarned: Math.floor(total),
        });
      }

      res.status(201).json(fullOrder);
    } catch (error) {
      console.error("Error creating offline order:", error);
      res.status(500).json({ message: "Failed to create offline order" });
    }
  });

  // Payment routes disabled for now - Stripe integration removed
  app.post("/api/create-payment-intent", async (req, res) => {
    res.status(501).json({ message: "Payment integration temporarily disabled" });
  });

  app.post("/api/confirm-order", async (req: any, res) => {
    res.status(501).json({ message: "Payment integration temporarily disabled" });
  });

  // Email confirmation endpoint
  app.post("/api/send-order-email", async (req, res) => {
    try {
      const emailData = req.body;
      const success = await sendOrderConfirmationEmail(emailData);
      res.json({ success, message: success ? "Email sent successfully" : "Email service not configured - check console" });
    } catch (error) {
      console.error("Error sending order email:", error);
      res.status(500).json({ success: false, message: "Failed to send email", error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
