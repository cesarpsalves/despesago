# DespesaGo 🚀
### Professional B2B SaaS for AI-Powered Expense Management

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)

DespesaGo is a modern, enterprise-grade B2B SaaS platform designed to streamline corporate expense tracking and reimbursement using Artificial Intelligence (OCR). Built with a secure **Multi-tenant Architecture**, it ensures complete data isolation for multiple companies while providing a "Zero Friction" experience for employees.

---

## ✨ Key Features

- **Autonomous AI OCR**: Powered by OpenAI, the system intelligently processes receipt photos/PDFs and extracts structured JSON data (Amount, Merchant, Date, Category, and OCR Confidence).
- **Multi-tenant Data Isolation**: Strict B2B isolation using **Row Level Security (RLS)** at the PostgreSQL level (Supabase), preventing any data leakage between different organizations.
- **Seamless Auth Lifecycle**: Passwordless Magic Link logins optimized via high-deliverability SMTP (Resend), including secure password recovery and Cloudflare Turnstile (CAPTCHA) protection.
- **Premium UX / Mobile-First**: A sleek, Apple-inspired interface built with React, Tailwind CSS, and Framer Motion for fluid micro-interactions.
- **Automated Billing Integration**: Integrated with Asaas for B2B subscription management and automated billing.

---

## 🧱 Architecture & Technology Stack

### 🌐 Frontend
- **React 18 + Vite**: Ultra-fast SPA with optimized bundle loading.
- **TypeScript**: Full type safety across routes, states, and API communication.
- **Tailwind CSS + Headless UI**: Custom design system with curated color palettes (Slate, Emerald) and smooth transitions.
- **Framer Motion**: Graceful async states (Skeletons, Empty States) and page transitions.

### ⚙️ Backend (Orchestration Layer)
- **Node.js (Express) + TypeScript**: Acting as a light integration bus between the frontend and specialized service layers.
- **Multi-Agent AI System**: 
  - **Receipt Agent**: OCR processing and data extraction.
  - **Insights Agent**: Expenditure analysis and feedback.
  - **Behavior Agent**: Historical trend analysis.

### 🗄️ Infrastructure & Security
- **Self-Hosted Supabase (PostgreSQL 15)**: 
  - Private application schemas (security-first, avoiding `public` schema).
  - Production-ready Docker deployment on VPS.
- **Security Pillars**:
  - **Cloudflare Turnstile**: Integrated CAPTCHA to prevent brute-force attacks.
  - **JWT Authentication**: Secure session management.
  - **Database Level RLS**: Mandatory `company_id` check for every single query.

---

## 🚀 Getting Started (Local Setup)

### 1. Prerequisites
- **Node.js**: v18+ 
- **Docker**: For running Supabase self-hosted or local instance.
- **API Keys**: OpenAI, Supabase, and Resend.

### 2. Environment Configuration
Clone the repository and set up your environment variables:
```bash
cp .env.example .env
```
Fill in the `.env` file with your actual keys.

### 3. Installation
```bash
# Install root dependencies
npm install

# Start Backend (OCR & Logic)
cd backend && npm install && npm run dev

# Start Frontend (React App)
cd ../frontend && npm install && npm run dev
```
The application will be available at `http://localhost:5173`.

---

## 🏗 Repository Structure

```text
├── backend/      # Business logic, AI integrations (OpenAI), Node controllers.
├── frontend/     # React SPA, Mobile-first views, Auth logic.
├── database/     # PostgreSQL definitions, Migrations, and RLS policies.
├── docs/         # Functional documentation and design specifications.
├── .env.example  # Documented template for collaborators.
└── README.md     # This technical overview.
```

---

## 👨‍💻 Author
**Cesar P. S. Alves** - [GitHub Profile](https://github.com/cesarpsalves)

*DespesaGo - Crafted with ❤️ for B2B Expense Automation.*
