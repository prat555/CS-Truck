import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { 
  createOrder, 
  getUserOrders, 
  getOrCreateUserProfile,
  applyPointsDiscount,
  type Order, 
  type OrderItem, 
  type UserProfile 
} from '@/lib/orders';
import { sendOrderConfirmationEmailMock } from '@/lib/emailService';
import { useToast } from './use-toast';

export const useOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  // Load user profile and orders
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load user profile
      const profile = await getOrCreateUserProfile(
        user.uid, 
        user.email || '', 
        user.displayName || user.email || 'User'
      );
      setUserProfile(profile);

      // Load orders
      const userOrders = await getUserOrders(user.uid);
      setOrders(userOrders);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading user data:', error);
      }
      toast({
        title: "Error",
        description: "Failed to load your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async (
    items: OrderItem[], 
    total: number, 
    pointsToUse: number = 0
  ): Promise<string | null> => {
    if (!user || !userProfile) {
      toast({
        title: "Error",
        description: "Please log in to place an order.",
        variant: "destructive",
      });
      return null;
    }

    setOrderLoading(true);
    try {
      let finalTotal = total;
      let pointsUsed = 0;

      // Apply points discount if requested
      if (pointsToUse > 0) {
        const discount = await applyPointsDiscount(user.uid, pointsToUse);
        pointsUsed = discount;
        finalTotal = total - discount;
      }

      // Create order
      const orderId = await createOrder({
        userId: user.uid,
        userEmail: user.email || '',
        userName: user.displayName || user.email || 'User',
        items,
        total: finalTotal,
        rewards: {
          pointsEarned: Math.floor(finalTotal / 10),
          pointsUsed
        }
      });

      // Send order confirmation email
      await sendOrderConfirmationEmailMock({
        orderId: orderId,
        customerName: user.displayName || user.email || 'Customer',
        customerEmail: user.email || '',
        items,
        total: finalTotal,
        pointsEarned: Math.floor(finalTotal / 10),
        pointsUsed
      });

      // Reload user data to get updated profile and orders
      await loadUserData();

      toast({
        title: "Order Placed Successfully!",
        description: `Your order ${orderId} has been placed. Check your email for confirmation.`,
      });

      return orderId;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error placing order:', error);
      }
      toast({
        title: "Order Failed",
        description: "Failed to place your order. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setOrderLoading(false);
    }
  };

  return {
    orders,
    userProfile,
    loading,
    orderLoading,
    placeOrder,
    refreshData: loadUserData
  };
};
