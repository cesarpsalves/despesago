import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve('/Users/pauloalves/Documents/prestacao-contas/.env') });

import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function test() {
  console.log('--- Testing Public Schema ---');
  const pubClient = createClient(url, key); // default is public
  const { data: pubData, error: pubError } = await pubClient.from('_test_any').select('*').limit(1);
  // It's okay if table doesn't exist, we want to see the error message
  console.log('Public Schema Error:', pubError?.message || 'None');

  console.log('\n--- Testing app_expense_b2b Schema ---');
  const appClient = createClient(url, key, { db: { schema: 'app_expense_b2b' } });
  const { data: appData, error: appError } = await appClient.from('expenses').select('*').limit(1);
  console.log('app_expense_b2b Error:', appError?.message || 'None');
}

test();
