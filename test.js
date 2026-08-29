async function runTests() {
  const baseUrl = 'http://localhost:3000';
  const email = `testuser_${Date.now()}@example.com`;
  const password = 'Password123!';

  console.log('--- 1. Testing Registration ---');
  let res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  console.log('Register status:', res.status);
  let data = await res.json();
  console.log('Register response:', data);

  console.log('\n--- 2. Testing Login ---');
  res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  console.log('Login status:', res.status);
  data = await res.json();
  console.log('Login response:', data);
  
  let cookie = res.headers.get('set-cookie');
  let token = data.accessToken;
  console.log('Got cookie:', !!cookie, 'Got token:', !!token);

  if (!token && cookie) {
     const match = cookie.match(/token=([^;]+)/);
     if (match) token = match[1];
  }

  if (!token) {
    console.log("No token available. Aborting rest of tests.");
    return;
  }

  console.log('\n--- 3. Testing API Key Generation ---');
  res = await fetch(`${baseUrl}/api/keys/generate`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({ name: 'Test Key' })
  });
  console.log('Generate Key status:', res.status);
  data = await res.json();
  console.log('Generate Key response:', data);
  const apiKey = data.apiKey;

  if (!apiKey) {
    console.log("No API key returned. Aborting rest of tests.");
    return;
  }

  console.log('\n--- 4. Testing API Key List ---');
  res = await fetch(`${baseUrl}/api/keys`, {
    headers: { 
      'Authorization': `Bearer ${token}` 
    }
  });
  console.log('List Keys status:', res.status);
  data = await res.json();
  console.log('List Keys response:', data);

  console.log('\n--- 5. Testing Email Microservice with API Key ---');
  res = await fetch(`${baseUrl}/api/email/test`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    },
    body: JSON.stringify({
      to: 'test@example.com',
      subject: 'Integration Test',
      message: 'This is a test message.'
    })
  });
  console.log('Email Test status:', res.status);
  data = await res.json();
  console.log('Email Test response:', data);
}

runTests().catch(console.error);
