import { desc, eq } from 'drizzle-orm';
import { db } from './index.ts';
import { products } from './schema.ts';

export async function getAllProducts() {
  try {
    return await db.select().from(products).orderBy(products.category, products.name);
  } catch (error) {
    console.error('Failed to query products from database:', error);
    throw new Error('Database query failed.', { cause: error });
  }
}

export async function getProductById(id: string) {
  try {
    const list = await db.select().from(products).where(eq(products.id, id));
    return list[0] || null;
  } catch (error) {
    console.error('Failed to get product by id:', error);
    throw new Error('Database query failed.', { cause: error });
  }
}
