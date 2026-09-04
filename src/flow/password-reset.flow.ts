import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users, verificationTokens } from '../db/schema';
import { sendPasswordResetEmail } from '../email/email.service';

export const requestPasswordResetFlow = async (email: string) => {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    // For security, don't reveal if user exists
    return;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour

  await db.insert(verificationTokens).values({
    id: crypto.randomUUID(),
    user_id: user.id,
    token_hash: crypto.createHash('sha256').update(token).digest('hex'),
    type: 'password_reset',
    expires_at: expiresAt,
  });

  sendPasswordResetEmail(email, token).catch(console.error);
};
