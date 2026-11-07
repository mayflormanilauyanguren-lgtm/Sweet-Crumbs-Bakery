import { getSupabase, isSupabaseConfigured } from './supabase.ts';
import { Product, Order, Review, ContactMessage } from '../types.ts';

// Initial fallback product dataset
const DEFAULT_PRODUCTS: Product[] = [
  { id: 'coffee-1', name: 'Espresso', category: 'Coffee', price: 120, rating: 5, reviewsCount: 12, description: 'Freshly prepared espresso made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&q=80', badge: 'bestseller' },
  { id: 'coffee-2', name: 'Americano', category: 'Coffee', price: 130, rating: 5, reviewsCount: 8, description: 'Freshly prepared americano made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&q=80' },
  { id: 'coffee-3', name: 'Cappuccino', category: 'Coffee', price: 140, rating: 5, reviewsCount: 15, description: 'Freshly prepared cappuccino made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&q=80' },
  { id: 'coffee-4', name: 'Café Latte', category: 'Coffee', price: 150, rating: 5, reviewsCount: 20, description: 'Freshly prepared café latte made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&q=80' },
  { id: 'coffee-5', name: 'Mocha', category: 'Coffee', price: 120, rating: 5, reviewsCount: 9, description: 'Freshly prepared mocha made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&q=80' },
  { id: 'iced-coffee-1', name: 'Iced Americano', category: 'Iced Coffee', price: 140, rating: 5, reviewsCount: 14, description: 'Freshly prepared iced americano made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80' },
  { id: 'iced-coffee-2', name: 'Iced Latte', category: 'Iced Coffee', price: 150, rating: 5, reviewsCount: 18, description: 'Freshly prepared iced latte made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80' },
  { id: 'iced-coffee-3', name: 'Iced Mocha', category: 'Iced Coffee', price: 160, rating: 5, reviewsCount: 11, description: 'Freshly prepared iced mocha made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80' },
  { id: 'tea-1', name: 'Green Tea', category: 'Tea', price: 90, rating: 4, reviewsCount: 7, description: 'Freshly prepared green tea made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=500&q=80' },
  { id: 'tea-2', name: 'Black Tea', category: 'Tea', price: 100, rating: 4, reviewsCount: 6, description: 'Freshly prepared black tea made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=500&q=80' },
  { id: 'chocolate-creamy-1', name: 'Classic Hot Chocolate', category: 'Hot Chocolate', price: 130, rating: 5, reviewsCount: 23, description: 'Freshly prepared classic hot chocolate made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=500&q=80' },
  { id: 'classic-cake-1', name: 'Chocolate Dream Cake', category: 'Classic Cakes', price: 999, rating: 5, reviewsCount: 42, description: 'Freshly prepared chocolate dream cake made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80' },
  { id: 'classic-cake-2', name: 'Strawberry Bliss Cake', category: 'Classic Cakes', price: 1200, rating: 5, reviewsCount: 38, description: 'Freshly prepared strawberry bliss cake made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80', badge: 'bestseller' },
  { id: 'classic-cake-3', name: 'Vanilla Velvet Cake', category: 'Classic Cakes', price: 890, rating: 5, reviewsCount: 19, description: 'Freshly prepared vanilla velvet cake made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80' },
  { id: 'classic-cake-4', name: 'Red Velvet Romance', category: 'Classic Cakes', price: 900, rating: 5, reviewsCount: 31, description: 'Freshly prepared red velvet romance made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80' },
  { id: 'classic-cake-5', name: 'Ube Cream Cake', category: 'Classic Cakes', price: 999, rating: 5, reviewsCount: 54, description: 'Freshly prepared ube cream cake made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80' },
  { id: 'classic-cake-6', name: 'Mango Paradise Cake', category: 'Classic Cakes', price: 1200, rating: 5, reviewsCount: 27, description: 'Freshly prepared mango paradise cake made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80' },
  { id: 'classic-cake-7', name: 'Banana Caramel Cake', category: 'Classic Cakes', price: 670, rating: 4, reviewsCount: 16, description: 'Freshly prepared banana caramel cake made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80' },
  { id: 'classic-cake-8', name: 'Carrot Delight Cake', category: 'Classic Cakes', price: 680, rating: 5, reviewsCount: 14, description: 'Freshly prepared carrot delight cake made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80' },
  { id: 'specialty-cake-1', name: 'Chocolate Fudge Cake', category: 'Specialty Cakes', price: 700, rating: 5, reviewsCount: 29, description: 'Freshly prepared chocolate fudge cake made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=500&q=80' },
  { id: 'specialty-cake-2', name: 'Cookies & Cream Cake', category: 'Specialty Cakes', price: 710, rating: 5, reviewsCount: 22, description: 'Freshly prepared cookies & cream cake made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=500&q=80' },
  { id: 'specialty-cake-3', name: 'Strawberry Shortcake', category: 'Specialty Cakes', price: 720, rating: 5, reviewsCount: 35, description: 'Freshly prepared strawberry shortcake made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=500&q=80' },
  { id: 'specialty-cake-4', name: 'Black Forest Cake', category: 'Specialty Cakes', price: 730, rating: 5, reviewsCount: 41, description: 'Freshly prepared black forest cake made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=500&q=80', badge: 'featured' },
  { id: 'specialty-cake-5', name: 'Cheesecake', category: 'Specialty Cakes', price: 700, rating: 5, reviewsCount: 33, description: 'Freshly prepared cheesecake made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=500&q=80' },
  { id: 'specialty-cake-6', name: 'Mango Cheesecake', category: 'Specialty Cakes', price: 710, rating: 5, reviewsCount: 28, description: 'Freshly prepared mango cheesecake made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=500&q=80' },
  { id: 'specialty-cake-7', name: 'Matcha Cream Cake', category: 'Specialty Cakes', price: 720, rating: 5, reviewsCount: 17, description: 'Freshly prepared matcha cream cake made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=500&q=80' },
  { id: 'specialty-cake-8', name: 'Birthday Celebration Cake', category: 'Specialty Cakes', price: 730, rating: 5, reviewsCount: 45, description: 'Freshly prepared birthday celebration cake made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=500&q=80' },
  { id: 'classic-doughnut-1', name: 'Glazed Delight', category: 'Classic Doughnuts', price: 50, rating: 5, reviewsCount: 30, description: 'Freshly prepared glazed delight made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=500&q=80' },
  { id: 'classic-doughnut-2', name: 'Choco Dip', category: 'Classic Doughnuts', price: 60, rating: 5, reviewsCount: 26, description: 'Freshly prepared choco dip made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=500&q=80' },
  { id: 'classic-doughnut-3', name: 'Strawberry Sprinkle', category: 'Classic Doughnuts', price: 70, rating: 5, reviewsCount: 39, description: 'Freshly prepared strawberry sprinkle made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=500&q=80', badge: 'bestseller' },
  { id: 'classic-doughnut-4', name: 'Honey Glaze', category: 'Classic Doughnuts', price: 80, rating: 5, reviewsCount: 19, description: 'Freshly prepared honey glaze made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=500&q=80' },
  { id: 'classic-doughnut-5', name: 'Sugar Kiss', category: 'Classic Doughnuts', price: 50, rating: 4, reviewsCount: 15, description: 'Freshly prepared sugar kiss made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=500&q=80' },
  { id: 'classic-doughnut-6', name: 'Double Chocolate', category: 'Classic Doughnuts', price: 60, rating: 5, reviewsCount: 32, description: 'Freshly prepared double chocolate made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=500&q=80' },
  { id: 'classic-doughnut-7', name: 'Strawberry Cream', category: 'Classic Doughnuts', price: 70, rating: 5, reviewsCount: 24, description: 'Freshly prepared strawberry cream made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=500&q=80' },
  { id: 'specialty-doughnut-1', name: 'Cookies & Cream', category: 'Specialty Doughnuts', price: 65, rating: 5, reviewsCount: 28, description: 'Freshly prepared cookies & cream made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=500&q=80' },
  { id: 'specialty-doughnut-2', name: 'Choco Hazelnut', category: 'Specialty Doughnuts', price: 75, rating: 5, reviewsCount: 34, description: 'Freshly prepared choco hazelnut made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=500&q=80', badge: 'featured' },
  { id: 'specialty-doughnut-3', name: 'Ube Dream Doughnut', category: 'Specialty Doughnuts', price: 85, rating: 5, reviewsCount: 47, description: 'Freshly prepared ube dream doughnut made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=500&q=80' },
  { id: 'specialty-doughnut-4', name: 'Matcha Bliss', category: 'Specialty Doughnuts', price: 95, rating: 5, reviewsCount: 18, description: 'Freshly prepared matcha bliss made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=500&q=80' },
  { id: 'specialty-doughnut-5', name: 'Peanut Butter Crunch', category: 'Specialty Doughnuts', price: 65, rating: 5, reviewsCount: 21, description: 'Freshly prepared peanut butter crunch made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=500&q=80' },
  { id: 'specialty-doughnut-6', name: 'Strawberry Cheesecake', category: 'Specialty Doughnuts', price: 75, rating: 5, reviewsCount: 29, description: 'Freshly prepared strawberry cheesecake made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=500&q=80' },
  { id: 'specialty-doughnut-7', name: 'S\'mores Doughnut', category: 'Specialty Doughnuts', price: 85, rating: 5, reviewsCount: 33, description: 'Freshly prepared s\'mores doughnut made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=500&q=80' },
  { id: 'specialty-doughnut-8', name: 'Caramel Crunch', category: 'Specialty Doughnuts', price: 95, rating: 5, reviewsCount: 26, description: 'Freshly prepared caramel crunch made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=500&q=80' },
  { id: 'cupcake-1', name: 'Chocolate Cupcake', category: 'Cupcakes', price: 55, rating: 5, reviewsCount: 37, description: 'Freshly prepared chocolate cupcake made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=500&q=80' },
  { id: 'cupcake-2', name: 'Vanilla Cupcake', category: 'Cupcakes', price: 65, rating: 5, reviewsCount: 25, description: 'Freshly prepared vanilla cupcake made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=500&q=80' },
  { id: 'cupcake-3', name: 'Strawberry Cupcake', category: 'Cupcakes', price: 75, rating: 5, reviewsCount: 31, description: 'Freshly prepared strawberry cupcake made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=500&q=80' },
  { id: 'cupcake-4', name: 'Ube Cupcake', category: 'Cupcakes', price: 85, rating: 5, reviewsCount: 48, description: 'Freshly prepared ube cupcake made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=500&q=80' },
  { id: 'cookie-1', name: 'Chocolate Chip Cookies', category: 'Cookies', price: 110, rating: 5, reviewsCount: 62, description: 'Freshly prepared chocolate chip cookies made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=500&q=80', badge: 'bestseller' },
  { id: 'cookie-2', name: 'Double Chocolate Cookies', category: 'Cookies', price: 120, rating: 5, reviewsCount: 44, description: 'Freshly prepared double chocolate cookies made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=500&q=80' },
  { id: 'cookie-3', name: 'Oatmeal Cookies', category: 'Cookies', price: 130, rating: 5, reviewsCount: 29, description: 'Freshly prepared oatmeal cookies made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=500&q=80', badge: 'featured' },
  { id: 'bread-1', name: 'Croissant', category: 'Bread & Pastries', price: 70, rating: 5, reviewsCount: 38, description: 'Freshly prepared croissant made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=80' },
  { id: 'bread-2', name: 'Cinnamon Roll', category: 'Bread & Pastries', price: 80, rating: 5, reviewsCount: 52, description: 'Freshly prepared cinnamon roll made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=80' },
  { id: 'bread-3', name: 'Donut', category: 'Bread & Pastries', price: 90, rating: 5, reviewsCount: 23, description: 'Freshly prepared donut made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=500&q=80' },
  { id: 'bread-4', name: 'Ensaymada', category: 'Bread & Pastries', price: 100, rating: 5, reviewsCount: 46, description: 'Freshly prepared ensaymada made for Sweet Crumbs Bakery.', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=80' }
];

const LOCAL_PRODUCTS_KEY = 'sc_supabase_products';
const LOCAL_ORDERS_KEY = 'sc_supabase_orders';
const LOCAL_REVIEWS_KEY = 'sc_supabase_reviews';
const LOCAL_MESSAGES_KEY = 'sc_supabase_messages';

function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

// ---------------- PRODUCTS ----------------

export async function fetchProducts(): Promise<Product[]> {
  const supabase = getSupabase();
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('category', { ascending: true });

      if (!error && data && data.length > 0) {
        setLocal(LOCAL_PRODUCTS_KEY, data);
        return data as Product[];
      }
    } catch (e) {
      console.warn('Supabase products query fallback to local cache:', e);
    }
  }

  // Fallback to local storage or defaults
  const stored = getLocal<Product[]>(LOCAL_PRODUCTS_KEY, DEFAULT_PRODUCTS);
  if (!localStorage.getItem(LOCAL_PRODUCTS_KEY)) {
    setLocal(LOCAL_PRODUCTS_KEY, DEFAULT_PRODUCTS);
  }
  return stored;
}

