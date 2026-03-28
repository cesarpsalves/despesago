-- Migration: 02_b2b_rls_policies.sql
-- Description: Implementa o Row Level Security assegurando que cada Query leia/edite apenas dados do seu PRÓPRIO Tenant (Empresa).

-- Função auxiliar que captura o UUID do App User com base no `auth.uid()` logado (JWT)
CREATE OR REPLACE FUNCTION app_expense_b2b.get_current_company_id() 
RETURNS uuid 
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT company_id 
  FROM app_expense_b2b.users 
  WHERE id = auth.uid() 
  LIMIT 1;
$$;

-- 1. Políticas da tabela USERS
-- O Usuário pode ver qualquer outro usuário DA MESMA EMPRESA
DROP POLICY IF EXISTS "users_same_company_read" ON app_expense_b2b.users;
CREATE POLICY "users_same_company_read" ON app_expense_b2b.users
  FOR SELECT TO authenticated
  USING (company_id = app_expense_b2b.get_current_company_id());

-- O Próprio usuário pode alterar seu nome/dados, ou o ADMIN da mesma empresa pode alterar
DROP POLICY IF EXISTS "users_update" ON app_expense_b2b.users;
CREATE POLICY "users_update" ON app_expense_b2b.users
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid() 
    OR 
    (company_id = app_expense_b2b.get_current_company_id() AND EXISTS (
      SELECT 1 FROM app_expense_b2b.users u WHERE u.id = auth.uid() AND u.role = 'admin'
    ))
  );

-- 2. Políticas da tabela COMPANIES
-- Cada usuário só visualiza sua PRÓPRIA empresa
DROP POLICY IF EXISTS "company_read" ON app_expense_b2b.companies;
CREATE POLICY "company_read" ON app_expense_b2b.companies
  FOR SELECT TO authenticated
  USING (id = app_expense_b2b.get_current_company_id());

-- 3. Políticas para EXPENSES
-- Funcionários podem ler/inserir/alterar as despesas DA PRÓPRIA EMPRESA.
DROP POLICY IF EXISTS "expenses_tenant_isolation" ON app_expense_b2b.expenses;
CREATE POLICY "expenses_tenant_isolation" ON app_expense_b2b.expenses
  FOR ALL TO authenticated
  USING (company_id = app_expense_b2b.get_current_company_id())
  WITH CHECK (company_id = app_expense_b2b.get_current_company_id());

-- 4. Políticas para COST CENTERS
DROP POLICY IF EXISTS "cost_centers_tenant_isolation" ON app_expense_b2b.cost_centers;
CREATE POLICY "cost_centers_tenant_isolation" ON app_expense_b2b.cost_centers
  FOR ALL TO authenticated
  USING (company_id = app_expense_b2b.get_current_company_id())
  WITH CHECK (company_id = app_expense_b2b.get_current_company_id());

-- 5. Políticas para CATEGORIES
-- Usuário pode ler categorias GLOBAIS (company_id nulo) OU as da própria empresa
DROP POLICY IF EXISTS "categories_read" ON app_expense_b2b.categories;
CREATE POLICY "categories_read" ON app_expense_b2b.categories
  FOR SELECT TO authenticated
  USING (company_id IS NULL OR company_id = app_expense_b2b.get_current_company_id());

-- 6. Políticas para WALLETS
DROP POLICY IF EXISTS "wallets_tenant_isolation" ON app_expense_b2b.wallets;
CREATE POLICY "wallets_tenant_isolation" ON app_expense_b2b.wallets
  FOR SELECT TO authenticated
  USING (company_id = app_expense_b2b.get_current_company_id());

DROP POLICY IF EXISTS "wallets_update" ON app_expense_b2b.wallets;
CREATE POLICY "wallets_update" ON app_expense_b2b.wallets
  FOR UPDATE TO authenticated
  USING (company_id = app_expense_b2b.get_current_company_id());
