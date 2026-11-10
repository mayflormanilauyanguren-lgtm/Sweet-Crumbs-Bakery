import { getSupabase, isSupabaseConfigured } from './supabase.ts';
import { Product, Order, Review, ContactMessage, UserProfile } from '../types.ts';

// Initial fallback product dataset
export const DEFAULT_PRODUCTS: Product[] = [
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
const LOCAL_OVERRIDES_KEY = 'sc_product_overrides';
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

// Helper to determine tracking step number (1 to 5) from textual status
export function getTrackingStepFromStatus(status: string): number {
  const s = status.toLowerCase();
  if (s.includes('cancel')) return 0;
  if (s.includes('complete') || s.includes('delivered')) return 5;
  if (s.includes('delivery') || s.includes('pickup') || s.includes('dispatched') || s.includes('ready')) return 4;
  if (s.includes('quality') || s.includes('pack')) return 3;
  if (s.includes('prepar') || s.includes('baking') || s.includes('oven')) return 2;
  return 1; // Order Confirmed / Placed
}

// ---------------- PRODUCTS ----------------

export async function fetchProducts(): Promise<Product[]> {
  const overrides = getLocal<Record<string, Product>>(LOCAL_OVERRIDES_KEY, {});
  const supabase = getSupabase();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('category', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped: Product[] = data.map((d: any) => {
          const override = overrides[d.id];
          return {
            id: d.id,
            name: override?.name ?? d.name,
            category: override?.category ?? d.category,
            price: override?.price ?? Number(d.price),
            rating: d.rating ? Number(d.rating) : 5,
            reviewsCount: d.reviews_count != null ? Number(d.reviews_count) : (d.reviewsCount || 12),
            description: override?.description ?? d.description,
            image: override?.image ?? d.image,
            badge: override?.badge !== undefined ? override.badge : (d.badge || null),
            createdAt: d.created_at,
          };
        });

        // Also append any newly created custom products from overrides not yet in remote table
        Object.values(overrides).forEach((customProd) => {
          if (!mapped.some((m) => m.id === customProd.id)) {
            mapped.unshift(customProd);
          }
        });

        setLocal(LOCAL_PRODUCTS_KEY, mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Supabase products query fallback to local cache:', e);
    }
  }

  // Fallback to local storage or defaults with permanent overrides merged
  const stored = getLocal<Product[]>(LOCAL_PRODUCTS_KEY, DEFAULT_PRODUCTS);
  const merged = stored.map((p) => {
    const override = overrides[p.id];
    return override ? { ...p, ...override } : p;
  });

  // Also include any newly created products
  Object.values(overrides).forEach((customProd) => {
    if (!merged.some((m) => m.id === customProd.id)) {
      merged.unshift(customProd);
    }
  });

  setLocal(LOCAL_PRODUCTS_KEY, merged);
  return merged;
}

export async function saveProduct(product: Product): Promise<Product> {
  // 1. Save to permanent local overrides map so it NEVER vanishes across refreshes
  const overrides = getLocal<Record<string, Product>>(LOCAL_OVERRIDES_KEY, {});
  overrides[product.id] = {
    ...product,
    createdAt: product.createdAt || new Date().toISOString(),
  };
  setLocal(LOCAL_OVERRIDES_KEY, overrides);

  // 2. Persist to local products array
  const list = getLocal<Product[]>(LOCAL_PRODUCTS_KEY, DEFAULT_PRODUCTS);
  const idx = list.findIndex((p) => p.id === product.id);
  if (idx > -1) {
    list[idx] = product;
  } else {
    list.unshift(product);
  }
  setLocal(LOCAL_PRODUCTS_KEY, list);

  // 3. Upsert to Supabase database if configured
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
          updated_at: new Date().toISOString(),
        })
        .select();

      if (!error && data && data[0]) {
        console.log('Product saved and synced with Supabase:', product.id);
      }
    } catch (e) {
      console.warn('Supabase upsert fallback to local storage:', e);
    }
  }

  return product;
}

export const updateProduct = saveProduct;

