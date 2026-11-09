import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'sc_supabase_config';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch {}

  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  return {
    url: envUrl,
    anonKey: envKey,
  };
}

export interface SupabaseTestResult {
  success: boolean;
  message: string;
  tables: {
    products: boolean;
    orders: boolean;
    reviews: boolean;
    contact_messages: boolean;
  };
  latencyMs?: number;
}

export function resetSupabaseConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    supabaseClient = initClient('', '');
  } catch {}
}

export async function testSupabaseConnection(
  testUrl?: string,
  testKey?: string
): Promise<SupabaseTestResult> {
  const cfg = getStoredSupabaseConfig();
  const url = (testUrl || cfg.url || '').trim().replace(/\/+$/, '');
  const key = (testKey || cfg.anonKey || '').trim();

  if (!url || !key || !url.startsWith('https://')) {
    return {
      success: false,
      message: 'Please provide a valid Supabase Project URL (https://xyz.supabase.co) and Anon Public Key.',
      tables: { products: false, orders: false, reviews: false, contact_messages: false },
    };
  }

  const client = initClient(url, key);
  const startTime = performance.now();

  const tables = {
    products: false,
    orders: false,
    reviews: false,
    contact_messages: false,
    users: false,
  };

  try {
    const { error: prodErr } = await client.from('products').select('id').limit(1);
    tables.products = !prodErr;

    const { error: ordErr } = await client.from('orders').select('id').limit(1);
    tables.orders = !ordErr;

    const { error: revErr } = await client.from('reviews').select('id').limit(1);
    tables.reviews = !revErr;

    const { error: msgErr } = await client.from('contact_messages').select('id').limit(1);
    tables.contact_messages = !msgErr;

    const { error: usrErr } = await client.from('users').select('id').limit(1);
    tables.users = !usrErr;

    const latencyMs = Math.round(performance.now() - startTime);
    const allReady = tables.products && tables.orders && tables.reviews && tables.contact_messages;

    if (allReady) {
      return {
        success: true,
        message: `Successfully connected to Supabase in ${latencyMs}ms! All database tables are verified.`,
        tables,
        latencyMs,
      };
    }

    if (!tables.products && !tables.orders && !tables.reviews && !tables.contact_messages && !tables.users) {
      return {
        success: false,
        message: 'Connected to Supabase project, but database tables do not exist yet. Please run the SQL schema script in your Supabase SQL Editor.',
        tables,
        latencyMs,
      };
    }

    return {
      success: true,
      message: `Connected to Supabase in ${latencyMs}ms, but some tables are missing. Please run the full SQL schema script.`,
      tables,
      latencyMs,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection failed: ${err.message || 'Network error connecting to Supabase.'}`,
      tables,
    };
  }
}

export async function seedDefaultProductsToSupabase(
  customProducts?: any[]
): Promise<{ success: boolean; count: number; message: string }> {
  const client = getSupabase();
  const list = customProducts || (await import('./dataService.ts')).DEFAULT_PRODUCTS;

  try {
    const formatted = list.map((p: any) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      rating: p.rating || 5,
      reviews_count: p.reviewsCount || 0,
      description: p.description,
      image: p.image,
      badge: p.badge || null,
    }));

    const { error } = await client.from('products').upsert(formatted);
    if (error) {
      return {
        success: false,
        count: 0,
        message: `Failed to seed products: ${error.message}. Make sure the 'products' table exists with RLS policy.`,
      };
    }

    return {
      success: true,
      count: formatted.length,
      message: `Successfully seeded ${formatted.length} artisan bakery products to Supabase!`,
    };
  } catch (err: any) {
    return {
      success: false,
      count: 0,
      message: `Error seeding products: ${err.message}`,
    };
  }
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  const cleanUrl = url.trim().replace(/\/+$/, '');
  const cleanKey = anonKey.trim();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ url: cleanUrl, anonKey: cleanKey }));
  // Re-instantiate
  supabaseClient = initClient(cleanUrl, cleanKey);
}

export function isSupabaseConfigured(): boolean {
  const cfg = getStoredSupabaseConfig();
  return Boolean(
    cfg.url &&
    cfg.anonKey &&
    cfg.url.startsWith('https://') &&
    !cfg.url.includes('your-project') &&
    cfg.anonKey.length > 20
  );
}

function initClient(url: string, key: string): SupabaseClient {
  const targetUrl = url || 'https://placeholder.supabase.co';
  const targetKey = key || 'placeholder-anon-key';
  return createClient(targetUrl, targetKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

const initialConfig = getStoredSupabaseConfig();
let supabaseClient: SupabaseClient = initClient(initialConfig.url, initialConfig.anonKey);

export function getSupabase(): SupabaseClient {
  return supabaseClient;
}

export const supabase = supabaseClient;

// Ready-to-run SQL schema for the user's Supabase project
export const SUPABASE_SCHEMA_SQL = `-- Sweet Crumbs Bakery — Supabase Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Products table
CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  price numeric NOT NULL,
  rating integer DEFAULT 5,
  reviews_count integer DEFAULT 0,
  description text NOT NULL,
  image text NOT NULL,
  badge text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id text PRIMARY KEY,
  user_email text,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  delivery_method text NOT NULL,
  address text NOT NULL,
  delivery_time_slot text,
  order_notes text,
  gift_message text,
  payment_method text NOT NULL,
  payment_reference text,
  items jsonb NOT NULL,
  subtotal numeric NOT NULL,
  delivery_fee numeric NOT NULL,
  discount numeric NOT NULL,
  total numeric NOT NULL,
  status text DEFAULT 'Order Confirmed' NOT NULL,
  tracking_step integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Ensure all columns exist on pre-existing orders table (Safe to re-run anytime)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_email text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_time_slot text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_notes text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS gift_message text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_reference text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_step integer DEFAULT 1;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- 3. Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  rating integer NOT NULL,
  text text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Contact Messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'Unread',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Users & Customer Accounts table
CREATE TABLE IF NOT EXISTS public.users (
  id text PRIMARY KEY,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Products policies (Safe to re-run)
DROP POLICY IF EXISTS "Public products viewable" ON public.products;
CREATE POLICY "Public products viewable" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public products insertable" ON public.products;
CREATE POLICY "Public products insertable" ON public.products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public products updateable" ON public.products;
CREATE POLICY "Public products updateable" ON public.products FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public products deleteable" ON public.products;
CREATE POLICY "Public products deleteable" ON public.products FOR DELETE USING (true);

-- Reviews policies (Safe to re-run)
DROP POLICY IF EXISTS "Public reviews viewable" ON public.reviews;
CREATE POLICY "Public reviews viewable" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public reviews insertable" ON public.reviews;
CREATE POLICY "Public reviews insertable" ON public.reviews FOR INSERT WITH CHECK (true);

-- Orders policies (Safe to re-run)
DROP POLICY IF EXISTS "Public orders insertable" ON public.orders;
CREATE POLICY "Public orders insertable" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public orders viewable" ON public.orders;
CREATE POLICY "Public orders viewable" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public orders updateable" ON public.orders;
CREATE POLICY "Public orders updateable" ON public.orders FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public orders deleteable" ON public.orders;
CREATE POLICY "Public orders deleteable" ON public.orders FOR DELETE USING (true);

-- Contact messages policies (Safe to re-run)
DROP POLICY IF EXISTS "Public contact insertable" ON public.contact_messages;
CREATE POLICY "Public contact insertable" ON public.contact_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public contact viewable" ON public.contact_messages;
CREATE POLICY "Public contact viewable" ON public.contact_messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public contact updateable" ON public.contact_messages;
CREATE POLICY "Public contact updateable" ON public.contact_messages FOR UPDATE USING (true);

-- Users & Customer Accounts policies (Safe to re-run)
DROP POLICY IF EXISTS "Public users viewable" ON public.users;
CREATE POLICY "Public users viewable" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public users insertable" ON public.users;
CREATE POLICY "Public users insertable" ON public.users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public users updateable" ON public.users;
CREATE POLICY "Public users updateable" ON public.users FOR UPDATE USING (true);

-- Realtime support
ALTER TABLE public.orders REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;
`;
