import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
       res.status(401).json({ error: 'Unauthorized: No token provided' });
       return;
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string, email: string };
    
    // Verify user still exists
    const [user] = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
    
    if (!user) {
       res.status(401).json({ error: 'Unauthorized: User not found' });
       return;
    }
    
    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }
};