export async function deleteProduct(productId: string): Promise<boolean> {
  const overrides = getLocal<Record<string, Product>>(LOCAL_OVERRIDES_KEY, {});
  delete overrides[productId];
  setLocal(LOCAL_OVERRIDES_KEY, overrides);

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

export async function syncOrderToSupabase(order: Order): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase credentials not configured' };
  }

  const trackingStep = order.trackingStep || getTrackingStepFromStatus(order.status || 'Order Confirmed');
  const now = new Date().toISOString();

  // Clean numbers to integers
  const subtotal = Math.round(Number(order.subtotal) || 0);
  const deliveryFee = Math.round(Number(order.deliveryFee) || 0);
  const discount = Math.round(Number(order.discount) || 0);
  const total = Math.round(Number(order.total) || Math.max(0, subtotal + deliveryFee - discount));

  // Sanitize items array of objects
  const sanitizedItems = (Array.isArray(order.items) ? order.items : []).map((it) => ({
    id: String(it.id),
    name: String(it.name),
    price: Number(it.price) || 0,
    qty: Number(it.qty) || 1,
    img: String(it.img || ''),
    meta: it.meta ? String(it.meta) : undefined,
  }));

  const payload: any = {
    id: String(order.id),
    user_email: (order.userEmail || order.customerEmail || '').trim() || null,
    customer_name: (order.customerName || 'Customer').trim(),
    customer_email: (order.customerEmail || '').trim(),
    customer_phone: (order.customerPhone || '').trim(),
    delivery_method: order.deliveryMethod || 'delivery',
    address: (order.address || '').trim(),
    delivery_time_slot: order.deliveryTimeSlot ? String(order.deliveryTimeSlot).trim() : null,
    order_notes: order.orderNotes ? String(order.orderNotes).trim() : null,
    gift_message: order.giftMessage ? String(order.giftMessage).trim() : null,
    payment_method: order.paymentMethod || 'gcash',
    payment_reference: order.paymentReference ? String(order.paymentReference).trim() : null,
    items: sanitizedItems,
    subtotal,
    delivery_fee: deliveryFee,
    discount,
    total,
    status: order.status || 'Order Confirmed',
    tracking_step: trackingStep,
    created_at: order.createdAt || now,
    updated_at: now,
  };

  let currentPayload: any = { ...payload };
  const maxRetries = 10;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // 1. Try direct insert (cleaner and doesn't require SELECT permission or onConflict constraints)
      let res = await supabase.from('orders').insert(currentPayload);

      // If already exists (duplicate key error), update existing order instead
      if (
        res.error &&
        (res.error.code === '23505' ||
          res.error.message.includes('duplicate') ||
          res.error.message.includes('already exists') ||
          res.error.message.includes('unique constraint'))
      ) {
        res = await supabase.from('orders').update(currentPayload).eq('id', order.id);
      }

      // Success check!
      if (!res.error) {
        console.log('Order successfully synced and stored in Supabase database:', order.id);
        return { success: true };
      }

      const error = res.error;

      // Detect missing column error (e.g. PGRST204 "Could not find the 'delivery_time_slot' column")
      const missingMatch =
        error.message.match(/Could not find the '([^']+)' column/i) ||
        error.message.match(/column "([^"]+)" of relation "orders" does not exist/i);

      if (missingMatch && missingMatch[1]) {
        const missingColumn = missingMatch[1];
        console.warn(`Supabase orders table is missing column "${missingColumn}". Preserving data in notes & retrying...`);

        // Safeguard the data by embedding into order_notes if column isn't in DB yet
        if (missingColumn === 'delivery_time_slot' && currentPayload.delivery_time_slot) {
          const slotNote = `[Slot: ${currentPayload.delivery_time_slot}]`;
          currentPayload.order_notes = currentPayload.order_notes
            ? `${slotNote} ${currentPayload.order_notes}`
            : slotNote;
        }
        if (missingColumn === 'gift_message' && currentPayload.gift_message) {
          const giftNote = `[Gift: ${currentPayload.gift_message}]`;
          currentPayload.order_notes = currentPayload.order_notes
            ? `${giftNote} ${currentPayload.order_notes}`
            : giftNote;
        }
        if (missingColumn === 'payment_reference' && currentPayload.payment_reference) {
          const refNote = `[Ref: ${currentPayload.payment_reference}]`;
          currentPayload.order_notes = currentPayload.order_notes
            ? `${refNote} ${currentPayload.order_notes}`
            : refNote;
        }

        delete currentPayload[missingColumn];
        continue; // retry insert without the missing column
      }

      // Handle items type mismatch (PostgreSQL column is text instead of jsonb)
      if (
        error.message.includes('items') &&
        (error.message.includes('type text') ||
          error.message.includes('expression is of type jsonb') ||
          error.message.includes('malformed'))
      ) {
        console.warn('Converting items array to JSON string for text column and retrying...');
        currentPayload.items = JSON.stringify(sanitizedItems);
        continue;
      }

      console.error('Supabase order insert error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      return { success: false, error: error.message };
    } catch (err: any) {
      console.error('Supabase order sync exception:', err);
      return { success: false, error: err?.message || String(err) };
    }
  }

  return { success: false, error: 'Maximum column-healing retries exceeded' };
}

