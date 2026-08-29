async function check() {
  const url = 'http://localhost:3000';
  
  console.log('1. Checking Health (/api/health)...');
  try {
    const res = await fetch(`${url}/api/health`);
    console.log('Status:', res.status, await res.text());
  } catch(e) { console.error('Error:', e.message); }

  console.log('\n2. Checking Admin DB Dump (/api/admin/db-dump)...');
  try {
    const res = await fetch(`${url}/api/admin/db-dump`);
    console.log('Status:', res.status);
    const data = await res.json();
    if(data.error) console.log('Response Error:', data.error);
    else console.log('Users count:', data.users?.length);
  } catch(e) { console.error('Error:', e.message); }
  
  console.log('\n3. Checking Email Route (missing body) (/api/email/test)...');
  try {
    const res = await fetch(`${url}/api/email/test`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({}) });
    console.log('Status:', res.status, await res.text());
  } catch(e) { console.error('Error:', e.message); }
}
check();
