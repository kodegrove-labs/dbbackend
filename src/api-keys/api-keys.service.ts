import { db } from '../db';
import { apiKeys } from '../db/schema';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { desc, eq } from 'drizzle-orm';

export const generateApiKey = async (name: string, userId: string) => {
  const rawKey = crypto.randomBytes(32).toString('hex');
  const keyToReturn = `sk_live_${rawKey}`;
  
  // We only store the hash of the key, plus a prefix to identify it in the UI
  const keyHash = crypto.createHash('sha256').update(keyToReturn).digest('hex');
  const keyPrefix = keyToReturn.substring(0, 12) + '...';
  
  await db.insert(apiKeys).values({
    id: uuidv4(),
    user_id: userId,
    name,
    key_hash: keyHash,
    key_prefix: keyPrefix
  });

  return { apiKey: keyToReturn, name };
};

export const listApiKeys = async (userId: string) => {
  return db.select({
    id: apiKeys.id,
    name: apiKeys.name,
    key_prefix: apiKeys.key_prefix,
    created_at: apiKeys.created_at,
    last_used_at: apiKeys.last_used_at,
  }).from(apiKeys)
    .where(eq(apiKeys.user_id, userId))
    .orderBy(desc(apiKeys.created_at));
};
