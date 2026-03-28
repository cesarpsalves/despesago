import { createClient } from '@supabase/supabase-js';

// Obter as variáveis de ambiente com fallbacks para desenvolvimento
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Mensagem de erro mais informativa
console.log('Iniciando configuração do Supabase...');
if (!supabaseUrl) {
  console.error('Variável de ambiente VITE_SUPABASE_URL não encontrada');
}
if (!supabaseAnonKey) {
  console.error('Variável de ambiente VITE_SUPABASE_ANON_KEY não encontrada');
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Variáveis de ambiente VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY faltando.");
}

console.log('Conectando ao Supabase URL:', supabaseUrl);

// Configuração do cliente com logging adicional
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'app_expense_b2b'
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

console.log('Cliente Supabase configurado com sucesso');
