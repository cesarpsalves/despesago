# Language

Always write:

* code
* file names
* variables
* function names
* commit messages
* technical documentation

in **English**.

Explain concepts and guidance to the user in **Portuguese**.

# Code Quality

Prefer code that is:

* clear
* maintainable
* production-ready

Guidelines:

* Prefer simple solutions before complex architectures.
* Avoid unnecessary abstractions.
* Avoid overengineering.
* Use meaningful names for functions, variables and files.
* Keep functions small and focused.

# Project Structure

Prefer well-structured projects.

Typical structure:

backend/
frontend/
database/
docs/
scripts/

Rules:

* Avoid mixing unrelated components in the same folder.
* Keep configuration files organized.
* Separate business logic from infrastructure code.

# Version Control

Assume **Git** is always used.

Prefer **GitHub** when a remote repository is required.

Commit rules:

* Write clear and concise commit messages.
* Group related changes in a single commit.
* Avoid large unrelated commits.

# Database

When a database is required:

Prefer **PostgreSQL**.

Use **Supabase** as the managed PostgreSQL platform.

## Database Organization

Each application must use its own PostgreSQL schema.

Schema naming pattern:

app_{project_name}

Examples:

app_delivery
app_petshop
app_scheduler

Never create tables in the **public** schema.

All tables must be created inside the application schema.

Example:

create table app_petshop.users (...)

## Table Conventions

Primary key:

id uuid primary key default gen_random_uuid()

Default columns:

created_at timestamp with time zone default now()
updated_at timestamp with time zone

Naming rules:

* tables: snake_case
* columns: snake_case

## Isolation Rule

Applications must never modify tables from other schemas.

Each application only manages its own schema.

Shared resources must use the **core** schema.

Example:

core.users
core.payments
core.notifications

# Dependencies

Dependency guidelines:

* Prefer stable and widely adopted libraries.
* Avoid unnecessary dependencies.
* Keep the dependency list minimal.
* When adding a dependency, explain why it is required.

# Security

Security rules:

* Never expose API keys or secrets in code.
* Always use environment variables for credentials.
* Never hardcode secrets.
* Validate external inputs.
* Avoid insecure patterns.

# Development Workflow

Before making large changes:

1. Inspect the project structure
2. Understand dependencies
3. Propose an implementation plan
4. Implement incrementally
5. Avoid breaking existing functionality

Prefer **small and safe changes** instead of large refactors.

# Project Analysis

Before writing or modifying code:

1. Inspect the repository structure
2. Read relevant files
3. Understand the architecture
4. Identify dependencies
5. Then propose changes

Avoid making assumptions about the project structure.

# Feature Implementation

When implementing new features:

1. Understand the requirements
2. Propose an architecture
3. Confirm approach if the change is large
4. Implement step by step
5. Validate that existing features continue working

# API and Library Usage

When using APIs or libraries:

* Prefer official documentation
* Do not invent functions or endpoints
* If uncertain, ask for clarification
* Prefer stable and documented features

# General Behavior

When working with an existing project:

* Analyze the project before making changes.
* Preserve existing architecture when possible.
* Improve code without introducing breaking changes.

# MCP Tools

When MCP tools are available, prefer using them instead of simulating behavior.

Examples:

* Use GitHub MCP for repository operations
* Use filesystem MCP to inspect project files
* Use Supabase MCP for database operations

# Code Reuse

Prefer reusing existing code instead of creating duplicate implementations.
# Multi-Agent System Rules

## Architecture

The system must follow an orchestrator-based architecture.

- Agents must NOT communicate with each other directly
- All communication must go through the orchestrator

## Agent Design

Each agent must:

- have a single responsibility
- return structured outputs
- avoid unnecessary text
- be deterministic and predictable

## Output Rules

- Prefer JSON outputs for system communication
- Avoid free-form responses between agents
- Keep outputs minimal and consistent

## Performance

- Agents must respond quickly
- Avoid long or complex reasoning chains
- Prefer speed over completeness

## Simplicity

- Avoid adding new agents unless strictly necessary
- Prefer improving existing agents over creating new ones

# Supabase Self-Hosted Rules

This project uses a self-hosted Supabase instance.

## Schema Usage (STRICT)

- NEVER use the public schema
- ALWAYS use the application schema

Schema name must follow:

app_{project_name}

Example:
app_expense

## Query Rules

All database queries MUST explicitly reference the schema.

Example:

select * from app_expense.expenses;

Never rely on default schema resolution.

## MCP Integration

When using Supabase MCP:

- Always specify the schema in operations
- Ensure MCP queries are scoped to the application schema
- Do not assume MCP defaults to the correct schema

## Migrations

All schema and table creation must be done via SQL migrations.

Example:

create schema if not exists app_expense;

create table app_expense.expenses (
  id uuid primary key default gen_random_uuid(),
  amount numeric not null,
  date date not null,
  merchant text,
  category text,
  confidence numeric,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone
);

## Security

- Do not expose schema-wide permissions unnecessarily
- Prefer least privilege access
- Validate all inputs before database operations

# Multi-Agent + Database Integration

## Data Ownership

- The orchestrator is responsible for triggering database writes
- Agents MUST NOT directly write to the database

## Data Flow

1. receipt_reader_agent → extracts structured data
2. orchestrator → validates and stores in database
3. insight_agent → reads from database or receives context
4. behavior_agent → analyzes historical data

## Consistency

- Database is the single source of truth
- Agents must rely on structured data, not assumptions

## Logging

- All agent outputs should be logged before persistence
- This enables debugging and traceability

# FINAL Architecture

Frontend
   ↓
Orchestrator
   ↓
Receipt Agent
   ↓
Database (app_expense)
   ↓
Insight Agent
   ↓
Behavior Agent

MCP Integration:
- Read
- Write
- Debug
