/**
 * Live Endpoint Checker for SERVICE_API_KEY Verification
 *
 * Usage:
 *   npx tsx tests/live-endpoint-checker.ts
 *
 * Environment variables:
 *   SERVICE_API_KEY  - The service key defined in your environment / .env
 *   APP_URL          - Base URL (defaults to http://localhost:3000)
 */

import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const SERVICE_KEY = process.env.SERVICE_API_KEY || 'my-secret-service-key';

interface CheckResult {
  endpoint: string;
  method: string;
  authDescription: string;
  expectedStatus: number;
  actualStatus: number;
  durationMs: number;
  passed: boolean;
  receivedPayload: any;
}

const results: CheckResult[] = [];

function maskKey(key: string): string {
  if (!key) return '(not configured)';
  if (key.length <= 12) return key;
  return `${key.substring(0, 10)}...${key.substring(key.length - 4)}`;
}

async function requestEndpoint(
  endpoint: string,
  method: 'GET' | 'POST',
  headers: Record<string, string>,
  body?: any
): Promise<{ status: number; durationMs: number; data: any }> {
  const start = Date.now();
  const url = `${BASE_URL}${endpoint}`;

  const reqInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    reqInit.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, reqInit);
    const durationMs = Date.now() - start;
    let data: any;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }
    return { status: res.status, durationMs, data };
  } catch (error: any) {
    const durationMs = Date.now() - start;
    return {
      status: 0,
      durationMs,
      data: { error: 'Network / Connection failed', details: error.message },
    };
  }
}

