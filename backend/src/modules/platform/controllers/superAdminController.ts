import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../../../shared/db/supabaseClient.js';

export const superAdminController = {
  /**
   * Lista todas as empresas da plataforma (apenas para Platform Admin)
   */
  async listAllCompanies(req: Request, res: Response) {
    try {
      const { data: companies, error } = await supabase
        .from('companies')
        .select('*, subscriptions(plan, status)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Formata a resposta para facilitar no front
      const formatted = (companies || []).map(c => ({
        ...c,
        plan: c.subscriptions?.[0]?.plan || 'free',
        status: c.subscriptions?.[0]?.status || 'inactive'
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
        .single();

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
