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

export const loginWithGoogleFlow = async (input: string | { credential?: string; accessToken?: string }) => {
  if (!process.env.VITE_GOOGLE_CLIENT_ID) {
    throw new Error('Google Client ID is not configured');
  }

  let email: string = '';
  let provider_id: string = '';
  let email_verified: boolean = false;
  let name: string = '';

  const credential = typeof input === 'string' ? input : input.credential;
  const googleAccessToken = typeof input === 'object' ? input.accessToken : undefined;

  if (credential) {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.VITE_GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error('Invalid Google Token');
    }
    email = payload.email;
    provider_id = payload.sub;
    email_verified = payload.email_verified === true;
    name = payload.name || email.split('@')[0];
  } else if (googleAccessToken) {
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${googleAccessToken}` }
    });
    if (!userInfoRes.ok) {
      throw new Error('Failed to verify Google access token');
    }
    const payload = await userInfoRes.json();
    if (!payload || !payload.email) {
      throw new Error('Invalid Google user info payload');
    }
    email = payload.email;
    provider_id = payload.sub;
    email_verified = payload.email_verified === true;
    name = payload.name || email.split('@')[0];
  } else {
    throw new Error('Neither Google credential nor accessToken was provided');
  }

  let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    const userId = crypto.randomUUID();
    const adminEmails = ['admin@example.com', 'guptaharshit279@gmail.com'];
    const role = adminEmails.includes(email) ? 'admin' : 'user';
    await db.insert(users).values({
      id: userId,
      email,
      username: name,
      email_verified,
      auth_provider: 'google',
      provider_id,
      role,
    });
    [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    // Send welcome email to new Google users
    await sendWelcomeEmail(email, name).catch(console.error);
  } else if (user.auth_provider === 'email') {
    await db.update(users)
      .set({ auth_provider: 'google', provider_id, email_verified })
      .where(eq(users.id, user.id));
    user.auth_provider = 'google';
    user.provider_id = provider_id;
    user.email_verified = email_verified;
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

  await db.update(users).set({ last_sign_in_at: new Date(), updated_at: new Date() }).where(eq(users.id, user.id));
  return { accessToken, refreshToken, user: { id: user.id, email: user.email, email_verified: user.email_verified } };
};
