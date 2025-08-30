import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from "firebase/firestore";
import { db } from "./firebase";
import { 
  getLocalUserProfile, 
  createLocalUserProfile, 
  getLocalUserOrders, 
  saveLocalOrder,
  applyLocalPointsDiscount 
} from "./localStorage";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  orderId: string; // Unique readable order ID like CS-001, CS-002
  rewards?: {
    pointsEarned: number;
    pointsUsed: number;
  };
}

export interface UserProfile {
  id?: string;
  userId: string;
  email: string;
  name: string;
  points: number;
  totalOrders: number;
  totalSpent: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Generate unique order ID
export const generateOrderId = async (): Promise<string> => {
  const ordersRef = collection(db, 'orders');
  const snapshot = await getDocs(ordersRef);
  const orderCount = snapshot.size + 1;
  return `CS-${orderCount.toString().padStart(3, '0')}`;
};

// Create new order
export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'orderId' | 'status'>): Promise<string> => {
  try {
    const orderId = await generateOrderId();
    const order: Omit<Order, 'id'> = {
      ...orderData,
      orderId,
      status: 'pending',
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(collection(db, 'orders'), order);
    
    // Update user profile with order stats and rewards
    await updateUserProfileAfterOrder(orderData.userId, orderData.total);
    
    return orderId;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Firestore failed, using local storage:', error);
    }
    
    // Fallback to local storage
    const order: Omit<Order, 'id'> = {
      ...orderData,
      orderId: `CS-LOCAL-${Date.now()}`,
      status: 'pending',
      createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
      updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
    };
    
    return saveLocalOrder(order as Order);
  }
};

// Get user orders
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef, 
      where('userId', '==', userId), 
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Firestore failed, using local storage:', error);
    }
    
    // Fallback to local storage
    return getLocalUserOrders(userId);
  }
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<void> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Get or create user profile
export const getOrCreateUserProfile = async (userId: string, email: string, name: string): Promise<UserProfile> => {
  try {
    // Try Firestore first
    const profilesRef = collection(db, 'userProfiles');
    const q = query(profilesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as UserProfile;
    }
    
    // Create new profile in Firestore
    const profile: Omit<UserProfile, 'id'> = {
      userId,
      email,
      name,
      points: 0,
      totalOrders: 0,
      totalSpent: 0,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };
    
    const docRef = await addDoc(collection(db, 'userProfiles'), profile);
    return { id: docRef.id, ...profile } as UserProfile;
    
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Firestore failed, using local storage:', error);
    }
    
    // Fallback to local storage
    const existingProfile = getLocalUserProfile(userId);
    if (existingProfile) {
      return existingProfile;
    }
    
    // Create new local profile
    return createLocalUserProfile(userId, email, name);
  }
};

// Update user profile after order
const updateUserProfileAfterOrder = async (userId: string, orderTotal: number): Promise<void> => {
  try {
    const profilesRef = collection(db, 'userProfiles');
    const q = query(profilesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const profileDoc = snapshot.docs[0];
      const currentProfile = profileDoc.data() as UserProfile;
      
      // Calculate rewards: 1 point per ₹10 spent
      const pointsEarned = Math.floor(orderTotal / 10);
      
      await updateDoc(profileDoc.ref, {
        points: currentProfile.points + pointsEarned,
        totalOrders: currentProfile.totalOrders + 1,
        totalSpent: currentProfile.totalSpent + orderTotal,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating user profile:', error);
    }
    throw error;
  }
};

// Apply points discount
export const applyPointsDiscount = async (userId: string, pointsToUse: number): Promise<number> => {
  try {
    // Try Firestore first
    const profilesRef = collection(db, 'userProfiles');
    const q = query(profilesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const profileDoc = snapshot.docs[0];
      const currentProfile = profileDoc.data() as UserProfile;
      
      if (currentProfile.points >= pointsToUse) {
        await updateDoc(profileDoc.ref, {
          points: currentProfile.points - pointsToUse,
          updatedAt: serverTimestamp()
        });
        
        // 1 point = ₹1 discount
        return pointsToUse;
      }
    }
    
    return 0;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Firestore failed, using local storage for points:', error);
    }
    
    // Fallback to local storage
    return applyLocalPointsDiscount(userId, pointsToUse);
  }
};
