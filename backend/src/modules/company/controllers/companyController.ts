import type { Request, Response } from 'express';
import { supabaseAdmin, createScopedClient } from '../../../shared/db/supabaseClient.js';
import { emailService } from '../../../shared/services/emailService.js';
import { config } from '../../../config/env.js';
import { startOfMonth, endOfMonth } from 'date-fns';

export const companyController = {
  // 1. O primeiro acesso pós login mágico no app. Cria a empresa e vincula o fundador.
  onboarding: async (req: Request, res: Response) => {
    try {
      const { companyName, document, userName } = req.body;
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: 'Cabeçalho de autenticação ausente' });

      // Obter ID do auth.users a partir do token recebido pelo backend (seguro)
      const supabaseScoped = createScopedClient(authHeader);
      const { data: { user }, error: authError } = await supabaseScoped.auth.getUser();
      
      if (authError || !user) throw new Error('Token de autenticação inválido');

      // Verifica se o usuário já está atrelado a uma empresa (impede dupla empresa no mesmo email)
      const { data: existingUser } = await supabaseAdmin
        .schema('app_expense_b2b')
        .from('users')
        .select('id, company_id')
        .eq('id', user.id)
        .maybeSingle();

      if (existingUser && existingUser.company_id) {
        return res.status(400).json({ error: 'Usuário já está vinculado a uma empresa corporativa.' });
      }

      // Cria Banco da Empresa (Elevating to Admin client as RLS blocks unassociated user)
      const { data: company, error: companyError } = await supabaseAdmin
        .schema('app_expense_b2b')
        .from('companies')
        .insert([{ 
          name: companyName, 
          document: document?.trim() || null 
        }])
        .select()
        .single();
        
      if (companyError) throw companyError;

      // Vincula o usuário fundador como Admin da empresa (upsert suporta se já existir)
      const { error: userError } = await supabaseAdmin
        .schema('app_expense_b2b')
        .from('users')
        .upsert([{
          id: user.id,
          company_id: company.id,
          role: 'admin',
          name: userName || user.email?.split('@')[0] || 'Usuário Fundador',
          email: user.email
        }], { onConflict: 'id' });

      if (userError) throw userError;

      // Inicializar Carteira Zerada
      await supabaseAdmin
        .schema('app_expense_b2b')
        .from('wallets').insert([{
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
        .schema('app_expense_b2b')
        .from('users')
        .select('company_id, role')
        .single();

      if (adminError || !adminUser) throw new Error('Solicitante não identificado ou sem empresa');
      if (adminUser.role !== 'admin') throw new Error('Permissão negada. Apenas administradores podem convidar.');

      const companyId = adminUser.company_id;

      // 1. Verifica se o usuário já existe no Auth para evitar duplicidade
      const { data: existingAuth } = await supabaseAdmin.auth.admin.listUsers();
      const userExists = existingAuth.users.find(u => u.email === email);

      let invitedUserId: string;

      if (!userExists) {
        // Cria o usuário no Auth sem enviar email automático (Passwordless Inicial)
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true, // Já confirmamos para facilitar o primeiro acesso
          user_metadata: { name, invited_by: companyId }
        });
        if (createError) throw createError;
        invitedUserId = newUser.user.id;
      } else {
        invitedUserId = userExists.id;
      }

      // 2. Gera um link de login (Magic Link) para o usuário convidado
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: { redirectTo: `${config.frontendUrl}/app` }
      });

      if (linkError) throw linkError;

      // 3. Caso sucesso no convite, cria a presença no espaço da empresa (App User) se não existir
      const { error: insertError } = await supabaseAdmin
        .schema('app_expense_b2b')
        .from('users')
        .upsert([{
          id: invitedUserId,
          company_id: companyId,
          role: role || 'employee',
          name: name || email.split('@')[0],
          email
        }], { onConflict: 'id' });

      if (insertError) throw insertError;
      
      // Inicializa a carteira corporativa do funcionário convidado se não existir
      const { data: existingWallet } = await supabaseAdmin
        .schema('app_expense_b2b')
        .from('wallets')
        .select('id')
        .eq('user_id', invitedUserId)
        .single();

      if (!existingWallet) {
        await supabaseAdmin
          .schema('app_expense_b2b')
          .from('wallets').insert([{
          company_id: companyId,
          user_id: invitedUserId,
          balance: 0.00
        }]);
      }

      // Busca o nome da empresa para o email
      const { data: companyData } = await supabaseAdmin
        .schema('app_expense_b2b')
        .from('companies')
        .select('name')
        .eq('id', companyId)
        .single();

      // Envia o email profissional via nosso serviço
      const inviteLink = linkData.properties.action_link;
      await emailService.sendInviteEmail(email, companyData?.name || 'Sua Empresa', inviteLink);

      return res.status(200).json({ success: true, message: `O convite profissional foi enviado para ${email}.` });
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
        .schema('app_expense_b2b')
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
        .schema('app_expense_b2b')
        .from('users')
        .select('company_id, role')
        .single();
      
      if (adminError || !adminUser) throw new Error('Não autorizado ou sem empresa.');
      if (adminUser.role !== 'admin') throw new Error('Apenas gestores/admins podem criar Centro de Custo.');

      const { data, error } = await supabaseAdmin
        .schema('app_expense_b2b')
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
  },

  // 5. Atualização de Centro de Custo (Nome/Orçamento)
  updateCostCenter: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, budget } = req.body;
      const authHeader = req.headers.authorization || '';
      const supabaseScoped = createScopedClient(authHeader);

      // Verifica se o usuário é admin da empresa do centro de custo através do RLS
      const { data, error } = await supabaseScoped
        .schema('app_expense_b2b')
        .from('cost_centers')
        .update({ name, budget })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ success: true, costCenter: data });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  // 6. Deleção de Centro de Custo (Move membros para 'Geral')
  deleteCostCenter: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const authHeader = req.headers.authorization || '';
      const supabaseScoped = createScopedClient(authHeader);

      const { data: adminUser } = await supabaseScoped
        .schema('app_expense_b2b')
        .from('users')
        .select('company_id, role')
        .single();
      
      if (!adminUser || adminUser.role !== 'admin') throw new Error('Não autorizado');

      // 1. Acha o ID do 'Geral' para não deixar órfãos
      const { data: defaultCc } = await supabaseAdmin
        .schema('app_expense_b2b')
        .from('cost_centers')
        .select('id')
        .eq('company_id', adminUser.company_id)
        .eq('name', 'Geral')
        .single();

      if (defaultCc && defaultCc.id === id) throw new Error('O centro de custo Geral não pode ser deletado.');

      // 2. Transfere usuários e despesas órfãs para o Geral (Transaction-safe)
      if (defaultCc) {
        await supabaseAdmin.schema('app_expense_b2b').from('users').update({ cost_center_id: defaultCc.id }).eq('cost_center_id', id);
        await supabaseAdmin.schema('app_expense_b2b').from('expenses').update({ cost_center_id: defaultCc.id }).eq('cost_center_id', id);
      }

      // 3. Deleta o centro de custo
      const { error } = await supabaseScoped
        .schema('app_expense_b2b')
        .from('cost_centers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  // 7. Atribuição de Membro a um Setor (Com migração opcional)
  assignMemberToCostCenter: async (req: Request, res: Response) => {
    try {
      const { memberId } = req.params;
      const { costCenterId, transferExpenses } = req.body;
      const authHeader = req.headers.authorization || '';
      const supabaseScoped = createScopedClient(authHeader);

      // Verificação de permissão (Admin da mesma empresa)
      const { data: adminUser } = await supabaseScoped
        .schema('app_expense_b2b')
        .from('users')
        .select('company_id, role')
        .single();
      
      if (!adminUser || adminUser.role !== 'admin') throw new Error('Não autorizado');

      // 1. Atualiza o perfil do membro
      const { error: userUpdateError } = await supabaseAdmin
        .schema('app_expense_b2b')
        .from('users')
        .update({ cost_center_id: costCenterId })
        .eq('id', memberId)
        .eq('company_id', adminUser.company_id);

      if (userUpdateError) throw userUpdateError;

      // 2. Se solicitado, move as despesas passadas
      if (transferExpenses) {
        const { error: expError } = await supabaseAdmin
          .schema('app_expense_b2b')
          .from('expenses')
          .update({ cost_center_id: costCenterId })
          .eq('user_id', memberId)
          .eq('company_id', adminUser.company_id);
        
        if (expError) throw expError;
      }

      return res.status(200).json({ success: true });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  // 8. Retorna dados da empresa vinculada ao usuário logado
  getMe: async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization || '';
      const supabaseScoped = createScopedClient(authHeader);

      // 1. Pega os dados do usuário para achar o company_id
      const { data: user, error: userError } = await supabaseScoped
        .schema('app_expense_b2b')
        .from('users')
        .select('company_id, role')
        .single();

      if (userError || !user) throw new Error('Usuário não identificado ou sem empresa');

      // 2. Busca os detalhes da empresa e da assinatura
      const { data: company, error: companyError } = await supabaseAdmin
        .schema('app_expense_b2b')
        .from('companies')
        .select('*, subscriptions(plan, status, billing_cycle)')
        .eq('id', user.company_id)
        .single();

      if (companyError || !company) throw new Error('Empresa não encontrada');

      // Formata a resposta
      const subsData = company.subscriptions;
      const activeSubscription = Array.isArray(subsData) 
        ? subsData.find((s: any) => ['active', 'trialing'].includes(s.status))
        : (['active', 'trialing'].includes(subsData?.status) ? subsData : null);
      
      const response = {
        ...company,
        plan: activeSubscription?.plan || 'free',
        subscriptionStatus: activeSubscription?.status || 'inactive'
      };

      return res.status(200).json(response);
    } catch (error: any) {
      console.error('GetCompanyMe Error:', error.message);
      return res.status(400).json({ error: error.message });
    }
  },

  // 6. Retorna um sumário completo para o dashboard (Premium Performance)
  dashboardSummary: async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization || '';
      const supabaseScoped = createScopedClient(authHeader);

      // 1. Identifica usuário e empresa
      const { data: user, error: userError } = await supabaseScoped
        .schema('app_expense_b2b')
        .from('users')
        .select('company_id, role')
        .maybeSingle();

      if (userError) throw userError;

      // Se o usuário não existe no perfil da app_expense_b2b ou não tem empresa
      if (!user || !user.company_id) {
        // Verifica se é um usuário Admin do Supabase (Super Admin)
        const { data: { user: authUser } } = await supabaseScoped.auth.getUser();
        
        // Se for Super Admin, retorna um estado de visualização de plataforma
        return res.status(200).json({
          company: {
            name: 'Plataforma DespesaGo',
            plan: 'platform_admin',
            subscriptionStatus: 'active'
          },
          recentExpenses: [],
          members: [],
          stats: {
            memberCount: 0,
            monthlyTotal: 0,
            consumedCount: 0,
            limit: 999999,
            currency: 'BRL'
          },
          isPlatformAdmin: true
        });
      }

      const companyId = user.company_id;

      // 2. Busca tudo em paralelo para performance máxima
      const now = new Date();
      const firstDay = startOfMonth(now).toISOString();
      const lastDay = endOfMonth(now).toISOString();

      const [companyRes, expensesRes, membersCountRes, monthlyTotalRes, membersRes, costCentersRes] = await Promise.all([
        // Detalhes da Empresa e Assinatura
        supabaseAdmin
          .schema('app_expense_b2b')
          .from('companies')
          .select('*, subscriptions(plan, status)')
          .eq('id', companyId)
          .single(),
        
        // Últimas 10 despesas (RLS garantido pelo scoped client)
        supabaseScoped
          .schema('app_expense_b2b')
          .from('expenses')
          .select('*, cost_centers(name)')
          .order('date', { ascending: false })
          .limit(10),
        
        // Contagem de membros
        supabaseAdmin
          .schema('app_expense_b2b')
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyId),

        // Total do mês atual
        supabaseScoped
          .schema('app_expense_b2b')
          .from('expenses')
          .select('amount')
          .gte('date', firstDay)
          .lte('date', lastDay),
        
        // Lista completa de membros (para gestão de equipe)
        supabaseAdmin
          .schema('app_expense_b2b')
          .from('users')
          .select('*')
          .eq('company_id', companyId)
          .order('name'),

        // Centros de Custo (Caixas)
        supabaseScoped
          .schema('app_expense_b2b')
          .from('cost_centers')
          .select('*')
          .order('name')
      ]);

      if (companyRes.error) throw companyRes.error;

      // 4. Calcula o Plano Ativo (Idêntico ao billingController.status)
      const companyData = companyRes.data || {};
      const subsData = (companyData as any).subscriptions;
      const activeSubscription = Array.isArray(subsData)
        ? subsData.find((s: any) => ['active', 'trialing'].includes(s.status))
        : (['active', 'trialing'].includes(subsData?.status) ? subsData : null);
        
      const plan = activeSubscription?.plan || 'free';
      const subscriptionStatus = activeSubscription?.status || 'inactive';

      // 5. Calcula limites de uso baseados no plano
      const usageLimit = plan === 'pro' ? 5000 : 50;
      const consumedCount = (monthlyTotalRes.data || []).length;

      // 6. Calcula total mensal
      const monthlyTotal = (monthlyTotalRes.data || []).reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);

      return res.json({
        company: {
          ...companyData,
          plan,
          subscriptionStatus
        },
        recentExpenses: Array.isArray(expensesRes.data) ? expensesRes.data : [],
        members: Array.isArray(membersRes.data) ? membersRes.data : [],
        costCenters: Array.isArray(costCentersRes.data) ? costCentersRes.data : [],
        stats: {
          memberCount: membersCountRes.count || 0,
          monthlyTotal,
          consumedCount,
          limit: usageLimit,
          currency: 'BRL'
        }
      });
    } catch (error: any) {
      console.error('DashboardSummary Error:', error.message);
      return res.status(500).json({ error: 'Erro ao processar resumo do dashboard: ' + error.message });
    }
  }
};
