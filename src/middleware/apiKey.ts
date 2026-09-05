import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { apiKeys, users } from '../db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { refreshUserFlow } from '../flow/refresh.flow';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';

export interface ApiKeyRequest extends Request {
  apiUser?: {
    id: string;
  };
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const requireApiKey = async (req: ApiKeyRequest, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  const configuredKey = process.env.SERVICE_API_KEY || 'my-secret-service-key';

  // Helper to extract session user if present
  const tryAttachSessionUser = async () => {
    try {
      let token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
      if (!token && req.cookies?.refresh_token) {
        try {
          const result = await refreshUserFlow(req.cookies.refresh_token);
          token = result.accessToken;
          res.cookie('token', result.accessToken, {
            httpOnly: true, secure: true, sameSite: 'none', maxAge: 15 * 60 * 1000
          });
          res.cookie('refresh_token', result.refreshToken, {
            httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000
          });
        } catch {
          // ignore refresh error
        }
      }

      if (token && !token.startsWith('sk_live_')) {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string, email: string };
        const [u] = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
        if (u) {
          req.user = { id: u.id, email: u.email, role: u.role };
          req.apiUser = { id: u.id };
          return true;
        }
      }
    } catch {
      // ignore
    }
    return false;
  };

  // 1. If API key is provided
  if (apiKey) {
    // 1a. Check environment service key (or default fallback)
    if (apiKey === configuredKey) {
      // Check if session user is also logged in
      await tryAttachSessionUser();
      return next();
    }

    // 1b. Check the database for user-generated API keys
    try {
      const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
      const matchedKey = await db.select().from(apiKeys).where(eq(apiKeys.key_hash, keyHash)).limit(1);

      if (matchedKey.length > 0) {
        req.apiUser = { id: matchedKey[0].user_id };

        // Attach user info if found
        const [keyOwner] = await db.select().from(users).where(eq(users.id, matchedKey[0].user_id)).limit(1);
        if (keyOwner) {
          req.user = { id: keyOwner.id, email: keyOwner.email, role: keyOwner.role };
        }

        // Update last_used_at async
        db.update(apiKeys).set({ last_used_at: new Date() }).where(eq(apiKeys.id, matchedKey[0].id)).execute().catch(console.error);
        return next();
      }
    } catch (error) {
      console.error('Error validating API key from DB:', error);
    }

    res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
    return;
  }

  // 2. If no API key provided, fallback to active authenticated user session (cookie/Bearer)
  const hasSession = await tryAttachSessionUser();
  if (hasSession) {
    return next();
  }

  res.status(401).json({ error: 'Unauthorized: Missing x-api-key header or active login session' });
};
