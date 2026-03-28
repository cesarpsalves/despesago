import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Garante o path independente de onde é chamado
dotenv.config({ path: path.resolve(process.cwd(), '../.env') }); 

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('SUPABASE_URL or SUPABASE_KEY is missing in .env');
}

// Global Admin Client (CUIDADO: Se a chave for Service Role, ignora o RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'app_expense_b2b'
  }
});

/**
 * Cria um cliente do Supabase cujo contexto está "logado" como o usuário da requisição.
 * Isso garante que todas as queries respeitem as políticas RLS configuradas no banco.
 * Ideal para isolamento B2B puro.
 */
export const createScopedClient = (authHeader: string) => {
  return createClient(supabaseUrl, supabaseKey, {
    db: {
      schema: 'app_expense_b2b'
    },
    global: {
      headers: {
        Authorization: authHeader // Passa o JWT (Bearer ...), forçando o RLS no Postgres
      }
    }
  });
};