async function runCheck(
  name: string,
  endpoint: string,
  method: 'GET' | 'POST',
  authDescription: string,
  headers: Record<string, string>,
  expectedStatus: number,
  body?: any,
  validate?: (data: any) => boolean
) {
  console.log(`\n----------------------------------------------------------------------`);
  console.log(`🔍 [${method}] ${endpoint}`);
  console.log(`   Description: ${name}`);
  console.log(`   Auth Method: ${authDescription}`);
  if (body) {
    console.log(`   Sent Body:   ${JSON.stringify(body)}`);
  }

  const { status, durationMs, data } = await requestEndpoint(endpoint, method, headers, body);

  const statusMatch = status === expectedStatus;
  const customPass = validate ? validate(data) : true;
  const passed = statusMatch && customPass;

  console.log(`   HTTP Status: ${status === expectedStatus ? `\x1b[32m${status}\x1b[0m` : `\x1b[31m${status} (Expected ${expectedStatus})\x1b[0m`} (${durationMs}ms)`);
  console.log(`   Received Payload:`);
  console.dir(data, { depth: 4, colors: true });

  if (passed) {
    console.log(`   Verdict:     \x1b[32m✔ PASSED\x1b[0m`);
  } else {
    console.log(`   Verdict:     \x1b[31m✖ FAILED\x1b[0m`);
  }

  results.push({
    endpoint,
    method,
    authDescription,
    expectedStatus,
    actualStatus: status,
    durationMs,
    passed,
    receivedPayload: data,
  });
}

async function main() {
  console.log(`\n======================================================================`);
  console.log(`🚀 Live Endpoint & SERVICE_API_KEY Diagnostic Runner`);
  console.log(`======================================================================`);
  console.log(`Target URL:      ${BASE_URL}`);
  console.log(`SERVICE_API_KEY: ${maskKey(SERVICE_KEY)} (Length: ${SERVICE_KEY.length})`);
  console.log(`Timestamp:       ${new Date().toISOString()}`);

  // 1. Public Health Check
  await runCheck(
    'Server Health Check (Public)',
    '/api/health',
    'GET',
    'None (Public)',
    {},
    200,
    undefined,
    (d) => d && d.status === 'ok'
  );

  // 2. SMTP & Service Key Status Check
  await runCheck(
    'SMTP & Key Diagnostics Status',
    '/api/email/status',
    'GET',
    'None (Public)',
    {},
    200,
    undefined,
    (d) => d && typeof d.serviceKeyConfigured === 'boolean'
  );

  // 3. Email Preview: No Auth (Expect 401)
  await runCheck(
    'Preview Email without API Key',
    '/api/email/preview',
    'POST',
    'None (Unauthenticated)',
    {},
    401,
    { template: 'welcome', data: { name: 'Unauthorized Tester' } },
    (d) => d && d.error && d.error.includes('Unauthorized')
  );

  // 4. Email Preview: Invalid Key (Expect 401)
  await runCheck(
    'Preview Email with Invalid API Key',
    '/api/email/preview',
    'POST',
    'x-api-key: sk_invalid_key_999999',
    { 'x-api-key': 'sk_invalid_key_999999' },
    401,
    { template: 'welcome', data: { name: 'Invalid Key Tester' } },
    (d) => d && d.error && d.error.includes('Unauthorized')
  );

  // 5. Email Preview: Valid SERVICE_API_KEY via x-api-key (Expect 200)
  await runCheck(
    'Preview Email with Valid SERVICE_API_KEY via x-api-key',
    '/api/email/preview',
    'POST',
    'x-api-key: SERVICE_API_KEY',
    { 'x-api-key': SERVICE_KEY },
    200,
    {
      template: 'welcome',
      data: {
        name: 'Alex Live',
        appName: 'Production App',
        dashboardLink: 'https://example.com/live',
      },
    },
    (d) => d && d.success === true && typeof d.html === 'string'
  );

  // 6. Email Preview: Valid SERVICE_API_KEY via Authorization: Bearer (Expect 200)
  await runCheck(
    'Preview Email with Valid SERVICE_API_KEY via Authorization: Bearer',
    '/api/email/preview',
    'POST',
    'Authorization: Bearer SERVICE_API_KEY',
    { Authorization: `Bearer ${SERVICE_KEY}` },
    200,
    {
      template: 'securityAlert',
      data: {
        name: 'Alex Live',
        appName: 'Production App',
        deviceName: 'Chrome on Linux',
        location: 'Singapore',
        reviewLink: 'https://example.com/security',
      },
    },
    (d) => d && d.success === true && typeof d.subject === 'string'
  );

  // 7. Email Preview: Missing Fields Validation (Expect 400)
  await runCheck(
    'Email Preview with Missing Template & Data',
    '/api/email/preview',
    'POST',
    'x-api-key: SERVICE_API_KEY',
    { 'x-api-key': SERVICE_KEY },
    400,
    {},
    (d) => d && d.error && d.error.includes('Missing required fields')
  );

  // 8. Custom Email Route: Validation with SERVICE_API_KEY (Missing Fields) (Expect 400)
  await runCheck(
    'Custom Email Validation (Missing to, subject, message)',
    '/api/email/test',
    'POST',
    'x-api-key: SERVICE_API_KEY',
    { 'x-api-key': SERVICE_KEY },
    400,
    { to: 'test@example.com' },
    (d) => d && d.error && d.error.includes('Missing required fields')
  );

  // 9. Database Admin Dump with SERVICE_API_KEY (Expect 200)
  await runCheck(
    'Admin Database Dump with SERVICE_API_KEY',
    '/api/admin/db-dump',
    'GET',
    'x-api-key: SERVICE_API_KEY',
    { 'x-api-key': SERVICE_KEY },
    200,
    undefined,
    (d) => d && Array.isArray(d.users)
  );

  // 10. API Keys Listing with SERVICE_API_KEY (Expect 200)
  await runCheck(
    'List API Keys with SERVICE_API_KEY',
    '/api/keys/list',
    'GET',
    'Authorization: Bearer SERVICE_API_KEY',
    { Authorization: `Bearer ${SERVICE_KEY}` },
    200,
    undefined,
    (d) => d && Array.isArray(d.keys)
  );

  // 11. Google Auth URL Generation (Expect 200)
  await runCheck(
    'Google OAuth Session URL Generation',
    '/api/auth/google/url',
    'GET',
    'Public / Anonymous',
    {},
    200,
    undefined,
    (d) => d && d.success === true && typeof d.url === 'string' && d.url.includes('accounts.google.com')
  );

  // 12. Google Session Window Endpoint Test (Expect 200, opensSessionWindow: true)
  await runCheck(
    'Google OAuth Session Window Test (Live Google Connect)',
    '/api/auth/google/test',
    'GET',
    'Public / Anonymous',
    {},
    200,
    undefined,
    (d) => d && d.success === true && d.opensSessionWindow === true
  );

  // Final Summary Table
  console.log(`\n======================================================================`);
  console.log(`📊 ENDPOINT CHECK SUMMARY TABLE`);
  console.log(`======================================================================`);

  const summary = results.map((r) => ({
    Endpoint: `${r.method} ${r.endpoint}`,
    Auth: r.authDescription.length > 25 ? r.authDescription.substring(0, 22) + '...' : r.authDescription,
    Expected: r.expectedStatus,
    Actual: r.actualStatus,
    Time: `${r.durationMs}ms`,
    Result: r.passed ? 'PASSED' : 'FAILED',
  }));

  console.table(summary);

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log(`\nTotal Checked: ${total} | Passed: \x1b[32m${passed}\x1b[0m | Failed: ${failed > 0 ? `\x1b[31m${failed}\x1b[0m` : '0'}`);

  if (failed > 0) {
    console.error(`\n❌ Some endpoint checks failed. Inspect logs above for details.`);
    process.exit(1);
  } else {
    console.log(`\n✅ All endpoints verified successfully with SERVICE_API_KEY!`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal error running live endpoint checker:', err);
  process.exit(1);
});
