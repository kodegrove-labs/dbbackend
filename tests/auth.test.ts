import cookieParser from 'cookie-parser';
import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import authRouter from '../src/auth/auth.controller';
import * as authFlow from '../src/flow';

// Mock the authentication service so we don't need a real database for route testing
vi.mock('../src/flow', () => ({
  registerUserFlow: vi.fn(),
  loginUserFlow: vi.fn(),
  requestPasswordResetFlow: vi.fn(),
}));

// Mock the DB and Middleware for the /me route
const { MOCK_UUID } = vi.hoisted(() => ({
  MOCK_UUID: '123e4567-e89b-12d3-a456-426614174000' as `${string}-${string}-${string}-${string}-${string}`
}));

vi.mock('../src/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([{ id: MOCK_UUID, email: 'test@example.com', email_verified: true }]),
  },
}));

vi.mock('../src/middleware/auth', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.user = { id: MOCK_UUID, email: 'test@example.com' };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRouter);

describe('Auth API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      vi.mocked(authFlow.registerUserFlow).mockResolvedValue({ id: MOCK_UUID, email: 'test@example.com' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.body.message).toContain('User registered');
      expect(response.body.user.email).toBe('test@example.com');
      expect(authFlow.registerUserFlow).toHaveBeenCalledWith('test@example.com', 'password123', undefined);
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'not-an-email', password: 'password123' });

      expect(response.status).toBe(400); // Zod validation failure
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login and return cookies', async () => {
      vi.mocked(authFlow.loginUserFlow).mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: { id: '123', email: 'test@example.com', email_verified: true },
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.accessToken).toBe('mock-access-token');
      
      // Check cookies
      const setCookieHeaders = response.headers['set-cookie'] as unknown as string[] | undefined;
      expect(setCookieHeaders).toBeDefined();
      if (setCookieHeaders) {
        expect(setCookieHeaders.some((cookie: string) => cookie.includes('token='))).toBeTruthy();
        expect(setCookieHeaders.some((cookie: string) => cookie.includes('refresh_token='))).toBeTruthy();
      }
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear authentication cookies', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send();

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out successfully');

      const setCookieHeaders = response.headers['set-cookie'] as unknown as string[] | undefined;
      expect(setCookieHeaders).toBeDefined();
      if (setCookieHeaders) {
        expect(setCookieHeaders.some((cookie: string) => cookie.includes('token=;'))).toBeTruthy();
      }
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return the current user based on the mock middleware', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .send();

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
    });
  });
});
