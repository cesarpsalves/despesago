import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../../../shared/db/supabaseClient.js';

export const superAdminController = {
  /**
   * Lista todas as empresas da plataforma (apenas para Platform Admin)
   */
  async listAllCompanies(req: Request, res: Response) {
    try {
      // Busca empresas e suas assinaturas
      const { data: companies, error } = await supabase
        .from('companies')
        .select('*, subscriptions(plan, status)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Busca contagem de usuários para todas as empresas em paralelo para ser rápido
      const { data: userCounts } = await supabase
        .rpc('count_users_per_company'); 
        // Se a RPC não existir, usaremos uma query alternativa ou simularemos.
        // Vamos usar uma query direta para garantir compatibilidade inicial:
      
      const { data: allUsers } = await supabase
        .from('users')
        .select('company_id');

      const countMap: Record<string, number> = {};
      allUsers?.forEach(u => {
        if (u.company_id) {
          countMap[u.company_id] = (countMap[u.company_id] || 0) + 1;
        }
      });

      // Formata a resposta para facilitar no front
      const formatted = (companies || []).map(c => ({
        ...c,
        plan: c.subscriptions?.[0]?.plan || 'free',
        status: c.subscriptions?.[0]?.status || 'inactive',
        user_count: countMap[c.id] || 0
      }));

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

    try {
      // 1. Verifica se já existe assinatura
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();

      if (existingSub) {
        // Upgrade da assinatura existente
        const { error } = await supabase
          .from('subscriptions')
          .update({ 
            plan: 'pro', 
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSub.id);
        
        if (error) throw error;
      } else {
        // Cria nova assinatura cortesia
        const { error } = await supabase
          .from('subscriptions')
          .insert([{
            company_id: companyId,
            plan: 'pro',
            status: 'active',
            billing_cycle: 'MONTHLY' // Padrão
          }]);
        
        if (error) throw error;
      }

      return res.json({ success: true, message: 'Cortesia PRO concedida com sucesso!' });
    } catch (error: any) {
      console.error('Erro ao conceder cortesia (SuperAdmin):', error);
      return res.status(500).json({ error: 'Erro ao processar upgrade de cortesia' });
    }
  },

  /**
   * Lista todos os usuários da plataforma (apenas para Platform Admin)
   */
  async listAllUsers(req: Request, res: Response) {
    try {
      const { data: users, error } = await supabase
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
