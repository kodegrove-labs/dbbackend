import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

// Important: run drizzle schema push if necessary, but we will leave it manual or do it via script
// For simplicity in development, we'll let users run `npm run db:push` if they change schema

import adminRouter from './src/admin/admin.controller';
import authRouter from './src/auth/auth.controller';
import emailRouter from './src/email/email.controller';
import apiKeysRouter from './src/api-keys/api-keys.controller';
import { db } from './src/db';
import { users } from './src/db/schema';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000', // Update for allowed clients
    credentials: true,
  }));
  app.use(express.json());
  app.use(cookieParser());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/email', emailRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/keys', apiKeysRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