export async function saveProduct(product: Product): Promise<Product> {
  const supabase = getSupabase();
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .upsert({
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          rating: product.rating || 5,
          reviews_count: product.reviewsCount || 0,
          description: product.description,
          image: product.image,
          badge: product.badge || null,
        })
        .select();

      if (!error && data && data[0]) {
        return data[0] as Product;
      }
    } catch (e) {
      console.warn('Supabase upsert failed, updating local cache:', e);
    }
  }

  const list = getLocal<Product[]>(LOCAL_PRODUCTS_KEY, DEFAULT_PRODUCTS);
  const idx = list.findIndex((p) => p.id === product.id);
  if (idx > -1) {
    list[idx] = product;
  } else {
    list.unshift(product);
  }
  setLocal(LOCAL_PRODUCTS_KEY, list);
  return product;
}

export async function deleteProduct(productId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('products').delete().eq('id', productId);
    } catch {}
  }

  const list = getLocal<Product[]>(LOCAL_PRODUCTS_KEY, DEFAULT_PRODUCTS);
  const filtered = list.filter((p) => p.id !== productId);
  setLocal(LOCAL_PRODUCTS_KEY, filtered);
  return true;
}

// ---------------- ORDERS ----------------

export async function fetchAllOrders(): Promise<Order[]> {
  const supabase = getSupabase();
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped = data.map((d: any) => ({
          id: d.id,
          customerName: d.customer_name,
          customerEmail: d.customer_email,
          customerPhone: d.customer_phone,
          deliveryMethod: d.delivery_method,
          address: d.address,
          paymentMethod: d.payment_method,
          paymentReference: d.payment_reference,
          items: d.items,
          subtotal: d.subtotal,
          deliveryFee: d.delivery_fee,
          discount: d.discount,
          total: d.total,
          status: d.status,
          createdAt: d.created_at,
          userEmail: d.user_email,
        }));
        setLocal(LOCAL_ORDERS_KEY, mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Supabase orders query error:', e);
    }
  }

  return getLocal<Order[]>(LOCAL_ORDERS_KEY, []);
}

