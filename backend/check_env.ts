import dotenv from 'dotenv';
import path from 'path';
const result = dotenv.config({ path: '../.env' });
console.log('Dotenv Result:', result);
console.log('CWD:', process.cwd());
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('OPENAI_API_KEY (last 4):', process.env.OPENAI_API_KEY?.slice(-4));
