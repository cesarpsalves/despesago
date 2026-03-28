import type { Request, Response } from 'express';
import { supabaseAdmin, createScopedClient } from '../../../shared/db/supabaseClient.js';

export const companyController = {
  // 1. O primeiro acesso pós login mágico no app. Cria a empresa e vincula o fundador.
  onboarding: async (req: Request, res: Response) => {
    try {
      const { companyName, document, userName } = req.body;
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: 'Missing auth header' });

      // Obter ID do auth.users a partir do token recebido pelo backend (seguro)
      const supabaseScoped = createScopedClient(authHeader);
      const { data: { user }, error: authError } = await supabaseScoped.auth.getUser();
      
      if (authError || !user) throw new Error('Invalid authentication token');

      // Verifica se o usuário já está atrelado a uma empresa (impede dupla empresa no mesmo email)
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (existingUser) {
        return res.status(400).json({ error: 'Usuário já está vinculado a uma empresa corporativa.' });
      }

      // Cria Banco da Empresa (Elevating to Admin client as RLS blocks unassociated user)
      const { data: company, error: companyError } = await supabaseAdmin
        .from('companies')
        .insert([{ 
          name: companyName, 
          document: document?.trim() || null 
        }])
        .select()
        .single();
        
      if (companyError) throw companyError;

      // Vincula o usuário fundador como Admin da empresa
      const { error: userError } = await supabaseAdmin
        .from('users')
        .insert([{
          id: user.id,
          company_id: company.id,
          role: 'admin',
          name: userName || user.email?.split('@')[0] || 'Usuário Fundador',
          email: user.email
        }]);

      if (userError) throw userError;

      // Inicializar Carteira Zerada
      await supabaseAdmin.from('wallets').insert([{
        company_id: company.id,
        user_id: user.id,
        balance: 0.00
      }]);

      return res.status(201).json({ success: true, company });
    } catch (error: any) {
      console.error('Onboarding Error:', error.message);
      return res.status(400).json({ error: error.message });
    }
  },

  // 2. Administrador envia convite para funcionário se juntar ao seu espaço de empresa
  inviteEmployee: async (req: Request, res: Response) => {
    try {
      const { email, name, role } = req.body;
      const authHeader = req.headers.authorization || '';
      
      // Scoped client garante que o solicitante prove quem é e acesse o RLS
      const supabaseScoped = createScopedClient(authHeader);

      // Obter os dados da empresa do Admin enviando a requisição 
      // (.single() usa RLS para pegar exatamente o Auth do token)
      const { data: adminUser, error: adminError } = await supabaseScoped
        .from('users')
        .select('company_id, role')
        .single();

      if (adminError || !adminUser) throw new Error('Solicitante não identificado ou sem empresa');
      if (adminUser.role !== 'admin') throw new Error('Permissão negada. Apenas administradores podem convidar.');

      const companyId = adminUser.company_id;

      // Dispara o email mágico de convite pelo Supabase Admin
      // Observação: Isso requer que no painel do Supabase a URL de redirecionamento do invite esteja configurada
      const { data: invitedAuth, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
      if (inviteError) throw inviteError;

      // Caso sucesso no convite, cria a presença no espaço da empresa (App User)
      const { error: insertError } = await supabaseAdmin
        .from('users')
        .insert([{
          id: invitedAuth.user.id,
          company_id: companyId,
          role: role || 'employee',
          name: name || email.split('@')[0],
          email
        }]);

      if (insertError) throw insertError;
      
      // Inicializa a carteira corporativa do funcionário convidado
      await supabaseAdmin.from('wallets').insert([{
        company_id: companyId,
        user_id: invitedAuth.user.id,
        balance: 0.00
      }]);

      return res.status(200).json({ success: true, message: `Um link mágico de acesso foi enviado para ${email}.` });
    } catch (error: any) {
      console.error('Invite Error:', error.message);
      return res.status(400).json({ error: error.message });
    }
  },

  // 3. Listagem de Centros de Custo da Empresa atual
  listCostCenters: async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization || '';
      const supabaseScoped = createScopedClient(authHeader);

      // RLS filtra automaticamente apenas pro company_id logado
      const { data, error } = await supabaseScoped
        .from('cost_centers')
        .select('*')
        .order('name');

      if (error) throw error;
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  // 4. Criação de novo Centro de Custo B2B
  createCostCenter: async (req: Request, res: Response) => {
    try {
      const { name, budget } = req.body;
      const authHeader = req.headers.authorization || '';
      const supabaseScoped = createScopedClient(authHeader);

      const { data: adminUser, error: adminError } = await supabaseScoped
        .from('users')
        .select('company_id, role')
        .single();
      
      if (adminError || !adminUser) throw new Error('Não autorizado ou sem empresa.');
      if (adminUser.role !== 'admin') throw new Error('Apenas gestores/admins podem criar Centro de Custo.');

      const { data, error } = await supabaseAdmin
        .from('cost_centers')
        .insert([{
          company_id: adminUser.company_id,
          name,
          budget
        }])
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, costCenter: data });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
};
