import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { apiKeys } from '../db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export interface ApiKeyRequest extends Request {
  apiUser?: {
    id: string;
  };
}

export const requireApiKey = async (req: ApiKeyRequest, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  const configuredKey = process.env.SERVICE_API_KEY;

  if (!apiKey) {
    res.status(401).json({ error: 'Unauthorized: Missing x-api-key header' });
    return;
  }

  // 1. Check if it matches the environment fallback key
  if (configuredKey && apiKey === configuredKey) {
    // We don't have a specific user ID for the env fallback key, but we can allow it
    return next();
  }

  // 2. Check the database
  try {
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const matchedKey = await db.select().from(apiKeys).where(eq(apiKeys.key_hash, keyHash)).limit(1);

    if (matchedKey.length > 0) {
      // Set the user on the request so endpoints know who is calling
      req.apiUser = { id: matchedKey[0].user_id };

      // Update last_used_at async
      db.update(apiKeys).set({ last_used_at: new Date() }).where(eq(apiKeys.id, matchedKey[0].id)).execute().catch(console.error);
      return next();
    }
  } catch (error) {
    console.error('Error validating API key from DB:', error);
  }

  res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
};
