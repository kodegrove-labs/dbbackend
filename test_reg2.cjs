const { spawn } = require('child_process');
const child = spawn('npx', ['tsx', '-e', `
import { registerUserFlow } from './src/flow/register.flow'; 
async function run() { 
  try { 
    console.log('registering...');
    await registerUserFlow('test3@example.com', 'password123'); 
    console.log('registered!'); 
    // wait a bit for email to send
    await new Promise(r => setTimeout(r, 10000));
  } catch(e) { 
    console.error(e); 
  } 
  process.exit(0);
} 
run();
`]);
child.stdout.on('data', d => console.log(d.toString()));
child.stderr.on('data', d => console.error(d.toString()));
