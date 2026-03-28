import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve('../.env') });

import { receiptAgent } from './src/services/agents/receiptAgent.js';

async function test() {
  console.log('Testing receiptAgent extraction...');
  try {
    // Empty base64 or dummy
    const res = await receiptAgent.extract('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
    console.log('Result:', res);
  } catch (err: any) {
    console.error('Error:', err.message);
    if (err.stack) console.error(err.stack);
  }
}

test();
