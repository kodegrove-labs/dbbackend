const fs = require('fs');

let code = fs.readFileSync('src/auth/auth.controller.ts', 'utf8');

code = code.replace(
  "import { users } from '../db/schema';\nimport { eq } from 'drizzle-orm';",
  "import { users, sessions, apiKeys, emailMessages, aiLogs } from '../db/schema';\nimport { eq, desc } from 'drizzle-orm';"
);

const newEndpoint = `
router.get('/dashboard', requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.user) return;
  try {
    const [user] = await db.select({
      id: users.id, email: users.email, username: users.username, avatar_url: users.avatar_url,
      role: users.role, last_sign_in_at: users.last_sign_in_at, email_verified: users.email_verified,
      created_at: users.created_at, metadata: users.metadata, auth_provider: users.auth_provider
    }).from(users).where(eq(users.id, req.user.id)).limit(1);

    const activeSessions = await db.select().from(sessions).where(eq(sessions.user_id, req.user.id)).orderBy(desc(sessions.created_at));
    const userApiKeys = await db.select().from(apiKeys).where(eq(apiKeys.user_id, req.user.id)).orderBy(desc(apiKeys.created_at));
    const userEmailHistory = await db.select().from(emailMessages).where(eq(emailMessages.user_id, req.user.id)).orderBy(desc(emailMessages.created_at));
    const userAiLogs = await db.select().from(aiLogs).where(eq(aiLogs.user_id, req.user.id)).orderBy(desc(aiLogs.created_at));

    res.json({
      user,
      sessions: activeSessions,
      apiKeys: userApiKeys,
      emailMessages: userEmailHistory,
      aiLogs: userAiLogs
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch dashboard data' });
  }
});
`;

code = code.replace('export default router;', newEndpoint + '\nexport default router;');

fs.writeFileSync('src/auth/auth.controller.ts', code);
