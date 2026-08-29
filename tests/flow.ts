/**
 * Test Flow Script
 * 
 * This script will run a full authentication flow against the locally running server.
 * Make sure you start the server first using `npm run dev` before running this script.
 * 
 * Run with: npx tsx tests/flow.ts
 */

const API_URL = process.env.APP_URL || 'http://localhost:3000';
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'password12345!';

async function runTestFlow() {
  console.log(`\n🚀 Starting E2E Test Flow against ${API_URL}\n`);

  try {
    // 1. Health Check
    console.log('1️⃣ Checking server health...');
    let res = await fetch(`${API_URL}/api/health`);
    if (!res.ok) throw new Error('Health check failed. Is the server running?');
    console.log('✅ Server is up and running.\n');

    // 2. Register
    console.log(`2️⃣ Registering new user: ${TEST_EMAIL}`);
    res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
    });
    const registerData = await res.json();
    
    if (!res.ok) {
      console.log('❌ Registration failed:', registerData);
      throw new Error('Registration failed');
    }
    console.log('✅ Registration successful:', registerData.message, '\n');

    // 3. Login
    console.log('3️⃣ Logging in with newly created credentials...');
    res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
    });
    
    // We need to capture the cookies manually in Node fetch
    const setCookieHeader = res.headers.get('set-cookie');
    const authCookies = setCookieHeader ? setCookieHeader.split(',').map(c => c.split(';')[0]).join('; ') : '';
    const loginData = await res.json();

    if (!res.ok) {
      console.log('❌ Login failed:', loginData);
      throw new Error('Login failed');
    }
    console.log('✅ Login successful! Access Token received.\n');

    // 4. Get Current User (Protected Route)
    console.log('4️⃣ Testing protected route (/api/auth/me)...');
    res = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': authCookies, // Pass the captured cookies!
        // Alternatively, since we also got the accessToken in JSON body:
        // 'Authorization': `Bearer ${loginData.accessToken}`
      }
    });
    const meData = await res.json();

    if (!res.ok) {
      console.log('❌ Profile fetch failed:', meData);
      throw new Error('Profile fetch failed');
    }
    console.log(`✅ Profile retrieved securely. Logged in as: ${meData.user.email}\n`);

    // 5. Logout
    console.log('5️⃣ Testing logout...');
    res = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST'
    });
    
    if (!res.ok) {
      throw new Error('Logout failed');
    }
    console.log('✅ Logout successful.\n');
    
    console.log('🎉 All test flows completed successfully!');

  } catch (error) {
    console.error('\n🚨 TEST FLOW FAILED:', error);
  }
}

runTestFlow();
