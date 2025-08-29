import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  List, 
  Clock, 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle,
  Circle,
  AlertCircle
} from "lucide-react";
import type { OrderWithItems, Product, Order } from "@shared/schema";
import { ORDER_STATUSES } from "@/lib/constants";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("orders");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, authLoading, toast]);

  // Fetch data
  const { data: orders = [], isLoading: ordersLoading } = useQuery<OrderWithItems[]>({
    queryKey: ['/api/admin/orders'],
    enabled: !!user,
  });

  const { data: pendingOrders = [], isLoading: pendingLoading } = useQuery<OrderWithItems[]>({
    queryKey: ['/api/admin/orders/pending'],
    enabled: !!user,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    enabled: !!user,
  });

  // Mutations
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      return apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders/pending'] });
      toast({
        title: "Status Updated",
        description: "Order status has been updated successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    },
  });

  const createOfflineOrderMutation = useMutation({
    mutationFn: async (orderData: { customerName: string; customerPhone: string; items: any[] }) => {
      return apiRequest("POST", "/api/admin/orders/offline", orderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders/pending'] });
      toast({
        title: "Order Created",
        description: "Offline order has been created successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create offline order.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case ORDER_STATUSES.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case ORDER_STATUSES.PREPARING:
        return "bg-blue-100 text-blue-800";
      case ORDER_STATUSES.READY:
        return "bg-green-100 text-green-800";
      case ORDER_STATUSES.COMPLETED:
        return "bg-gray-100 text-gray-800";
      case ORDER_STATUSES.CANCELLED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case ORDER_STATUSES.PENDING:
        return <Circle className="w-4 h-4" />;
      case ORDER_STATUSES.PREPARING:
        return <Clock className="w-4 h-4" />;
      case ORDER_STATUSES.READY:
        return <CheckCircle className="w-4 h-4" />;
      case ORDER_STATUSES.COMPLETED:
        return <CheckCircle className="w-4 h-4" />;
      case ORDER_STATUSES.CANCELLED:
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/')}
              className="mr-4"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
            <h1 className="text-lg font-bold" data-testid="text-admin-title">Admin Panel</h1>
          </div>
          <Button
            onClick={() => window.location.href = '/api/logout'}
            variant="outline"
            size="sm"
            data-testid="button-logout"
          >
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders" className="flex items-center space-x-2" data-testid="tab-orders">
              <List className="w-4 h-4" />
              <span>Orders</span>
            </TabsTrigger>
            <TabsTrigger value="queue" className="flex items-center space-x-2" data-testid="tab-queue">
              <Clock className="w-4 h-4" />
              <span>Queue</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center space-x-2" data-testid="tab-products">
              <Package className="w-4 h-4" />
              <span>Products</span>
            </TabsTrigger>
            <TabsTrigger value="offline-order" className="flex items-center space-x-2" data-testid="tab-offline-order">
              <Plus className="w-4 h-4" />
              <span>New Order</span>
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-20 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : (orders as OrderWithItems[]).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8" data-testid="text-no-orders">
                    No orders found.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {(orders as OrderWithItems[]).map((order: OrderWithItems) => (
                      <div key={order.id} className="border border-border rounded-lg p-4" data-testid={`order-${order.id}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold" data-testid={`text-order-number-${order.id}`}>
                              {order.orderNumber}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.customerName || 'Guest'} • {order.orderItems.length} items
                              {order.isOffline && <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">Offline</span>}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">{order.status}</span>
                            </Badge>
                            <Select
                              value={order.status}
                              onValueChange={(newStatus) =>
                                updateOrderStatusMutation.mutate({ orderId: order.id, status: newStatus })
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={ORDER_STATUSES.PENDING}>Pending</SelectItem>
                                <SelectItem value={ORDER_STATUSES.PREPARING}>Preparing</SelectItem>
                                <SelectItem value={ORDER_STATUSES.READY}>Ready</SelectItem>
                                <SelectItem value={ORDER_STATUSES.COMPLETED}>Completed</SelectItem>
                                <SelectItem value={ORDER_STATUSES.CANCELLED}>Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {order.orderItems.map((item: any) => item.product.name).join(', ')}
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-primary">${order.total}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt || new Date()).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Queue Tab */}
          <TabsContent value="queue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Queue</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingLoading ? (
                  <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="h-24 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : pendingOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8" data-testid="text-no-pending-orders">
                    No pending orders in queue.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pendingOrders.map((order) => (
                      <div key={order.id} className="border border-border border-l-4 border-l-primary rounded-lg p-4" data-testid={`pending-order-${order.id}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">{order.orderNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleTimeString()} - {order.customerName || 'Guest'}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() =>
                              updateOrderStatusMutation.mutate({ orderId: order.id, status: ORDER_STATUSES.READY })
                            }
                            disabled={updateOrderStatusMutation.isPending}
                            data-testid={`button-mark-ready-${order.id}`}
                          >
                            Mark Ready
                          </Button>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {order.orderItems.map((item) => `${item.product.name} x${item.quantity}`).join(', ')}
                        </div>
                        <p className="font-semibold text-primary">${order.total}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Product Management
                  <Button size="sm" data-testid="button-add-product">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8" data-testid="text-no-products">
                    No products found.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {products.map((product) => (
                      <div key={product.id} className="flex justify-between items-center border border-border rounded-lg p-4" data-testid={`product-${product.id}`}>
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">{product.category}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="font-semibold text-primary">${product.price}</span>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" data-testid={`button-edit-${product.id}`}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" data-testid={`button-delete-${product.id}`}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Offline Order Tab */}
          <TabsContent value="offline-order" className="space-y-4">
            <OfflineOrderForm
              products={products}
              onSubmit={(orderData) => createOfflineOrderMutation.mutate(orderData)}
              isSubmitting={createOfflineOrderMutation.isPending}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface OfflineOrderFormProps {
  products: Product[];
  onSubmit: (orderData: { customerName: string; customerPhone: string; items: any[] }) => void;
  isSubmitting: boolean;
}

function OfflineOrderForm({ products, onSubmit, isSubmitting }: OfflineOrderFormProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const items = Object.entries(selectedItems)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        return {
          productId,
          quantity,
          price: parseFloat(product?.price || "0"),
        };
      });

    if (items.length === 0) {
      return;
    }

    onSubmit({
      customerName,
      customerPhone,
      items,
    });

    // Reset form
    setCustomerName("");
    setCustomerPhone("");
    setSelectedItems({});
  };

  const total = Object.entries(selectedItems).reduce((sum, [productId, quantity]) => {
    const product = products.find(p => p.id === productId);
    return sum + (parseFloat(product?.price || "0") * quantity);
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Offline Order</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              data-testid="input-offline-customer-name"
            />
          </div>
          
          <div>
            <Label htmlFor="customerPhone">Phone Number (Optional)</Label>
            <Input
              id="customerPhone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              data-testid="input-offline-customer-phone"
            />
          </div>

          <div>
            <Label>Select Items</Label>
            <div className="border border-border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <span className="text-sm">{product.name} - ${product.price}</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setSelectedItems(prev => ({
                          ...prev,
                          [product.id]: Math.max(0, (prev[product.id] || 0) - 1)
                        }))
                      }
                      data-testid={`button-decrease-${product.id}`}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center" data-testid={`text-quantity-${product.id}`}>
                      {selectedItems[product.id] || 0}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setSelectedItems(prev => ({
                          ...prev,
                          [product.id]: (prev[product.id] || 0) + 1
                        }))
                      }
                      data-testid={`button-increase-${product.id}`}
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {total > 0 && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center font-semibold">
                <span>Total:</span>
                <span className="text-primary" data-testid="text-offline-order-total">${total.toFixed(2)}</span>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || total === 0}
            data-testid="button-create-offline-order"
          >
            {isSubmitting ? "Creating Order..." : "Create Order"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
