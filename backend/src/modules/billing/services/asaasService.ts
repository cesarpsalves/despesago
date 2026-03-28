import config from "../../../config/env.js";
import { OpenAI } from "openai";

export const asaasService = {
  getHeaders: () => {
    const apiKey = config.asaas.apiKey;
    if (!apiKey) throw new Error('ASAAS_API_KEY não configurada no .env');
    return {
      'Content-Type': 'application/json',
      'access_token': apiKey
    };
  },

  getBaseUrl: () => {
    return config.asaas.apiUrl;
  },

  // Cria um Customer (Cliente) no ASAAS retornando o ID do cliente deles
  createCustomer: async (name: string, email: string, document: string) => {
    const response = await fetch(`${asaasService.getBaseUrl()}/customers`, {
      method: 'POST',
      headers: asaasService.getHeaders(),
      body: JSON.stringify({ name, email, cpfCnpj: document })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.errors?.[0]?.description || 'Erro ao criar customer ASAAS');
    
    return data.id; // Ex: cus_00000503...
  },

  // Cria uma assinatura recorrente
  createSubscription: async (customerId: string, value: number, cycle: 'MONTHLY' | 'YEARLY', externalReference?: string) => {
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 1); // Vence amanha (tempo habil de teste via PIX)
    
    // YYYY-MM-DD
    const isoDate = nextDueDate.toISOString().split('T')[0];

    const response = await fetch(`${asaasService.getBaseUrl()}/subscriptions`, {
      method: 'POST',
      headers: asaasService.getHeaders(),
      body: JSON.stringify({
        customer: customerId,
        billingType: 'UNDEFINED', // Deixa em aberto para o usuário pagar via Boleto/Pix/Cartão no app do Asaas
        nextDueDate: isoDate,
        value,
        cycle,
        description: `Plano PRO (${cycle}) - DespesaGo Expense Tracker`,
        externalReference: externalReference || `DGO_SUBS_${Date.now()}`
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.errors?.[0]?.description || 'Erro ao criar assinatura ASAAS');

    // Retorna ID e Link de pagamento manual (caso fiquemos sem UI direto pro cartão)
    return {
      subscriptionId: data.id, 
      paymentLink: data.invoiceUrl 
    };
  }
};
