import { eq } from 'drizzle-orm';
import { db } from './index.ts';
import { users } from './schema.ts';

export async function getOrCreateUser(uid: string, email: string, name?: string) {
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid));
    if (existing.length > 0) {
      if (name && !existing[0].name) {
        const updated = await db
          .update(users)
          .set({ name })
          .where(eq(users.uid, uid))
          .returning();
        return updated[0];
      }
      return existing[0];
    }

    const inserted = await db
      .insert(users)
      .values({
        uid,
        email,
        name: name || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(name ? { name } : {}),
        },
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw new Error('Database operation failed.', { cause: error });
  }
}

export async function getUserProfile(uid: string) {
  try {
    const found = await db.select().from(users).where(eq(users.uid, uid));
    return found[0] || null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile.', { cause: error });
  }
}

export async function updateUserProfile(
  uid: string,
  data: { name?: string; phone?: string; address?: string }
) {
  try {
    const updated = await db
      .update(users)
      .set(data)
      .where(eq(users.uid, uid))
      .returning();
    return updated[0] || null;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile.', { cause: error });
  }
}
