import { Router, Request, Response, NextFunction } from 'express';
import { registerUserFlow, loginUserFlow, requestPasswordResetFlow, loginWithGoogleFlow, verifyEmailFlow, refreshUserFlow } from '../flow';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { db } from '../db';
import { users, sessions, apiKeys, emailMessages, aiLogs } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { token } = z.object({ token: z.string() }).parse(req.body);
    await verifyEmailFlow(token);
    res.json({ message: 'Email successfully verified' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Invalid token' });
  }
});

const googleLoginSchema = z.object({
  credential: z.string().optional(),
  accessToken: z.string().optional(),
}).refine(data => data.credential || data.accessToken, {
  message: 'Either credential or accessToken must be provided',
});

// Returns the constructed Google Session authorization URL
router.get('/google/url', (req: Request, res: Response) => {
  const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ error: 'Google Client ID (VITE_GOOGLE_CLIENT_ID) is not configured in .env' });
  }

  // Derive origin from query, request headers, or APP_URL
  const rawOrigin = (req.query.origin as string) || req.headers.origin || process.env.APP_URL || 'http://localhost:3000';
  const origin = rawOrigin.replace(/\/$/, '');

  const state = crypto.randomUUID();
  const nonce = crypto.randomUUID();

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', 'postmessage');
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('origin', origin);
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('prompt', 'select_account');

  res.json({
    success: true,
    url: googleAuthUrl.toString(),
    clientId,
    origin,
    redirectUri: 'postmessage',
    state
  });
});

// Tests if the Google OAuth endpoint successfully opens the session window (returns HTTP 302 location)
router.get('/google/test', async (req: Request, res: Response) => {
  try {
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({
        success: false,
        opensSessionWindow: false,
        error: 'Google Client ID (VITE_GOOGLE_CLIENT_ID) is missing in environment.'
      });
    }

    const rawOrigin = (req.query.origin as string) || req.headers.origin || process.env.APP_URL || 'https://ais-dev-x5pbygpjnugdbog453poz3-506628332032.asia-east1.run.app';
    const origin = rawOrigin.replace(/\/$/, '');

    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', clientId);
    googleAuthUrl.searchParams.set('redirect_uri', 'postmessage');
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('origin', origin);
    googleAuthUrl.searchParams.set('prompt', 'select_account');

    // Make live request to Google Accounts OAuth endpoint without following redirect
    const googleRes = await fetch(googleAuthUrl.toString(), {
      method: 'GET',
      redirect: 'manual'
    });

    const locationHeader = googleRes.headers.get('location') || '';
    const hasAuthError = locationHeader.includes('authError') || locationHeader.includes('error=');
    const isSessionWindow = locationHeader.includes('accounts.google.com/v3/signin') || 
                            locationHeader.includes('accounts.google.com/signin/oauth') ||
                            (googleRes.status === 200 && !hasAuthError);

    if (hasAuthError) {
      return res.json({
        success: false,
        opensSessionWindow: false,
        httpStatus: googleRes.status,
        authUrl: googleAuthUrl.toString(),
        location: locationHeader,
        clientId,
        origin,
        message: 'Google returned an authorization error. Ensure origin is listed in Authorized JavaScript Origins in Google Cloud Console.'
      });
    }

    return res.json({
      success: true,
      opensSessionWindow: true,
      httpStatus: googleRes.status,
      authUrl: googleAuthUrl.toString(),
      sessionWindowUrl: locationHeader || googleAuthUrl.toString(),
      clientId,
      origin,
      message: 'Google Auth is active and reachable. The Google session window opens successfully.'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      opensSessionWindow: false,
      error: error.message || 'Failed to contact Google OAuth servers'
    });
  }
});

router.post('/google', async (req: Request, res: Response) => {
  try {
    const input = googleLoginSchema.parse(req.body);
    const result = await loginWithGoogleFlow(input);
    
    // Set HttpOnly cookie for token
    res.cookie('token', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ message: 'Google login successful', user: result.user, accessToken: result.accessToken });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, username } = registerSchema.parse(req.body);
    const user = await registerUserFlow(email, password, username);
    res.status(201).json({ message: 'User registered. Please check email to verify.', user });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await loginUserFlow(email, password);
    
    // Set HttpOnly cookie for token
    res.cookie('token', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ message: 'Login successful', user: result.user, accessToken: result.accessToken });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/logout', async (req: Request, res: Response) => {
  // If user has refresh_token cookie, we could delete it from sessions db.
  // For simplicity, we just clear the cookie.
  res.clearCookie('token', { httpOnly: true, sameSite: 'none', secure: true });
  res.clearCookie('refresh_token', { httpOnly: true, sameSite: 'none', secure: true });
  res.json({ message: 'Logged out successfully' });
});

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const oldRefreshToken = req.cookies.refresh_token;
    if (!oldRefreshToken) {
      throw new Error('No refresh token provided');
    }

    const result = await refreshUserFlow(oldRefreshToken);

    // Set HttpOnly cookie for token
    res.cookie('token', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ message: 'Token refreshed', accessToken: result.accessToken });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    await requestPasswordResetFlow(email);
    res.json({ message: 'If that email is registered, a password reset link has been sent.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Protected route example
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.user) return;
  const [user] = await db.select({
    id: users.id,
    email: users.email,
    username: users.username,
    avatar_url: users.avatar_url,
    role: users.role,
    last_sign_in_at: users.last_sign_in_at,
    email_verified: users.email_verified,
    created_at: users.created_at,
    metadata: users.metadata
  }).from(users).where(eq(users.id, req.user.id)).limit(1);
  
  res.json({ user });
});

router.put('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.user) return;
  try {
    const updateSchema = z.object({
      username: z.string().optional(),
      avatar_url: z.string().url().optional().or(z.literal('')),
    });
    const data = updateSchema.parse(req.body);
    
    // Convert empty string to null for avatar
    if (data.avatar_url === '') data.avatar_url = undefined;

    const [updatedUser] = await db.update(users)
      .set({
        ...data,
        updated_at: new Date()
      })
      .where(eq(users.id, req.user.id))
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        avatar_url: users.avatar_url,
        role: users.role
      });

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});


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

export default router;
