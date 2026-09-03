const { spawn } = require('child_process');
const child = spawn('npx', ['tsx', '-e', `
import { registerUserFlow } from './src/flow/register.flow'; 
async function run() { 
  try { 
    console.log('registering...');
    await registerUserFlow('test2@example.com', 'password123'); 
    console.log('registered!'); 
  } catch(e) { 
    console.error(e); 
  } 
  process.exit(0);
} 
run();
`]);
child.stdout.on('data', d => console.log(d.toString()));
child.stderr.on('data', d => console.error(d.toString()));
