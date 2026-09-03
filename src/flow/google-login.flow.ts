import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { db } from '../db';
import { users, sessions } from '../db/schema';
import { sendWelcomeEmail } from '../email/email.service';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'super-secret-refresh-key';
const googleClient = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

export const loginWithGoogleFlow = async (credential: string) => {
  if (!process.env.VITE_GOOGLE_CLIENT_ID) {
    throw new Error('Google Client ID is not configured');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.VITE_GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new Error('Invalid Google Token');
  }

  const { email, sub: provider_id, email_verified } = payload;

  let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    const userId = crypto.randomUUID();
    const adminEmails = ['admin@example.com', 'guptaharshit279@gmail.com'];
    const role = adminEmails.includes(email) ? 'admin' : 'user';
    await db.insert(users).values({
      id: userId,
      email,
      username: payload.name || email.split('@')[0],
      email_verified: email_verified === true,
      auth_provider: 'google',
      provider_id,
      role,
    });
    [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    // Send welcome email to new Google users
    sendWelcomeEmail(email, payload.name || email.split('@')[0]).catch(console.error);
  } else if (user.auth_provider === 'email') {
    await db.update(users)
      .set({ auth_provider: 'google', provider_id, email_verified: email_verified === true })
      .where(eq(users.id, user.id));
    user.auth_provider = 'google';
    user.provider_id = provider_id;
    user.email_verified = email_verified === true;
  }

  const sessionId = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const accessToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.id, email: user.email, sessionId }, REFRESH_SECRET, { expiresIn: '7d' });

  await db.insert(sessions).values({
    id: sessionId,
    user_id: user.id,
    expires_at: expiresAt,
  });

  return { accessToken, refreshToken, user: { id: user.id, email: user.email, email_verified: user.email_verified } };
};
