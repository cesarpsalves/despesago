import type { Request, Response } from 'express';
import { supabaseAdmin } from '../../../shared/db/supabaseClient.js';
import { emailService } from '../../../shared/services/emailService.js';
import { config } from '../../../config/env.js';

export const authController = {
  /**
   * Solicita a recuperação de senha enviando um email profissional (Premium)
   */
  async requestPasswordReset(req: Request, res: Response) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'E-mail é obrigatório' });
    }

    try {
      // 1. Gera o link de recuperação via admin do Supabase (para evitar o envio automático de email padrão)
      // O Supabase enviará o email se usarmos resetPasswordForEmail.
      // Para controle total, usamos generateLink com tipo 'recovery'.
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: {
          // Após o clique no link, o Supabase valida e redireciona com o token na URL/Hash
          redirectTo: `${config.frontendUrl}/auth/callback?next=/auth/reset-password`
        }
      });

      if (error) {
        // Se o usuário não existir, por segurança não revelamos isso
        console.warn('Reset password error (likely user not found):', error.message);
        return res.status(200).json({ success: true, message: 'Se o e-mail existir, as instruções foram enviadas.' });
      }

      // 2. Extrai o link gerado
      const resetLink = data.properties.action_link;

      // 3. Envia o email profissional usando nosso serviço de email (Nodemailer)
      await emailService.sendPasswordResetEmail(email, resetLink);

      return res.status(200).json({
        success: true,
        message: 'E-mail de recuperação profissional enviado com sucesso.'
      });
    } catch (error: any) {
      console.error('Auth requestPasswordReset Error:', error.message);
      return res.status(400).json({ error: 'Erro ao processar solicitação de senha.' });
    }
  }
};
