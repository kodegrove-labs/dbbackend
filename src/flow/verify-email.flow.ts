import crypto from 'crypto';
import { eq, and, gt } from 'drizzle-orm';
import { db } from '../db';
import { users, verificationTokens } from '../db/schema';

export const verifyEmailFlow = async (token: string) => {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const [verificationToken] = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.token_hash, tokenHash),
        eq(verificationTokens.type, 'email_verification'),
        gt(verificationTokens.expires_at, new Date())
      )
    )
    .limit(1);

  if (!verificationToken) {
    throw new Error('Invalid or expired verification token');
  }

  // Update user
  await db
    .update(users)
    .set({ email_verified: true })
    .where(eq(users.id, verificationToken.user_id));

  // Delete token
  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.id, verificationToken.id));

  return true;
};