export async function fetchUserOrders(userEmail: string): Promise<Order[]> {
  const all = await fetchAllOrders();
  if (!userEmail) return [];
  return all.filter((o) => o.customerEmail.toLowerCase() === userEmail.toLowerCase() || o.userEmail?.toLowerCase() === userEmail.toLowerCase());
}

export async function createNewOrder(order: Order): Promise<Order> {
  const supabase = getSupabase();
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          id: order.id,
          user_email: order.userEmail || null,
          customer_name: order.customerName,
          customer_email: order.customerEmail,
          customer_phone: order.customerPhone,
          delivery_method: order.deliveryMethod,
          address: order.address,
          payment_method: order.paymentMethod,
          payment_reference: order.paymentReference || null,
          items: order.items,
          subtotal: order.subtotal,
          delivery_fee: order.deliveryFee,
          discount: order.discount,
          total: order.total,
          status: order.status || 'Order Confirmed',
        })
        .select();

      if (!error && data && data[0]) {
        console.log('Order successfully synced to Supabase:', data[0].id);
      }
    } catch (e) {
      console.warn('Supabase order insert fallback:', e);
    }
  }

  const existing = getLocal<Order[]>(LOCAL_ORDERS_KEY, []);
  existing.unshift(order);
  setLocal(LOCAL_ORDERS_KEY, existing);
  return order;
}

