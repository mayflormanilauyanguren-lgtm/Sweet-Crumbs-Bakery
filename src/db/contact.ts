import { db } from './index.ts';
import { contactMessages } from './schema.ts';

export async function saveContactMessage(name: string, email: string, message: string) {
  try {
    const inserted = await db
      .insert(contactMessages)
      .values({ name, email, message })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Failed to save contact message to database:', error);
    throw new Error('Database insertion failed.', { cause: error });
  }
}
