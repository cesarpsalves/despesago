import { createClient } from '@supabase/supabase-js';
import config from '../../config/env.js';

const supabaseUrl = config.supabase.url;
const supabaseKey = config.supabase.serviceRoleKey || config.supabase.anonKey;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO CRÍTICO: Configurações do Supabase ausentes no .env');
}

// Global Admin Client (CUIDADO: Se a chave for Service Role, ignora o RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: config.supabase.schema
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
      schema: config.supabase.schema
    },
    global: {
      headers: {
        Authorization: authHeader // Passa o JWT (Bearer ...), forçando o RLS no Postgres
      }
    }
  });
};