export async function updateOrderStatus(orderId: string, status: string): Promise<boolean> {
  const supabase = getSupabase();
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('orders').update({ status }).eq('id', orderId);
    } catch {}
  }

  const existing = getLocal<Order[]>(LOCAL_ORDERS_KEY, []);
  const idx = existing.findIndex((o) => o.id === orderId);
  if (idx > -1) {
    existing[idx].status = status;
    setLocal(LOCAL_ORDERS_KEY, existing);
  }
  return true;
}

export async function deleteOrder(orderId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('orders').delete().eq('id', orderId);
    } catch {}
  }

  const existing = getLocal<Order[]>(LOCAL_ORDERS_KEY, []);
  const filtered = existing.filter((o) => o.id !== orderId);
  setLocal(LOCAL_ORDERS_KEY, filtered);
  return true;
}

// ---------------- REVIEWS ----------------

export async function fetchReviews(): Promise<Review[]> {
  const defaultReviews: Review[] = [
    { id: 1, name: 'Maria S.', rating: 5, text: 'Absolutely delicious! The chocolate cake was amazing.', createdAt: new Date().toISOString() },
    { id: 2, name: 'Jonas R.', rating: 5, text: 'Beautiful cake and fast delivery in Davao City!', createdAt: new Date().toISOString() },
    { id: 3, name: 'Angela P.', rating: 5, text: 'My family loved the cupcakes! Will definitely order again.', createdAt: new Date().toISOString() },
  ];

  const supabase = getSupabase();
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setLocal(LOCAL_REVIEWS_KEY, data);
        return data as Review[];
      }
    } catch {}
  }

  const stored = getLocal<Review[]>(LOCAL_REVIEWS_KEY, defaultReviews);
  if (!localStorage.getItem(LOCAL_REVIEWS_KEY)) {
    setLocal(LOCAL_REVIEWS_KEY, defaultReviews);
  }
  return stored;
}