export async function fetchAllOrders(): Promise<Order[]> {
  const localOrders = getLocal<Order[]>(LOCAL_ORDERS_KEY, []);
  const supabase = getSupabase();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch orders query error:', error.message);
      } else if (data) {
        const supabaseOrders: Order[] = data.map((d: any) => ({
          id: d.id,
          customerName: d.customer_name || 'Customer',
          customerEmail: d.customer_email || '',
          customerPhone: d.customer_phone || '',
          deliveryMethod: d.delivery_method || 'delivery',
          address: d.address || '',
          deliveryTimeSlot: d.delivery_time_slot || undefined,
          orderNotes: d.order_notes || undefined,
          giftMessage: d.gift_message || undefined,
          paymentMethod: d.payment_method || 'gcash',
          paymentReference: d.payment_reference || undefined,
          items: Array.isArray(d.items)
            ? d.items
            : typeof d.items === 'string'
            ? (() => {
                try {
                  return JSON.parse(d.items);
                } catch {
                  return [];
                }
              })()
            : [],
          subtotal: Number(d.subtotal) || 0,
          deliveryFee: Number(d.delivery_fee) || 0,
          discount: Number(d.discount || 0),
          total: Number(d.total) || 0,
          status: d.status || 'Order Confirmed',
          trackingStep:
            d.tracking_step != null
              ? Number(d.tracking_step)
              : getTrackingStepFromStatus(d.status || 'Order Confirmed'),
          createdAt: d.created_at || new Date().toISOString(),
          updatedAt: d.updated_at || d.created_at || new Date().toISOString(),
          userEmail: d.user_email || undefined,
        }));

        // MERGE LOGIC: Any local orders that are NOT yet in Supabase must NOT be deleted!
        const supabaseIdSet = new Set(supabaseOrders.map((o) => o.id));
        const pendingLocalOrders = localOrders.filter((o) => !supabaseIdSet.has(o.id));

        // Auto-retry syncing pending orders in the background so they appear in Supabase
        if (pendingLocalOrders.length > 0) {
          pendingLocalOrders.forEach((pending) => {
            syncOrderToSupabase(pending).catch((err) =>
              console.warn('Auto-sync pending order to Supabase failed:', pending.id, err)
            );
          });
        }

        const mergedOrders = [...pendingLocalOrders, ...supabaseOrders];
        setLocal(LOCAL_ORDERS_KEY, mergedOrders);
        return mergedOrders;
      }
    } catch (e) {
      console.warn('Supabase orders query exception:', e);
    }
  }

  return localOrders;
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  if (!orderId) return null;
  const cleanId = orderId.trim();
  const supabase = getSupabase();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', cleanId)
        .maybeSingle();

      if (!error && data) {
        const mapped: Order = {
          id: data.id,
          customerName: data.customer_name || 'Customer',
          customerEmail: data.customer_email || '',
          customerPhone: data.customer_phone || '',
          deliveryMethod: data.delivery_method || 'delivery',
          address: data.address || '',
          deliveryTimeSlot: data.delivery_time_slot || undefined,
          orderNotes: data.order_notes || undefined,
          giftMessage: data.gift_message || undefined,
          paymentMethod: data.payment_method || 'gcash',
          paymentReference: data.payment_reference || undefined,
          items: Array.isArray(data.items)
            ? data.items
            : typeof data.items === 'string'
            ? (() => {
                try {
                  return JSON.parse(data.items);
                } catch {
                  return [];
                }
              })()
            : [],
          subtotal: Number(data.subtotal) || 0,
          deliveryFee: Number(data.delivery_fee) || 0,
          discount: Number(data.discount || 0),
          total: Number(data.total) || 0,
          status: data.status || 'Order Confirmed',
          trackingStep:
            data.tracking_step != null
              ? Number(data.tracking_step)
              : getTrackingStepFromStatus(data.status || 'Order Confirmed'),
          createdAt: data.created_at,
          updatedAt: data.updated_at || data.created_at,
          userEmail: data.user_email || undefined,
        };

        // Cache update without losing other orders
        const local = getLocal<Order[]>(LOCAL_ORDERS_KEY, []);
        const idx = local.findIndex((o) => o.id === mapped.id);
        if (idx > -1) {
          local[idx] = mapped;
        } else {
          local.unshift(mapped);
        }
        setLocal(LOCAL_ORDERS_KEY, local);

        return mapped;
      }
    } catch (e) {
      console.warn('Error fetching order by ID from Supabase:', e);
    }
  }

  const localOrders = getLocal<Order[]>(LOCAL_ORDERS_KEY, []);
  return localOrders.find((o) => o.id.toLowerCase() === cleanId.toLowerCase()) || null;
}

