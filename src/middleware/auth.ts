import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../db';
import { users, apiKeys } from '../db/schema';
import { eq } from 'drizzle-orm';
import { refreshUserFlow } from '../flow/refresh.flow';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  apiKeyId?: string;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    // If no access token but we have a refresh token, try to refresh directly
    if (!token && req.cookies.refresh_token) {
       try {
          const result = await refreshUserFlow(req.cookies.refresh_token);
          token = result.accessToken;
          res.cookie('token', result.accessToken, {
            httpOnly: true, secure: true, sameSite: 'none', maxAge: 15 * 60 * 1000
          });
          res.cookie('refresh_token', result.refreshToken, {
            httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000
          });
       } catch (refreshError) {
          res.status(401).json({ error: 'Unauthorized: Session expired' });
          return;
       }
    }

    if (!token) {
       res.status(401).json({ error: 'Unauthorized: No token provided' });
       return;
    }
    
    // Check if it's an API Key
    if (token.startsWith('sk_live_')) {
      const keyHash = crypto.createHash('sha256').update(token).digest('hex');
      const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.key_hash, keyHash)).limit(1);
      
      if (!apiKey) {
        res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
        return;
      }
      
      // Update last_used_at in the background
      db.update(apiKeys).set({ last_used_at: new Date() }).where(eq(apiKeys.id, apiKey.id)).execute().catch(console.error);
      
      const [user] = await db.select().from(users).where(eq(users.id, apiKey.user_id)).limit(1);
      if (!user) {
        res.status(401).json({ error: 'Unauthorized: User associated with this API key not found' });
        return;
      }
      
      req.user = { id: user.id, email: user.email, role: user.role };
      req.apiKeyId = apiKey.id;
      next();
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: string, email: string };
    } catch (jwtError: any) {
      if (jwtError.name === 'TokenExpiredError' && req.cookies.refresh_token) {
        try {
          const result = await refreshUserFlow(req.cookies.refresh_token);
          token = result.accessToken;
          res.cookie('token', result.accessToken, {
            httpOnly: true, secure: true, sameSite: 'none', maxAge: 15 * 60 * 1000
          });
          res.cookie('refresh_token', result.refreshToken, {
            httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000
          });
          decoded = jwt.verify(token, JWT_SECRET) as { id: string, email: string };
        } catch (refreshError) {
          res.status(401).json({ error: 'Unauthorized: Session expired' });
          return;
        }
      } else {
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
        return;
      }
    }
    
    // Verify user still exists
    const [user] = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
    
    if (!user) {
       res.status(401).json({ error: 'Unauthorized: User not found' });
       return;
    }
    
    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Authentication failed' });
    return;
  }
};

export const requireRoles = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: No user found' });
      return;
    }
    
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      return;
    }
    
    next();
  };
};
