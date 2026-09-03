import { Router, Request, Response, NextFunction } from 'express';
import { registerUserFlow, loginUserFlow, requestPasswordResetFlow, loginWithGoogleFlow, verifyEmailFlow, refreshUserFlow } from '../flow';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

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

router.post('/google', async (req: Request, res: Response) => {
  try {
    const { credential } = z.object({ credential: z.string() }).parse(req.body);
    const result = await loginWithGoogleFlow(credential);
    
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
  res.clearCookie('token', { sameSite: 'none', secure: true });
  res.clearCookie('refresh_token', { sameSite: 'none', secure: true });
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

export default router;
