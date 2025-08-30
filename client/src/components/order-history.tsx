import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Clock, Package, CheckCircle, XCircle, Star, Gift } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Order } from '@/lib/orders';

const statusIcons = {
  pending: <Clock className="w-4 h-4" />,
  confirmed: <Package className="w-4 h-4" />,
  preparing: <Package className="w-4 h-4" />,
  ready: <CheckCircle className="w-4 h-4" />,
  completed: <CheckCircle className="w-4 h-4" />,
  cancelled: <XCircle className="w-4 h-4" />,
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

interface OrderHistoryProps {
  open: boolean;
  onClose: () => void;
}

export default function OrderHistory({ open, onClose }: OrderHistoryProps) {
  const { user } = useAuth();
  const { orders, userProfile, loading } = useOrders();

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{order.orderId}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <Badge className={`${statusColors[order.status]} border-0`}>
            {statusIcons[order.status]}
            <span className="ml-1 capitalize">{order.status}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span>{item.name} × {item.quantity}</span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        
        <Separator />
        
        <div className="flex justify-between items-center font-medium">
          <span>Total</span>
          <span>₹{order.total.toFixed(2)}</span>
        </div>
        
        {order.rewards && (
          <div className="flex items-center justify-between text-sm text-green-600">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              <span>Points Earned: {order.rewards.pointsEarned}</span>
            </div>
            {order.rewards.pointsUsed > 0 && (
              <div className="flex items-center gap-1">
                <Gift className="w-4 h-4" />
                <span>Points Used: {order.rewards.pointsUsed}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order History</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Please log in to view your order history.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order History
          </DialogTitle>
        </DialogHeader>
        
        {userProfile && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{userProfile.points}</p>
                  <p className="text-sm text-muted-foreground">Points</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{userProfile.totalOrders}</p>
                  <p className="text-sm text-muted-foreground">Orders</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">₹{userProfile.totalSpent.toFixed(0)}</p>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="mt-2 text-muted-foreground">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No orders yet</p>
              <p className="text-sm text-muted-foreground">Place your first order to see it here!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
