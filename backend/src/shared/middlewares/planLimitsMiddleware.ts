import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin, createScopedClient } from '../db/supabaseClient.js';

export const planLimitsMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Auth required' });

    // Instancia via request auth para pegar o auth id de quem chamou
    const supabaseScoped = createScopedClient(authHeader);
    const { data: user } = await supabaseScoped.from('users').select('company_id').single();
    
    // Se o usuário ainda não foi associado a uma empresa (onboarding), a api ignora
    if (!user || !user.company_id) return next();

    // Consultando administrativamente (bypass RLS apenas para validação core) o status atual
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('plan, status')
      .eq('company_id', user.company_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const isPro = subscription?.plan === 'pro' && subscription?.status === 'active';

    if (!isPro) {
      // Regra 1: Limite de Funcionários
      const { count: userCount } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', user.company_id);

      if (userCount && userCount >= 5 && req.url.includes('/invite')) {
        return res.status(403).json({ 
          error: 'Limite do plano Free (5 usuários) atingido. Faça upgrade para o PRO para convidar mais pessoas do seu time.',
          code: 'UPGRADE_REQUIRED' 
        });
      }

      // Regra 2: Limite de Recibos/Despesas Lançadas (100)
      const { count: expenseCount } = await supabaseAdmin
        .from('expenses')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', user.company_id);
        
      if (expenseCount && expenseCount >= 100 && req.url.includes('/process')) {
        return res.status(403).json({ 
          error: 'Limite de 100 despesas processadas por IA atingido. Acesse a área de Faturamento para continuar operando.',
          code: 'UPGRADE_REQUIRED' 
        });
      }
    }

    next();
  } catch (err: any) {
    console.error('Plan limits error:', err.message);
    // Em caso de erro do BD (timeout), falha seguro permitindo o acesso ao invez de quebrar operação crítica
    next();
  }
}