export async function fetchUserOrders(userEmail: string): Promise<Order[]> {
  const all = await fetchAllOrders();
  if (!userEmail) return [];
  return all.filter((o) => o.customerEmail.toLowerCase() === userEmail.toLowerCase() || o.userEmail?.toLowerCase() === userEmail.toLowerCase());
}

export async function createNewOrder(order: Order): Promise<Order> {
  const trackingStep = order.trackingStep || getTrackingStepFromStatus(order.status || 'Order Confirmed');
  const now = new Date().toISOString();

  const cleanOrder: Order = {
    ...order,
    trackingStep,
    subtotal: Math.round(Number(order.subtotal) || 0),
    deliveryFee: Math.round(Number(order.deliveryFee) || 0),
    discount: Math.round(Number(order.discount) || 0),
    total: Math.round(Number(order.total) || 0),
    createdAt: order.createdAt || now,
    updatedAt: now,
  };

  // 1. Immediately store in local storage to guarantee 100% preservation
  const existing = getLocal<Order[]>(LOCAL_ORDERS_KEY, []);
  const idx = existing.findIndex((o) => o.id === cleanOrder.id);
  if (idx > -1) {
    existing[idx] = cleanOrder;
  } else {
    existing.unshift(cleanOrder);
  }
  setLocal(LOCAL_ORDERS_KEY, existing);

  // 2. Sync to Supabase
  if (isSupabaseConfigured()) {
    try {
      const syncRes = await syncOrderToSupabase(cleanOrder);
      if (!syncRes.success) {
        console.warn('Initial Supabase order sync failed, will auto-retry on dashboard refresh:', syncRes.error);
      }
    } catch (e) {
      console.warn('Supabase order insert fallback to local storage:', e);
    }
  }

  return cleanOrder;
}

export async function updateOrderStatus(orderId: string, status: string, trackingStep?: number): Promise<boolean> {
  const step = trackingStep ?? getTrackingStepFromStatus(status);
  const now = new Date().toISOString();
  const supabase = getSupabase();

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('orders').update({
        status,
        tracking_step: step,
        updated_at: now,
      }).eq('id', orderId);
    } catch (e) {
      console.warn('Supabase update order status error:', e);
    }
  }

  const existing = getLocal<Order[]>(LOCAL_ORDERS_KEY, []);
  const idx = existing.findIndex((o) => o.id === orderId);
  if (idx > -1) {
    existing[idx].status = status;
    existing[idx].trackingStep = step;
    existing[idx].updatedAt = now;
    setLocal(LOCAL_ORDERS_KEY, existing);
  }
  return true;
}