export async function createReview(
  name: string,
  rating: number,
  text: string,
  productId?: string,
  productName?: string
): Promise<Review> {
  const newRev: Review = {
    id: Date.now(),
    name,
    rating,
    text,
    productId,
    productName,
    createdAt: new Date().toISOString(),
  };

  const supabase = getSupabase();
  if (isSupabaseConfigured()) {
    try {
      const payload: Record<string, any> = { name, rating, text };
      if (productId) payload.product_id = productId;
      const { data, error } = await supabase
        .from('reviews')
        .insert(payload)
        .select();

      if (!error && data && data[0]) {
        newRev.id = data[0].id;
      }
    } catch {}
  }

  const list = getLocal<Review[]>(LOCAL_REVIEWS_KEY, []);
  list.unshift(newRev);
  setLocal(LOCAL_REVIEWS_KEY, list);
  return newRev;
}

export async function deleteReview(id: number): Promise<boolean> {
  const supabase = getSupabase();
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('reviews').delete().eq('id', id);
    } catch {}
  }

  const list = getLocal<Review[]>(LOCAL_REVIEWS_KEY, []);
  const filtered = list.filter((r) => r.id !== id);
  setLocal(LOCAL_REVIEWS_KEY, filtered);
  return true;
}

// ---------------- CONTACT MESSAGES ----------------

export async function fetchContactMessages(): Promise<ContactMessage[]> {
  const supabase = getSupabase();
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLocal(LOCAL_MESSAGES_KEY, data);
        return data as ContactMessage[];
      }
    } catch {}
  }

  return getLocal<ContactMessage[]>(LOCAL_MESSAGES_KEY, []);
}

export async function createContactMessage(name: string, email: string, message: string): Promise<ContactMessage> {
  const newMsg: ContactMessage = {
    id: Date.now(),
    name,
    email,
    message,
    status: 'Unread',
    createdAt: new Date().toISOString(),
  };

  const supabase = getSupabase();
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .insert({ name, email, message, status: 'Unread' })
        .select();

      if (!error && data && data[0]) {
        newMsg.id = data[0].id;
      }
    } catch {}
  }

  const list = getLocal<ContactMessage[]>(LOCAL_MESSAGES_KEY, []);
  list.unshift(newMsg);
  setLocal(LOCAL_MESSAGES_KEY, list);
  return newMsg;
}

export async function updateMessageStatus(id: number, status: string): Promise<boolean> {
  const supabase = getSupabase();
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('contact_messages').update({ status }).eq('id', id);
    } catch {}
  }

  const list = getLocal<ContactMessage[]>(LOCAL_MESSAGES_KEY, []);
  const idx = list.findIndex((m) => m.id === id);
  if (idx > -1) {
    list[idx].status = status;
    setLocal(LOCAL_MESSAGES_KEY, list);
  }
  return true;
}
