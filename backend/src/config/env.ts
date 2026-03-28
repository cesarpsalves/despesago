import dotenv from 'dotenv';
import path from 'path';

/**
 * Este módulo centraliza o carregamento das variáveis de ambiente.
 * Ele tenta encontrar o arquivo .env na raiz do projeto (um nível acima de /backend).
 */

const envPath = path.resolve(process.cwd(), '../.env');

// Carrega o .env se ele existir (útil para desenvolvimento local direto com node/ts-node)
dotenv.config({ path: envPath });

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    schema: 'app_expense_b2b',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  asaas: {
    apiKey: process.env.ASAAS_API_KEY || '',
    apiUrl: process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  apiUrl: process.env.VITE_API_URL || 'http://localhost:3000',
  isProduction: process.env.NODE_ENV === 'production',
};

// Validação básica para ajudar no debug
if (!config.supabase.url || !config.supabase.serviceRoleKey) {
  if (!config.isProduction) {
    console.warn('⚠️  Aviso: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontradas no ambiente.');
    console.log(`🔍 Tentando ler de: ${envPath}`);
  }
}

export default config;
