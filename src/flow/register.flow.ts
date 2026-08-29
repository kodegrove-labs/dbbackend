import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users, verificationTokens } from '../db/schema';
import { sendVerificationEmail, sendWelcomeEmail } from '../email/email.service';

export const registerUserFlow = async (email: string, password: string) => {
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser.length > 0) {
    throw new Error('Email already registered');
  }

  const password_hash = await bcrypt.hash(password, 12);
  const userId = crypto.randomUUID();
  const adminEmails = ['admin@example.com', 'guptaharshit279@gmail.com'];
  const role = adminEmails.includes(email) ? 'admin' : 'user';

  await db.insert(users).values({
    id: userId,
    email,
    password_hash,
    role,
  });

  // Generate verification token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

  await db.insert(verificationTokens).values({
    id: crypto.randomUUID(),
    user_id: userId,
    token_hash: await bcrypt.hash(token, 10),
    type: 'email_verification',
    expires_at: expiresAt,
  });

  // Send emails sequentially to avoid SMTP concurrent connection drops
  (async () => {
    try {
      await sendWelcomeEmail(email, email.split('@')[0]);
      await sendVerificationEmail(email, token);
    } catch (e) {
      console.error('Failed to send registration emails:', e);
    }
  })();

  return { id: userId, email };
};
