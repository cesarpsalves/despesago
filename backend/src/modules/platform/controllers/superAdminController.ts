import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../../../shared/db/supabaseClient.js';

export const superAdminController = {
  /**
   * Lista todas as empresas da plataforma (apenas para Platform Admin)
   */
  async listAllCompanies(req: Request, res: Response) {
    try {
      // O RLS já deve estar configurado para permitir isso se for platform_admin,
      // mas vamos reforçar a busca via service_role ou verificar o metadado no backend.
      
      const { data: companies, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.json(companies);
    } catch (error: any) {
      console.error('Erro ao listar empresas (SuperAdmin):', error);
      return res.status(500).json({ error: 'Erro ao carregar empresas da plataforma' });
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
