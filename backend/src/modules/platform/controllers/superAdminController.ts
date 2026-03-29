import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../../../shared/db/supabaseClient.js';

export const superAdminController = {
  /**
   * Lista todas as empresas da plataforma (apenas para Platform Admin)
   */
  async listAllCompanies(req: Request, res: Response) {
    try {
      // Busca empresas e suas assinaturas
      // Busca empresas e suas assinaturas de forma segura
      const { data: companies, error } = await supabase
        .schema('app_expense_b2b')
        .from('companies')
        .select(`
          *,
          subscriptions:subscriptions(plan, status)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro na query de empresas (SuperAdmin):', error);
        throw error;
      }

      // Busca contagem de usuários para todas as empresas em paralelo
      const { data: allUsers, error: usersError } = await supabase
        .schema('app_expense_b2b')
        .from('users')
        .select('company_id');

      if (usersError) {
        console.warn('Erro ao buscar contagem de usuários, continuando com zero:', usersError);
      }

      const countMap: Record<string, number> = {};
      allUsers?.forEach(u => {
        if (u.company_id) {
          countMap[u.company_id] = (countMap[u.company_id] || 0) + 1;
        }
      });

      // Formata a resposta para facilitar no front
      const formatted = (companies || []).map(c => {
        const subs = Array.isArray(c.subscriptions) ? c.subscriptions : (c.subscriptions ? [c.subscriptions] : []);
        const activeSub = subs.find((s: any) => ['active', 'trialing'].includes(s.status)) 
          || subs.find((s: any) => s.status === 'pending')
          || subs[0];
          
        return {
          ...c,
          plan: activeSub?.plan || c.plan || 'free',
          status: activeSub?.status || c.status || 'inactive',
          user_count: countMap[c.id] || 0
        };
      });

      return res.json(formatted);
    } catch (error: any) {
      console.error('Erro ao listar empresas (SuperAdmin):', error);
      return res.status(500).json({ error: 'Erro ao carregar empresas da plataforma' });
    }
  },

  /**
   * Concede cortesia PRO para uma empresa específica
   */
  async grantProCourtesy(req: Request, res: Response) {
    const { companyId } = req.params;
    console.log(`[SuperAdmin] Iniciando upgrade de cortesia para empresa: ${companyId}`);

    try {
      // 1. Verifica se já existe assinatura registrada
      const { data: existingSub, error: fetchError } = await supabase
        .schema('app_expense_b2b')
        .from('subscriptions')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();

      if (fetchError) {
        console.error('[SuperAdmin] Erro ao buscar assinatura:', fetchError);
        throw fetchError;
      }

      if (existingSub) {
        console.log(`[SuperAdmin] Atualizando assinatura existente: ${existingSub.id}`);
        // Upgrade da assinatura existente
        const updateTasks = [
          supabase
            .schema('app_expense_b2b')
            .from('subscriptions')
            .update({ 
              plan: 'pro', 
              status: 'active',
              users_limit: 100,
              expenses_limit: 5000
            })
            .eq('id', (existingSub as any).id),
          supabase
            .schema('app_expense_b2b')
            .from('companies')
            .update({ plan: 'pro' })
            .eq('id', companyId)
        ];

        const results = await Promise.all(updateTasks);
        results.forEach((r, idx) => {
          if (r.error) {
            console.error(`[SuperAdmin] Erro no task ${idx}:`, r.error);
            throw r.error;
          }
        });
      } else {
        console.log('[SuperAdmin] Criando nova assinatura de cortesia');
        // Cria nova assinatura cortesia e atualiza empresa
        const insertTasks = [
          supabase
            .schema('app_expense_b2b')
            .from('subscriptions')
            .insert([{
              company_id: companyId,
              plan: 'pro',
              status: 'active',
              billing_cycle: 'monthly',
              users_limit: 100,
              expenses_limit: 5000
            }]),
          supabase
            .schema('app_expense_b2b')
            .from('companies')
            .update({ plan: 'pro' })
            .eq('id', companyId)
        ];

        const results = await Promise.all(insertTasks);
        results.forEach((r, idx) => {
          if (r.error) {
            console.error(`[SuperAdmin] Erro no task ${idx}:`, r.error);
            throw r.error;
          }
        });
      }

      return res.json({ success: true, message: 'Cortesia PRO concedida com sucesso!' });
    } catch (error: any) {
      console.error('[SuperAdmin] Erro fatal em grantProCourtesy:', error);
      return res.status(500).json({ 
        error: 'Erro ao processar upgrade de cortesia', 
        details: error.message 
      });
    }
  },

  /**
   * Lista todos os usuários da plataforma (apenas para Platform Admin)
   */
  async listAllUsers(req: Request, res: Response) {
    try {
      const { data: users, error } = await supabase
        .schema('app_expense_b2b')
        .from('users')
        .select(`
          *,
          company:companies(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.json(users);
    } catch (error: any) {
      console.error('Erro ao listar usuários (SuperAdmin):', error);
      return res.status(500).json({ error: 'Erro ao carregar usuários da plataforma' });
    }
  }
};
