# DespesaGo API Documentation 📖

Esta documentação descreve os endpoints da API do **DespesaGo**, os formatos de dados esperados e os mecanismos de segurança aplicados.

---

## 🔐 Autenticação

A API utiliza **JWT (JSON Web Tokens)** via Supabase Auth.
Todas as rotas protegidas exigem o header `Authorization`:

```http
Authorization: Bearer <seu_jwt_token>
```

---

## 📑 Endpoints de Despesas

### 1. Listar Despesas
Retorna o histórico de despesas da empresa do usuário autenticado.

- **URL:** `/expenses`
- **Método:** `GET`
- **Segurança:** Autenticação Requerida + RLS (Isolamento por Empresa).
- **Resposta (200 OK):**
```json
[
  {
    "id": "uuid",
    "merchant": "Starbucks",
    "amount": 25.50,
    "date": "2024-03-27",
    "category": "Alimentação",
    "status": "pending"
  }
]
```

### 2. Processar Recibo (OCR + IA)
Envia uma imagem em Base64 para ser processada pela orquestração de agentes de IA.

- **URL:** `/expenses/process`
- **Método:** `POST`
- **Corpo da Requisição:**
```json
{
  "imageBase64": "data:image/jpeg;base64,..."
}
```
- **Validação:** Exige string Base64 com no mínimo 10 caracteres (Zod Schema).
- **Resposta (200 OK):**
```json
{
  "success": true,
  "expense": {
    "id": "uuid",
    "merchant": "Restaurante Silva",
    "amount": 150.00,
    "category": "Alimentação"
  },
  "analysis": {
    "behavior": "Gasto dentro da média mensal."
  }
}
```
- **Erros Comuns:**
  - `400 Validation Failed`: Dados ausentes ou formato inválido.
  - `401 Auth Required`: Token ausente ou expirado.
  - `403 Upgrade Required`: Limite do plano Free atingido.

---

## 🧪 Validação de Dados (Zod)

Todos os inputs são validados antes de atingir a lógica de negócio. Exemplo de Schema:

```typescript
const processExpenseSchema = z.object({
  imageBase64: z.string().min(10, "Base64 string is required")
});
```

---

## 📈 Limites de Plano

Os limites são aplicados via middleware (`planLimitsMiddleware`):
- **Plano Free:** Máximo de 5 usuários e 100 despesas processadas por mês.
- **Plano Pro:** Ilimitado.

---

*Documento gerado automaticamente para o Portfólio DespesaGo.*
