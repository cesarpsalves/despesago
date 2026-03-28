-- PASSO 1 — Permissões de Schema (Essencial para MCP e API)
grant usage on schema public to anon, authenticated;
grant usage on schema app_expense to anon, authenticated;

-- PASSO 2 — Permissões de Tabela (CRUD completo para os agentes)
grant select, insert, update, delete
on all tables in schema app_expense
to anon, authenticated;

alter default privileges in schema app_expense
grant select, insert, update, delete
on tables to anon, authenticated;

-- PASSO 3 — Otimização de Storage (Performance para embeddings OpenAI)
alter table app_expense.expenses
alter column embedding set storage extended;

-- PASSO 4 — Função e Trigger para updated_at automático
create or replace function app_expense.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
before update on app_expense.expenses
for each row
execute function app_expense.update_updated_at();

-- PASSO 5 — Índice de Unicidade Inteligente (Anti-duplicidade)
-- Evita que o mesmo recibo seja processado e salvo mais de uma vez
create unique index idx_expense_unique
on app_expense.expenses (amount, date, merchant);

-- EXEMPLOS DE TESTE (Rodar manualmente se necessário)
/*
-- Inserir gasto teste:
insert into app_expense.expenses
(amount, date, merchant, category, confidence)
values
(45.90, '2026-03-26', 'Uber', 'Transport', 0.95);

-- Buscar gastos:
select * from app_expense.expenses
order by created_at desc
limit 5;
*/
