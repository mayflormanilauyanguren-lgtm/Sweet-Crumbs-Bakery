import { desc } from 'drizzle-orm';
import { db } from './index.ts';
import { reviews } from './schema.ts';

export async function getAllReviews() {
  try {
    return await db.select().from(reviews).orderBy(desc(reviews.createdAt));
  } catch (error) {
    console.error('Failed to query reviews from database:', error);
    throw new Error('Database query failed.', { cause: error });
  }
}

export async function addReview(name: string, rating: number, text: string) {
  try {
    const inserted = await db
      .insert(reviews)
      .values({ name, rating, text })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Failed to insert review into database:', error);
    throw new Error('Database insertion failed.', { cause: error });
  }
}
