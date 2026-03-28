import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin as supabase } from '../db/supabaseClient.js';

/**
 * Middleware para verificar se o usuário logado é um Plataform Admin
 */
export async function isPlatformAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (error || !user) {
      return res.status(401).json({ error: 'Sessão inválida' });
    }

    // Verifica se o usuário tem a role no app_metadata ou na tabela users do esquema app_expense_b2b
    const isGlobalAdmin = user.app_metadata?.role === 'platform_admin';

    if (isGlobalAdmin) {
      return next();
    }

    // Fallback: Verificar na tabela de usuários do esquema app_expense_b2b
    const { data: userData, error: userError } = await supabase
      .schema('app_expense_b2b')
      .from('users')
      .select('is_platform_admin')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.is_platform_admin) {
      return res.status(403).json({ error: 'Acesso negado: Apenas administradores da plataforma.' });
    }

    return next();
  } catch (error) {
    console.error('Erro no middleware isPlatformAdmin:', error);
    return res.status(500).json({ error: 'Erro interno de servidor' });
  }
}
