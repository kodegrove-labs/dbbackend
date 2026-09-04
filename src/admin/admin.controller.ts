import { Router, Request, Response } from 'express';
import { db } from '../db';
import { users, sessions, verificationTokens, apiKeys, passwordResetTokens, emailMessages, aiLogs } from '../db/schema';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const router = Router();

const tableMap: Record<string, any> = { users, sessions, verificationTokens, apiKeys, passwordResetTokens, emailMessages, aiLogs };

router.use(requireAuth);

router.get('/db-dump', async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    if (userRole === 'admin') {
      const allUsers = await db.select().from(users);
      const allSessions = await db.select().from(sessions);
      const allTokens = await db.select().from(verificationTokens);
      const allApiKeys = await db.select().from(apiKeys);
      const allPasswordResetTokens = await db.select().from(passwordResetTokens);
      const allEmailMessages = await db.select().from(emailMessages);
      const allAiLogs = await db.select().from(aiLogs);
      
      res.json({
        success: true,
        isAdmin: true,
        users: allUsers,
        sessions: allSessions,
        verificationTokens: allTokens,
        apiKeys: allApiKeys,
        passwordResetTokens: allPasswordResetTokens,
        emailMessages: allEmailMessages,
        aiLogs: allAiLogs
      });
    } else {
      const myUser = await db.select().from(users).where(eq(users.id, userId));
      const mySessions = await db.select().from(sessions).where(eq(sessions.user_id, userId));
      const myTokens = await db.select().from(verificationTokens).where(eq(verificationTokens.user_id, userId));
      const myApiKeys = await db.select().from(apiKeys).where(eq(apiKeys.user_id, userId));
      const myPasswordResetTokens = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.user_id, userId));
      const myEmailMessages = await db.select().from(emailMessages).where(eq(emailMessages.user_id, userId));
      const myAiLogs = await db.select().from(aiLogs).where(eq(aiLogs.user_id, userId));
      res.json({
        success: true,
        isAdmin: false,
        users: myUser,
        sessions: mySessions,
        verificationTokens: myTokens,
        apiKeys: myApiKeys,
        passwordResetTokens: myPasswordResetTokens,
        emailMessages: myEmailMessages,
        aiLogs: myAiLogs
      });
    }
  } catch (error: any) {
    console.error('Database dump error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Database connection failed. Ensure you are using the Connection Pooler URL (IPv4).'
    });
  }
});

router.post('/records/:table', async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Admin only' });
    return;
  }
  const table = tableMap[req.params.table];
  if (!table) {
    res.status(400).json({ error: 'Invalid table' });
    return;
  }
  try {
    const payload = { ...req.body };
    if (!payload.id) payload.id = crypto.randomUUID();
    
    // Parse dates if they are provided as strings
    if (payload.created_at) payload.created_at = new Date(payload.created_at);
    if (payload.updated_at) payload.updated_at = new Date(payload.updated_at);
    if (payload.expires_at) payload.expires_at = new Date(payload.expires_at);
    if (payload.last_used_at) payload.last_used_at = new Date(payload.last_used_at);

    await db.insert(table).values(payload);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/records/:table/:id', async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Admin only' });
    return;
  }
  const table = tableMap[req.params.table];
  if (!table) {
    res.status(400).json({ error: 'Invalid table' });
    return;
  }
  try {
    const payload = { ...req.body };
    // Clean up to prevent parse errors or un-updatable fields
    if (payload.created_at) payload.created_at = new Date(payload.created_at);
    if (payload.updated_at) payload.updated_at = new Date();
    if (payload.expires_at) payload.expires_at = new Date(payload.expires_at);
    if (payload.last_used_at) payload.last_used_at = new Date(payload.last_used_at);

    await db.update(table).set(payload).where(eq(table.id, req.params.id));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/records/:table/:id', async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Admin only' });
    return;
  }
  const table = tableMap[req.params.table];
  if (!table) {
    res.status(400).json({ error: 'Invalid table' });
    return;
  }
  try {
    await db.delete(table).where(eq(table.id, req.params.id));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
