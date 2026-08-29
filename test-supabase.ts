import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.VITE_SUPABASE_URL as string;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const testId = crypto.randomUUID();
  console.log('Inserting into users...');
  const { data, error } = await supabase.from('users').insert([{
    id: testId,
    email: `test-${Date.now()}@mock.com`,
    password_hash: 'mock-hash'
  }]).select();
  
  if (error) {
    console.error('FAILED:', error);
  } else {
    console.log('SUCCESS:', data);
  }
}
test();
