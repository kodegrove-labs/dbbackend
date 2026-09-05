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
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
  const rawApiKeyHeader = req.headers['x-api-key'] as string;
  const configuredKey = process.env.SERVICE_API_KEY || 'my-secret-service-key';

  // Helper to extract session user from JWT or cookies
  const tryAttachSessionUser = async (): Promise<boolean> => {
    try {
      // Determine if bearerToken is a JWT (3 dot-separated parts)
      const isBearerJwt = bearerToken && bearerToken.split('.').length === 3;
      let token = (isBearerJwt ? bearerToken : undefined) || req.cookies?.token;

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

      if (token && token.split('.').length === 3) {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string, email: string };
        const [u] = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
        if (u) {
          req.user = { id: u.id, email: u.email, role: u.role };
          req.apiUser = { id: u.id };
          return true;
        }
      }
    } catch {
      // ignore token decode/verify error
    }
    return false;
  };

  // Determine if an API key was explicitly provided
  // An API key can come from 'x-api-key' header OR Authorization: Bearer <key> (when not a JWT)
  const isBearerApiKey = bearerToken && bearerToken.split('.').length !== 3;
  const apiKey = rawApiKeyHeader || (isBearerApiKey ? bearerToken : undefined);

  // 1. If an API key is provided, validate it
  if (apiKey) {
    // 1a. Check environment service key
    if (apiKey === configuredKey) {
      // If a session user is also logged in, preserve their identity
      const sessionFound = await tryAttachSessionUser();
      if (!sessionFound && !req.user) {
        const [adminUser] = await db.select().from(users).where(eq(users.role, 'admin')).limit(1);
        if (adminUser) {
          req.user = { id: adminUser.id, email: adminUser.email, role: adminUser.role };
          req.apiUser = { id: adminUser.id };
        } else {
          req.user = { id: '00000000-0000-0000-0000-000000000000', email: 'service@internal', role: 'admin' };
          req.apiUser = { id: '00000000-0000-0000-0000-000000000000' };
        }
      }
      return next();
    }

    // 1b. Check database for user-generated API keys
    try {
      const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
      const matchedKey = await db.select().from(apiKeys).where(eq(apiKeys.key_hash, keyHash)).limit(1);

      if (matchedKey.length > 0) {
        req.apiUser = { id: matchedKey[0].user_id };

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

  // 2. If no API key provided, authenticate using active user session (Bearer JWT or HttpOnly cookie)
  const hasSession = await tryAttachSessionUser();
  if (hasSession) {
    return next();
  }

  res.status(401).json({ error: 'Unauthorized: Missing valid API Key or active login session' });
};
