import type { Request, Response } from 'express';
import { asaasService } from '../services/asaasService.js';
import { supabaseAdmin, createScopedClient } from '../../../shared/db/supabaseClient.js';
import config from '../../../config/env.js';

export const billingController = {
  // Chamada via Painel do Gestor para contratar plano PRO
  subscribe: async (req: Request, res: Response) => {
    try {
      const { cycle } = req.body; // MONTHLY or YEARLY
      const authHeader = req.headers.authorization || '';
      const supabaseScoped = createScopedClient(authHeader);

      // Usando o Scoped pra confirmar as credenciais
      const { data: adminUser, error: adminError } = await supabaseScoped
        .from('users')
        .select('company_id, role, name, email')
        .single();
      
      if (adminError || !adminUser) throw new Error('Não autorizado');
      if (adminUser.role !== 'admin') throw new Error('Somente o admin da empresa pode assinar');

      const companyId = adminUser.company_id;

      // Usando Admin db client pra ler os dados CNPJ da empresa (que pode estar oculta por scopes restritos caso o RLS fique pesado demais aqui, mas ok)
      const { data: company, error: companyErr } = await supabaseAdmin.from('companies').select('*').eq('id', companyId).single();
      if (companyErr || !company) throw new Error('Dados cadastrais da empresa não encontrados.');
      
      // 1. Criar ou Recuperar o Customer ASAAS
      let externalCustomerId = company.external_customer_id;
      if (!externalCustomerId) {
        externalCustomerId = await asaasService.createCustomer(company.name, adminUser.email, company.document || undefined);
        // Atualiza a tabela com o reference do Asaas
        await supabaseAdmin.from('companies').update({ external_customer_id: externalCustomerId }).eq('id', companyId);
      }

      // 2. Definir Preço Base (Aproximação MVPs SaaS)
      const value = cycle === 'YEARLY' ? 490.00 : 49.90; // Exemplo de preço BRL

      // 3. Criar Subscrição (Com referência única do app + empresa)
      const { subscriptionId, paymentLink } = await asaasService.createSubscription(
        externalCustomerId, 
        value, 
        cycle, 
        `DGO_SUBS_${companyId}`
      );

      // 4. Salvar Subscrição no nosso DB como PENDING ainda
      const { error: insertError } = await supabaseAdmin.from('subscriptions').insert({
        company_id: companyId,
        asaas_customer_id: externalCustomerId,
        plan: 'pro',
        status: 'pending',
        billing_cycle: cycle.toLowerCase(),
        external_subscription_id: subscriptionId,
        current_period_end: new Date(new Date().setMonth(new Date().getMonth() + 1))
      });

      if (insertError) {
        console.error('Insert Subs Error:', insertError);
      }

      return res.status(200).json({ success: true, paymentLink });
    } catch (error: any) {
      console.error('Billing Err:', error);
      return res.status(400).json({ error: error.message });
    }
  },

  // Rota de Escuta (POST webhook ASAAS) NÃO deve usar Auth JWT
  webhook: async (req: Request, res: Response) => {
    try {
      // 1. Validação de Segurança (Token do Asaas)
      const asaasToken = req.headers['asaas-access-token'];
      if (asaasToken !== config.asaas.webhookKey) {
        console.warn('⚠️ Tentativa de Webhook não autorizado detectada.');
        return res.status(401).json({ error: 'Não autorizado' });
      }

      const { event, payment } = req.body;
      console.log('--- ASAAS WEBHOOK RECEBIDO ---', event);

      if (!payment || (!payment.subscription && event !== 'PAYMENT_RECEIVED')) {
        return res.status(200).send('Ignored - not subscription related');
      }

      const subscriptionId = payment.subscription;

      // Eventos de Pagamento
      if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        await supabaseAdmin.from('subscriptions')
          .update({ 
            status: 'active', 
            current_period_end: nextMonth.toISOString()
          })
          .eq('external_subscription_id', subscriptionId);
          console.log(`Subscrição ${subscriptionId} ativada/confirmada!`);
      } else if (event === 'PAYMENT_OVERDUE') {
        await supabaseAdmin.from('subscriptions')
          .update({ status: 'past_due' })
          .eq('external_subscription_id', subscriptionId);
          console.log(`Subscrição ${subscriptionId} inadimplente!`);
      } else if (event === 'PAYMENT_DELETED') {
        await supabaseAdmin.from('subscriptions')
          .update({ status: 'canceled' })
          .eq('external_subscription_id', subscriptionId);
          console.log(`Subscrição ${subscriptionId} removida/cancelada!`);
      }

      return res.status(200).send('OK');
    } catch (error: any) {
      console.error('Webhook Error:', error.message);
      return res.status(500).send('Error');
    }
  },

  // Consulta status detalhado de assinatura para o portal do cliente
  status: async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization || '';
      const supabaseScoped = createScopedClient(authHeader);

      const { data: user, error: userError } = await supabaseScoped
        .from('users')
        .select('company_id, role')
        .single();
      
      if (userError || !user) throw new Error('Não autorizado');
      const companyId = user.company_id;

      // 1. Pegar Assinatura Atual
      const { data: subscription, error: subsError } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // 2. Calcular Uso do Mês Atual (Recibos Escaneados)
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const { count: usageCount, error: countError } = await supabaseAdmin
        .from('expenses')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .gte('created_at', firstDayOfMonth.toISOString());

      if (countError) console.error('Count Error:', countError);

      // 3. Obter dados da empresa (external_customer_id)
      const { data: company } = await supabaseAdmin
        .from('companies')
        .select('name, external_customer_id')
        .eq('id', companyId)
        .single();

      return res.status(200).json({
        plan: subscription?.plan || 'free',
        status: subscription?.status || 'active',
        current_period_end: subscription?.current_period_end,
        usage: {
          current: usageCount || 0,
          limit: subscription?.plan === 'pro' ? 5000 : 50 // Limites exemplares
        },
        company: {
          name: company?.name,
          has_external_id: !!company?.external_customer_id
        }
      });
    } catch (error: any) {
      console.error('Billing Status Err:', error);
      return res.status(400).json({ error: error.message });
    }
  }
};
