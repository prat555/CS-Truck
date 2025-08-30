// Local storage fallback for when Firestore is not available
import type { Order, OrderItem, UserProfile } from './orders';

const STORAGE_KEYS = {
  USER_PROFILES: 'cs-truck-user-profiles',
  ORDERS: 'cs-truck-orders',
  ORDER_COUNTER: 'cs-truck-order-counter'
};

// Local storage user profile operations
export const getLocalUserProfile = (userId: string): UserProfile | null => {
  try {
    const profiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_PROFILES) || '{}');
    return profiles[userId] || null;
  } catch {
    return null;
  }
};

export const setLocalUserProfile = (profile: UserProfile): void => {
  try {
    const profiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_PROFILES) || '{}');
    profiles[profile.userId] = profile;
    localStorage.setItem(STORAGE_KEYS.USER_PROFILES, JSON.stringify(profiles));
  } catch (error) {
    console.warn('Failed to save user profile locally:', error);
  }
};

export const createLocalUserProfile = (userId: string, email: string, name: string): UserProfile => {
  const profile: UserProfile = {
    id: 'local-' + userId,
    userId,
    email,
    name,
    points: 0,
    totalOrders: 0,
    totalSpent: 0,
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
  };
  
  setLocalUserProfile(profile);
  return profile;
};

// Local storage order operations
export const getLocalUserOrders = (userId: string): Order[] => {
  try {
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    return orders.filter((order: Order) => order.userId === userId);
  } catch {
    return [];
  }
};

export const saveLocalOrder = (order: Order): string => {
  try {
    // Generate order ID
    const counter = parseInt(localStorage.getItem(STORAGE_KEYS.ORDER_COUNTER) || '0') + 1;
    localStorage.setItem(STORAGE_KEYS.ORDER_COUNTER, counter.toString());
    
    const orderId = `local-${Date.now()}-${counter}`;
    const orderWithId = { ...order, id: orderId };
    
    // Save order
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    orders.push(orderWithId);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    
    // Update user profile
    const profile = getLocalUserProfile(order.userId);
    if (profile) {
      const pointsEarned = Math.floor(order.total / 10);
      const updatedProfile = {
        ...profile,
        points: profile.points + pointsEarned - (order.rewards?.pointsUsed || 0),
        totalOrders: profile.totalOrders + 1,
        totalSpent: profile.totalSpent + order.total,
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
      };
      setLocalUserProfile(updatedProfile);
    }
    
    return orderId;
  } catch (error) {
    console.error('Failed to save order locally:', error);
    throw new Error('Failed to save order');
  }
};

export const applyLocalPointsDiscount = (userId: string, pointsToUse: number): number => {
  try {
    const profile = getLocalUserProfile(userId);
    if (!profile) return 0;
    
    const actualPointsUsed = Math.min(pointsToUse, profile.points);
    const discount = Math.floor(actualPointsUsed / 10); // 10 points = ₹1
    
    // Update profile with used points
    const updatedProfile = {
      ...profile,
      points: profile.points - actualPointsUsed,
      updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    };
    setLocalUserProfile(updatedProfile);
    
    return discount;
  } catch (error) {
    console.error('Failed to apply points discount locally:', error);
    return 0;
  }
};
