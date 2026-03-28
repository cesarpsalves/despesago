-- Migration: 01_b2b_schema_and_tables.sql
-- Description: Creates the baseline multi-tenant database for the DespesaGo Corporate SaaS.

CREATE SCHEMA IF NOT EXISTS app_expense_b2b;

-- Grant usage to APIs (PostgREST needs this to serve the schema)
GRANT USAGE ON SCHEMA app_expense_b2b TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA app_expense_b2b GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA app_expense_b2b GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA app_expense_b2b GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

-- 1. Companies (A raiz do tenant)
CREATE TABLE IF NOT EXISTS app_expense_b2b.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  document text unique, -- CNPJ
  status text check (status in ('active', 'blocked', 'trial', 'cancelled')) default 'active',
  created_at timestamp with time zone default now()
);

-- 2. Users (Vinculado ao auth.users e à empresa)
CREATE TABLE IF NOT EXISTS app_expense_b2b.users (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references app_expense_b2b.companies(id) on delete cascade not null,
  role text check (role in ('admin', 'employee', 'manager')) default 'employee',
  name text not null,
  email text not null,
  active boolean default true,
  created_at timestamp with time zone default now()
);

-- 3. Subscriptions (Limites e planos Asaas)
CREATE TABLE IF NOT EXISTS app_expense_b2b.subscriptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references app_expense_b2b.companies(id) on delete cascade not null unique,
  asaas_customer_id text,
  asaas_subscription_id text,
  plan_type text check (plan_type in ('free', 'pro', 'enterprise')) default 'free',
  billing_cycle text check (billing_cycle in ('monthly', 'yearly')) default 'monthly',
  users_limit integer default 5,
  expenses_limit integer default 50,
  next_billing_date date,
  created_at timestamp with time zone default now()
);

-- 4. Categories (Categorias do sistema global = company_id is null)
CREATE TABLE IF NOT EXISTS app_expense_b2b.categories (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references app_expense_b2b.companies(id) on delete cascade,
  name text not null unique, -- Adicionado unique para facilitar idempotencia no insert
  icon text
);

-- Inserindo categorias base apenas se não existirem
INSERT INTO app_expense_b2b.categories (name, icon) 
SELECT v.name, v.icon
FROM (VALUES 
  ('Alimentação', '🍔'), 
  ('Combustível', '⛽'), 
  ('Transporte', '🚕'), 
  ('Hospedagem', '🏨'), 
  ('Manutenção', '🛠️'),
  ('Outros', '📦')
) AS v(name, icon)
WHERE NOT EXISTS (
  SELECT 1 FROM app_expense_b2b.categories c WHERE c.name = v.name AND c.company_id IS NULL
);

-- 5. Cost Centers (Centro de Custo, exigência B2B)
CREATE TABLE IF NOT EXISTS app_expense_b2b.cost_centers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references app_expense_b2b.companies(id) on delete cascade not null,
  name text not null,
  budget numeric(10,2),
  manager_id uuid references app_expense_b2b.users(id) on delete set null
);

-- 6. Expenses (A despesa corporativa isolada por tenant)
CREATE TABLE IF NOT EXISTS app_expense_b2b.expenses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references app_expense_b2b.companies(id) on delete cascade not null,
  user_id uuid references app_expense_b2b.users(id) on delete cascade not null,
  cost_center_id uuid references app_expense_b2b.cost_centers(id) on delete set null,
  category_id uuid references app_expense_b2b.categories(id) on delete set null,
  amount numeric(10,2) not null,
  date date not null,
  merchant text not null,
  receipt_url text, 
  confidence numeric(3,2),
  status text check (status in ('pending', 'approved', 'rejected', 'reimbursed')) default 'pending',
  ai_insight text,
  created_at timestamp with time zone default now()
);

-- 7. Wallets (Saldo / Adiantamento isolado por empresa e usuário)
CREATE TABLE IF NOT EXISTS app_expense_b2b.wallets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references app_expense_b2b.companies(id) on delete cascade not null,
  user_id uuid references app_expense_b2b.users(id) on delete cascade not null unique,
  balance numeric(10,2) default 0.00,
  updated_at timestamp with time zone default now()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) - O Coração B2B
-- ==========================================
ALTER TABLE app_expense_b2b.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_expense_b2b.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_expense_b2b.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_expense_b2b.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_expense_b2b.cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_expense_b2b.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_expense_b2b.wallets ENABLE ROW LEVEL SECURITY;

-- Nota de Segurança: As RLS Policies detalhadas (CREATE POLICY) serão adicionadas no próximo arquivo
-- conforme a estratégia Auth JWT seja estabelecida no backend.
