import crypto from 'crypto';
import { eq, lt } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users, sessions } from '../db/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'super-secret-refresh-key';

export const refreshUserFlow = async (oldRefreshToken: string) => {
  // 1. Verify token
  let decoded: any;
  try {
    decoded = jwt.verify(oldRefreshToken, REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }

  const { id: userId, email, sessionId } = decoded;
  if (!sessionId) {
    throw new Error('Invalid refresh token payload');
  }

  // 2. Check session in DB
  const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
  if (!session) {
    throw new Error('Session not found or invalidated');
  }
  
  if (session.expires_at < new Date()) {
    throw new Error('Session expired');
  }

  // 3. Delete old session
  await db.delete(sessions).where(eq(sessions.id, sessionId));

  // 4. Generate new tokens
  const newSessionId = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const accessToken = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId, email, sessionId: newSessionId }, REFRESH_SECRET, { expiresIn: '7d' });

  // 5. Store new session
  await db.insert(sessions).values({
    id: newSessionId,
    user_id: userId,
    expires_at: expiresAt,
  });
  
  // 6. Clean up expired tokens (the mechanism to clear expired tokens from backend)
  // We do this asynchronously so it doesn't block the request
  db.delete(sessions).where(lt(sessions.expires_at, new Date())).execute().catch(console.error);

  return { accessToken, refreshToken };
};
