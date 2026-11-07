import { desc, eq } from 'drizzle-orm';
import { db } from './index.ts';
import { orders } from './schema.ts';

export interface CreateOrderInput {
  id: string;
  userUid?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMethod: string;
  address: string;
  paymentMethod: string;
  paymentReference?: string;
  items: Array<{ id?: string; name: string; qty: number; price: number; meta?: string; img?: string }>;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

export async function createOrder(input: CreateOrderInput) {
  try {
    const inserted = await db
      .insert(orders)
      .values({
        id: input.id,
        userUid: input.userUid || null,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        deliveryMethod: input.deliveryMethod,
        address: input.address,
        paymentMethod: input.paymentMethod,
        paymentReference: input.paymentReference || null,
        items: JSON.stringify(input.items),
        subtotal: input.subtotal,
        deliveryFee: input.deliveryFee,
        discount: input.discount,
        total: input.total,
        status: 'Order Confirmed',
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Failed to create order in database:', error);
    throw new Error('Database insertion failed.', { cause: error });
  }
}

export async function getOrdersByUser(userUid: string) {
  try {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userUid, userUid))
      .orderBy(desc(orders.createdAt));
  } catch (error) {
    console.error('Failed to query orders for user:', error);
    throw new Error('Database query failed.', { cause: error });
  }
}

export async function getOrderById(id: string) {
  try {
    const list = await db.select().from(orders).where(eq(orders.id, id));
    return list[0] || null;
  } catch (error) {
    console.error('Failed to get order by id:', error);
    throw new Error('Database query failed.', { cause: error });
  }
}
