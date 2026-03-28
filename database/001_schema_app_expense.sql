-- PASSO 1 — Criar schema
create schema if not exists app_expense;

-- PASSO 2 — Criar tabela principal otimizada
create table app_expense.expenses (
  id uuid primary key default gen_random_uuid(),

  amount numeric(10,2) not null,
  date date not null,
  merchant text not null,
  category text not null,

  confidence numeric(3,2) default 0,

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone
);

-- PASSO 3 — Índices de performance
create index idx_expenses_date
on app_expense.expenses(date);

create index idx_expenses_category
on app_expense.expenses(category);

create index idx_expenses_created_at
on app_expense.expenses(created_at desc);

-- PASSO 4 — Preparar para IA (busca vetorial)
create extension if not exists vector with schema public;

alter table app_expense.expenses
add column embedding vector(1536);
