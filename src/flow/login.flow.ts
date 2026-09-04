import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users, sessions } from '../db/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'super-secret-refresh-key';

export const loginUserFlow = async (email: string, password: string) => {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user || !user.password_hash) {
    throw new Error('Invalid email or password');
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  const sessionId = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Tokens
  const accessToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.id, email: user.email, sessionId }, REFRESH_SECRET, { expiresIn: '7d' });

  // Store session
  await db.insert(sessions).values({
    id: sessionId,
    user_id: user.id,
    expires_at: expiresAt,
  });

  await db.update(users).set({ last_sign_in_at: new Date(), updated_at: new Date() }).where(eq(users.id, user.id));
  return { accessToken, refreshToken, user: { id: user.id, email: user.email, email_verified: user.email_verified } };
};
