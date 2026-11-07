import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Registered users table linked to Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  phone: text('phone'),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Products catalog
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  price: integer('price').notNull(),
  rating: integer('rating').default(0),
  reviewsCount: integer('reviews_count').default(0),
  description: text('description').notNull(),
  image: text('image').notNull(),
  badge: text('badge'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Orders placed by guests or registered users
export const orders = pgTable('orders', {
  id: text('id').primaryKey(), // e.g., 'SC-4821'
  userUid: text('user_uid'),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone').notNull(),
  deliveryMethod: text('delivery_method').notNull(),
  address: text('address').notNull(),
  paymentMethod: text('payment_method').notNull(),
  paymentReference: text('payment_reference'),
  items: text('items').notNull(), // JSON stringified array of items
  subtotal: integer('subtotal').notNull(),
  deliveryFee: integer('delivery_fee').notNull(),
  discount: integer('discount').notNull(),
  total: integer('total').notNull(),
  status: text('status').default('Order Confirmed'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Customer reviews
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  rating: integer('rating').notNull(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Contact messages submitted via the contact form
export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