// Real-time Order Subscription (WebSocket + High-Frequency Polling fallback)
export function subscribeToOrderUpdates(orderId: string, onUpdate: (order: Order) => void): () => void {
  let isSubscribed = true;
  const cleanId = orderId.trim();

  // 1. Initial immediate fetch
  fetchOrderById(cleanId).then((ord) => {
    if (ord && isSubscribed) onUpdate(ord);
  });

  // 2. Setup Realtime subscription if Supabase is connected
  let channel: any = null;
  const supabase = getSupabase();
  if (isSupabaseConfigured()) {
    try {
      channel = supabase
        .channel(`order-track-${cleanId}-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `id=eq.${cleanId}`,
          },
          (payload: any) => {
            if (payload?.new && isSubscribed) {
              const d = payload.new;
              const mapped: Order = {
                id: d.id,
                customerName: d.customer_name,
                customerEmail: d.customer_email,
                customerPhone: d.customer_phone,
                deliveryMethod: d.delivery_method,
                address: d.address,
                deliveryTimeSlot: d.delivery_time_slot || undefined,
                orderNotes: d.order_notes || undefined,
                giftMessage: d.gift_message || undefined,
                paymentMethod: d.payment_method,
                paymentReference: d.payment_reference,
                items: d.items,
                subtotal: Number(d.subtotal),
                deliveryFee: Number(d.delivery_fee),
                discount: Number(d.discount || 0),
                total: Number(d.total),
                status: d.status,
                trackingStep: d.tracking_step != null ? Number(d.tracking_step) : getTrackingStepFromStatus(d.status),
                createdAt: d.created_at,
                updatedAt: d.updated_at || d.created_at,
                userEmail: d.user_email,
              };
              onUpdate(mapped);
            }
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Realtime channel error:', e);
    }
  }

  // 3. High-Frequency Polling (every 3 seconds) for guaranteed updates even without websockets
  const interval = setInterval(async () => {
    if (!isSubscribed) return;
    const fresh = await fetchOrderById(cleanId);
    if (fresh && isSubscribed) {
      onUpdate(fresh);
    }
  }, 3000);

  return () => {
    isSubscribed = false;
    clearInterval(interval);
    if (channel && supabase) {
      try {
        supabase.removeChannel(channel);
      } catch {}
    }
  };
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

// ---------------- USER ACCOUNTS & CUSTOMERS ----------------

export const LOCAL_USERS_KEY = 'sc_registered_users';
export const LOCAL_CURRENT_USER_KEY = 'sc_current_user';

export interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  phone: string;
  address: string;
  createdAt: string;
}

export async function registerCustomerAccount(account: {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}): Promise<{ user: UserProfile; error?: string }> {
  const cleanEmail = account.email.trim().toLowerCase();
  const cleanPhone = account.phone.trim();
  const cleanName = account.fullName.trim();
  const cleanAddress = account.address.trim();

  // Error handling checks
  if (!cleanName || cleanName.length < 2) {
    return { user: null as any, error: 'Please enter your full name (at least 2 characters).' };
  }

  // 11-digit phone number validation
  const digitsOnlyPhone = cleanPhone.replace(/\D/g, '');
  if (digitsOnlyPhone.length !== 11 || !digitsOnlyPhone.startsWith('09')) {
    return {
      user: null as any,
      error: 'Phone number must be an 11-digit Philippine mobile number starting with 09 (e.g. 09171234567).',
    };
  }

  // @gmail.com email validation as requested
  if (!cleanEmail.endsWith('@gmail.com')) {
    return {
      user: null as any,
      error: 'Email must be a valid Gmail address ending with @gmail.com (e.g. yourname@gmail.com).',
    };
  }

  if (!cleanAddress || cleanAddress.length < 8) {
    return {
      user: null as any,
      error: 'Please enter a complete delivery address with street and barangay.',
    };
  }

  if (!account.password || account.password.length < 6) {
    return {
      user: null as any,
      error: 'Password must be at least 6 characters long.',
    };
  }

  // Check if email already registered locally
  const existingUsers = getLocal<StoredUser[]>(LOCAL_USERS_KEY, []);
  if (existingUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return {
      user: null as any,
      error: 'An account with this Gmail address already exists. Please log in instead.',
    };
  }

  const userId = `usr_${Date.now()}`;
  const now = new Date().toISOString();

  const newUser: StoredUser = {
    id: userId,
    fullName: cleanName,
    email: cleanEmail,
    passwordHash: account.password,
    phone: digitsOnlyPhone,
    address: cleanAddress,
    createdAt: now,
  };

  // 1. Save to Supabase users table
  const supabase = getSupabase();
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('users').upsert({
        id: userId,
        full_name: cleanName,
        email: cleanEmail,
        password_hash: account.password,
        phone: digitsOnlyPhone,
        address: cleanAddress,
        created_at: now,
        updated_at: now,
      });
    } catch (e) {
      console.warn('Could not save user to Supabase users table, saved to local persistence:', e);
    }

    try {
      // Also register in Supabase Auth
      await supabase.auth.signUp({
        email: cleanEmail,
        password: account.password,
        options: {
          data: {
            full_name: cleanName,
            phone: digitsOnlyPhone,
            address: cleanAddress,
          },
        },
      });
    } catch {}
  }

  // 2. Save to local storage persistent accounts
  existingUsers.unshift(newUser);
  setLocal(LOCAL_USERS_KEY, existingUsers);

  const profile: UserProfile = {
    id: userId as any,
    uid: userId,
    email: cleanEmail,
    name: cleanName,
    phone: digitsOnlyPhone,
    address: cleanAddress,
    createdAt: now,
  };

  // Set as current logged-in user
  setLocal(LOCAL_CURRENT_USER_KEY, profile);

  return { user: profile };
}

export async function loginCustomerAccount(
  emailInput: string,
  passInput: string
): Promise<{ user: UserProfile; error?: string }> {
  const cleanEmail = emailInput.trim().toLowerCase();
  const cleanPass = passInput.trim();

  if (!cleanEmail) {
    return { user: null as any, error: 'Please enter your Gmail address.' };
  }
  if (!cleanPass) {
    return { user: null as any, error: 'Please enter your password.' };
  }

  // 1. First check Supabase database users table
  const supabase = getSupabase();
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', cleanEmail)
        .limit(1);

      if (!error && data && data.length > 0) {
        const dbUser = data[0];
        if (dbUser.password_hash === cleanPass) {
          const profile: UserProfile = {
            id: dbUser.id,
            uid: dbUser.id,
            email: dbUser.email,
            name: dbUser.full_name,
            phone: dbUser.phone,
            address: dbUser.address,
            createdAt: dbUser.created_at,
          };
          setLocal(LOCAL_CURRENT_USER_KEY, profile);
          return { user: profile };
        } else {
          return { user: null as any, error: 'Incorrect password. Please verify your password and try again.' };
        }
      }
    } catch {}
  }

  // 2. Check local registered users list
  const users = getLocal<StoredUser[]>(LOCAL_USERS_KEY, []);
  const found = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (found) {
    if (found.passwordHash === cleanPass) {
      const profile: UserProfile = {
        id: found.id as any,
        uid: found.id,
        email: found.email,
        name: found.fullName,
        phone: found.phone,
        address: found.address,
        createdAt: found.createdAt,
      };
      setLocal(LOCAL_CURRENT_USER_KEY, profile);
      return { user: profile };
    } else {
      return { user: null as any, error: 'Incorrect password. Please verify your password and try again.' };
    }
  }

  return {
    user: null as any,
    error: 'No account found with this email. Please check your spelling or click "Register" to create your account.',
  };
}

export function getCurrentStoredUser(): UserProfile | null {
  return getLocal<UserProfile | null>(LOCAL_CURRENT_USER_KEY, null);
}

export function setCurrentStoredUser(user: UserProfile | null): void {
  setLocal(LOCAL_CURRENT_USER_KEY, user);
}

export async function updateCustomerProfile(
  email: string,
  data: { name?: string; phone?: string; address?: string }
): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const current = getCurrentStoredUser();

  const updated: UserProfile = {
    ...(current || { id: `usr_${Date.now()}`, uid: `usr_${Date.now()}`, email: cleanEmail }),
    name: data.name ?? current?.name ?? '',
    phone: data.phone ?? current?.phone ?? '',
    address: data.address ?? current?.address ?? '',
  };

  setCurrentStoredUser(updated);

  // Sync with local registered users
  const users = getLocal<StoredUser[]>(LOCAL_USERS_KEY, []);
  const idx = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
  if (idx > -1) {
    if (data.name) users[idx].fullName = data.name;
    if (data.phone) users[idx].phone = data.phone;
    if (data.address) users[idx].address = data.address;
    setLocal(LOCAL_USERS_KEY, users);
  }

  // Sync with Supabase
  const supabase = getSupabase();
  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('users')
        .update({
          full_name: updated.name,
          phone: updated.phone,
          address: updated.address,
          updated_at: new Date().toISOString(),
        })
        .ilike('email', cleanEmail);
    } catch {}
  }

  return updated;
}

export async function fetchAllRegisteredUsers(): Promise<StoredUser[]> {
  const supabase = getSupabase();
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          fullName: d.full_name,
          email: d.email,
          passwordHash: d.password_hash || '',
          phone: d.phone || '',
          address: d.address || '',
          createdAt: d.created_at,
        }));
      }
    } catch {}
  }
  return getLocal<StoredUser[]>(LOCAL_USERS_KEY, []);
}
