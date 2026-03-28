import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sobe de /backend/src/config/ para a raiz /
const envPath = path.resolve(__dirname, '../../../.env');

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
    webhookKey: process.env.ASAAS_WEBHOOK_KEY || '',
    apiUrl: process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    from: process.env.RESEND_FROM || 'DespesaGo <onboarding@resend.dev>',
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'contato@despesago.com.br',
    secure: process.env.SMTP_SECURE === 'true',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  apiUrl: process.env.VITE_API_URL || 'http://localhost:3000',
  isProduction: process.env.NODE_ENV === 'production',
};

// Shorthand for internal use
export const env = {
  ...config,
  RESEND_API_KEY: config.resend.apiKey,
  RESEND_FROM: config.resend.from,
  SMTP_HOST: config.smtp.host,
  SMTP_PORT: config.smtp.port,
  SMTP_USER: config.smtp.user,
  SMTP_PASS: config.smtp.pass,
  SMTP_FROM: config.smtp.from,
  SMTP_SECURE: config.smtp.secure ? 'true' : 'false',
};


// Validação básica para ajudar no debug
if (!config.supabase.url || !config.supabase.serviceRoleKey) {
  if (!config.isProduction) {
    console.warn('⚠️  Aviso: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontradas no ambiente.');
    console.log(`🔍 Tentando ler de: ${envPath}`);
  }
}

export default config;
