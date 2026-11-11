export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  rating?: number | null;
  reviewsCount?: number | null;
  description: string;
  image: string;
  badge?: string | null;
  createdAt?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  img: string;
  meta?: string;
}

export interface Order {
  id: string;
  userEmail?: string | null;
  userUid?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMethod: string;
  address: string;
  deliveryTimeSlot?: string;
  orderNotes?: string;
  deliveryNotes?: string;
  giftMessage?: string;
  paymentMethod: string;
  paymentReference?: string | null;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: string;
  trackingStep?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface RealtimeOrderAlert {
  id: string;
  order: Order;
  type: 'out_for_delivery' | 'completed';
  previousStatus: string;
  newStatus: string;
  timestamp: number;
}

export interface Review {
  id: number;
  productId?: string;
  productName?: string;
  name: string;
  rating: number;
  text: string;
  createdAt?: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  status?: string;
  createdAt?: string;
}

export interface UserProfile {
  id: string | number;
  uid: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  address?: string | null;
  createdAt?: string;
}
