import cookieParser from 'cookie-parser';
import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import emailRouter from '../src/email/email.controller';
import adminRouter from '../src/admin/admin.controller';
import apiKeysRouter from '../src/api-keys/api-keys.controller';
import * as emailService from '../src/email/email.service';
import { apiKeys, users } from '../src/db/schema';

const TEST_SERVICE_KEY = 'sk_live_test_service_key_for_unit_tests';
process.env.SERVICE_API_KEY = TEST_SERVICE_KEY;

// Mock the DB
let mockTable: any = null;

vi.mock('../src/db', () => ({
  db: {
    select: vi.fn().mockImplementation(() => {
      const chain: any = {
        from: vi.fn().mockImplementation((table: any) => {
          mockTable = table;
          return chain;
        }),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockImplementation(() => chain),
        limit: vi.fn().mockImplementation(() => {
          // If searching api_keys table for hash match, return empty unless explicitly set
          if (mockTable === apiKeys || (mockTable && String(mockTable).includes('api_keys')) || (mockTable && (mockTable as any)[Symbol.for('drizzle:Name')] === 'api_keys')) {
            return Promise.resolve([]);
          }
          return Promise.resolve([
            { id: '11111111-1111-1111-1111-111111111111', email: 'admin@example.com', role: 'admin' }
          ]);
        }),
        then: (resolve: any) => {
          if (mockTable === apiKeys || (mockTable && String(mockTable).includes('api_keys')) || (mockTable && (mockTable as any)[Symbol.for('drizzle:Name')] === 'api_keys')) {
            return Promise.resolve([{ id: 'key-1', name: 'Test Key', key_prefix: 'sk_live_123...' }]).then(resolve);
          }
          return Promise.resolve([
            { id: '11111111-1111-1111-1111-111111111111', email: 'admin@example.com', role: 'admin' }
          ]).then(resolve);
        },
      };
      return chain;
    }),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: 'key-1', name: 'Test Key' }]),
    update: vi.fn().mockImplementation(() => ({
      set: vi.fn().mockImplementation(() => ({
        where: vi.fn().mockImplementation(() => ({
          execute: vi.fn().mockResolvedValue([])
        }))
      }))
    })),
    delete: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue([]),
  },
}));

// Mock email sending
vi.mock('../src/email/email.service', () => ({
  sendEmail: vi.fn().mockResolvedValue({
    isEthereal: false,
    from: 'learncatterpiweb@gmail.com',
    messageId: '<test-message-id@domain>',
    previewUrl: undefined,
  }),
  getSmtpStatus: vi.fn().mockReturnValue({
    isConfigured: true,
    host: 'smtp.gmail.com',
    port: 465,
    from: 'learncatterpiweb@gmail.com',
    user: 'learncatterpiweb@gmail.com',
    isEthereal: false,
  }),
}));

const app = express();
app.use(express.json());
app.use(cookieParser());

// Public health route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/email', emailRouter);
app.use('/api/admin', adminRouter);
app.use('/api/keys', apiKeysRouter);

