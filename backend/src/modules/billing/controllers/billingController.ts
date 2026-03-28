import type { Request, Response } from 'express';
import { asaasService } from '../services/asaasService.js';
import { supabaseAdmin, createScopedClient } from '../../../shared/db/supabaseClient.js';

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
      const { data: company } = await supabaseAdmin.from('companies').select('*').eq('id', companyId).single();
      
      // 1. Criar ou Recuperar o Customer ASAAS
      let externalCustomerId = company.external_customer_id;
      if (!externalCustomerId) {
        externalCustomerId = await asaasService.createCustomer(company.name, adminUser.email, company.document || undefined);
        // Atualiza a tabela com o reference do Asaas
        await supabaseAdmin.from('companies').update({ external_customer_id: externalCustomerId }).eq('id', companyId);
      }

      // 2. Definir Preço Base (Aproximação MVPs SaaS)
      const value = cycle === 'YEARLY' ? 490.00 : 49.90; // Exemplo de preço BRL

      // 3. Criar Subscrição
      const { subscriptionId, paymentLink } = await asaasService.createSubscription(externalCustomerId, value, cycle);

      // 4. Salvar Subscrição no nosso DB como PENDING ainda
      const { error: insertError } = await supabaseAdmin.from('subscriptions').insert({
        company_id: companyId,
        plan: 'pro',
        status: 'pending',
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
      const { event, payment } = req.body;
      console.log('--- ASAAS WEBHOOK RECEBIDO ---', event);

      if (!payment || !payment.subscription) {
        return res.status(200).send('Ignored - not subscription');
      }

      const subscriptionId = payment.subscription;

      // Eventos de Pagamento
      if (event === 'PAYMENT_RECEIVED') {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        await supabaseAdmin.from('subscriptions')
          .update({ 
            status: 'active', 
            current_period_end: nextMonth.toISOString()
          })
          .eq('external_subscription_id', subscriptionId);
          console.log(`Subscrição ${subscriptionId} ativada!`);
      } else if (event === 'PAYMENT_OVERDUE') {
        await supabaseAdmin.from('subscriptions')
          .update({ status: 'past_due' })
          .eq('external_subscription_id', subscriptionId);
          console.log(`Subscrição ${subscriptionId} inadimplente!`);
      }

      return res.status(200).send('OK');
    } catch (error: any) {
      console.error('Webhook Error:', error.message);
      return res.status(500).send('Error');
    }
  }
};