describe('SERVICE_API_KEY Endpoint Security & Received Payloads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SERVICE_API_KEY = TEST_SERVICE_KEY;
  });

  describe('1. Public Endpoints (No Auth Required)', () => {
    it('GET /api/health returns 200 and health payload', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('time');
      console.log('Received from GET /api/health:', JSON.stringify(res.body));
    });

    it('GET /api/email/status returns 200 with SMTP configuration status', async () => {
      const res = await request(app).get('/api/email/status');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('isConfigured', true);
      expect(res.body).toHaveProperty('host', 'smtp.gmail.com');
      expect(res.body).toHaveProperty('serviceKeyConfigured', true);
      console.log('Received from GET /api/email/status:', JSON.stringify(res.body));
    });
  });

  describe('2. Unauthorized Requests (Missing or Invalid SERVICE_API_KEY)', () => {
    it('POST /api/email/preview rejects with 401 when no key provided', async () => {
      const res = await request(app)
        .post('/api/email/preview')
        .send({ template: 'welcome', data: { name: 'Alice', appName: 'Demo' } });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        error: 'Unauthorized: Missing x-api-key header or active login session'
      });
      console.log('Received without API key:', JSON.stringify(res.body));
    });

    it('POST /api/email/preview rejects with 401 when invalid key provided', async () => {
      const res = await request(app)
        .post('/api/email/preview')
        .set('x-api-key', 'invalid-key-xyz')
        .send({ template: 'welcome', data: { name: 'Alice', appName: 'Demo' } });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        error: 'Unauthorized: Invalid API Key'
      });
      console.log('Received with invalid API key:', JSON.stringify(res.body));
    });

    it('POST /api/email/test rejects with 401 when no key provided', async () => {
      const res = await request(app)
        .post('/api/email/test')
        .send({ to: 'user@example.com', subject: 'Hi', message: 'Hello' });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Unauthorized');
    });

    it('GET /api/admin/db-dump rejects with 401 when no credentials provided', async () => {
      const res = await request(app).get('/api/admin/db-dump');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('3. Authorized Requests using SERVICE_API_KEY via x-api-key header', () => {
    it('POST /api/email/preview returns 200 and rendered HTML with valid key and payload', async () => {
      const payload = {
        template: 'welcome',
        data: {
          name: 'Alex',
          appName: 'Live Cloud App',
          dashboardLink: 'https://example.com/dashboard'
        }
      };

      const res = await request(app)
        .post('/api/email/preview')
        .set('x-api-key', TEST_SERVICE_KEY)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('subject');
      expect(res.body).toHaveProperty('html');
      expect(res.body.html).toContain('Alex');
      console.log('Received from POST /api/email/preview (x-api-key):', {
        success: res.body.success,
        subject: res.body.subject,
        htmlSnippet: res.body.html.substring(0, 80) + '...'
      });
    });

    it('POST /api/email/preview returns 400 when template or data is missing', async () => {
      const res = await request(app)
        .post('/api/email/preview')
        .set('x-api-key', TEST_SERVICE_KEY)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: 'Missing required fields: template, data'
      });
      console.log('Received on validation error:', JSON.stringify(res.body));
    });

    it('POST /api/email/preview returns 400 when invalid template specified', async () => {
      const res = await request(app)
        .post('/api/email/preview')
        .set('x-api-key', TEST_SERVICE_KEY)
        .send({ template: 'non_existent_template', data: { name: 'Bob' } });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: 'Invalid template selected'
      });
    });

    it('POST /api/email/test returns 200 and delivery details with valid payload', async () => {
      const res = await request(app)
        .post('/api/email/test')
        .set('x-api-key', TEST_SERVICE_KEY)
        .send({
          to: 'recipient@example.com',
          subject: 'Production Notification',
          message: 'This is a test notification.'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('sender');
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        'recipient@example.com',
        'Production Notification',
        'This is a test notification.',
        undefined,
        'custom',
        expect.any(String)
      );
      console.log('Received from POST /api/email/test:', JSON.stringify(res.body));
    });

    it('POST /api/email/test returns 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/email/test')
        .set('x-api-key', TEST_SERVICE_KEY)
        .send({ to: 'recipient@example.com' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: 'Missing required fields: to, subject, message'
      });
    });

    it('POST /api/email/template returns 200 and sends templated email', async () => {
      const res = await request(app)
        .post('/api/email/template')
        .set('x-api-key', TEST_SERVICE_KEY)
        .send({
          to: 'client@example.com',
          template: 'invoice',
          data: {
            name: 'Acme Corp',
            amount: '$99.00',
            invoiceId: 'INV-2026-001',
            appName: 'My SaaS'
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('message');
      console.log('Received from POST /api/email/template:', JSON.stringify(res.body));
    });

    it('GET /api/admin/db-dump returns 200 and DB collections with SERVICE_API_KEY', async () => {
      const res = await request(app)
        .get('/api/admin/db-dump')
        .set('x-api-key', TEST_SERVICE_KEY);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('users');
      expect(res.body).toHaveProperty('sessions');
      expect(res.body).toHaveProperty('apiKeys');
      expect(res.body).toHaveProperty('emailMessages');
      expect(res.body).toHaveProperty('aiLogs');
      console.log('Received from GET /api/admin/db-dump keys:', Object.keys(res.body));
    });

    it('GET /api/keys/list returns 200 and user keys with SERVICE_API_KEY', async () => {
      const res = await request(app)
        .get('/api/keys/list')
        .set('x-api-key', TEST_SERVICE_KEY);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('keys');
      console.log('Received from GET /api/keys/list:', JSON.stringify(res.body));
    });
  });

  describe('4. Authorized Requests using SERVICE_API_KEY via Authorization: Bearer Header', () => {
    it('POST /api/email/preview accepts Authorization: Bearer <key>', async () => {
      const res = await request(app)
        .post('/api/email/preview')
        .set('Authorization', `Bearer ${TEST_SERVICE_KEY}`)
        .send({
          template: 'welcome',
          data: { name: 'Bearer User', appName: 'Demo App' }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.html).toContain('Bearer User');
      console.log('Received via Authorization Bearer:', {
        status: res.status,
        success: res.body.success,
        subject: res.body.subject
      });
    });

    it('GET /api/admin/db-dump accepts Authorization: Bearer <key>', async () => {
      const res = await request(app)
        .get('/api/admin/db-dump')
        .set('Authorization', `Bearer ${TEST_SERVICE_KEY}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('users');
    });
  });
});
