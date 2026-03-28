import { Resend } from 'resend';
import { env } from '../../config/env.js';

// Lazy-loading do Resend para evitar crash no carregamento do módulo
let _resend: Resend | null = null;
const getResend = () => {
  if (!_resend && env.RESEND_API_KEY) {
    _resend = new Resend(env.RESEND_API_KEY);
  }
  return _resend;
};

const htmlFooter = `
  <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px; text-align: center;">
    <p style="margin-bottom: 8px;">Este é um e-mail automático do <strong>DespesaGo</strong>. Por favor, não responda.</p>
    <p style="margin-bottom: 0;">&copy; ${new Date().getFullYear()} DespesaGo • Gestão de Despesas Inteligente</p>
  </div>
`;

const premiumStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 40px;
  background-color: #ffffff;
  border-radius: 24px;
  color: #1e293b;
`;

export const emailService = {
  /**
   * Envia e-mail de convite para funcionário (Premium Design)
   */
  async sendInviteEmail(toEmail: string, companyName: string, inviteLink: string): Promise<boolean> {
    const body = `
      <div style="${premiumStyles}">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Você foi convidado!</h1>
          <p style="font-size: 16px; color: #64748b; margin: 0;">Junte-se à equipe da <strong>${companyName}</strong> no DespesaGo.</p>
        </div>
        
        <div style="background-color: #f8fafc; padding: 24px; border-radius: 16px; margin-bottom: 32px; border: 1px solid #f1f5f9;">
          <p style="font-size: 14px; line-height: 1.6; margin: 0; color: #475569;">
            O DespesaGo ajuda você e sua equipe a gerenciar despesas de forma inteligente.
            Com seu novo acesso, você poderá capturar recibos com IA e acompanhar seus reembolsos em tempo real.
          </p>
        </div>

        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${inviteLink}" style="background-color: #000000; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 14px; font-weight: 700; font-size: 16px; display: inline-block; transition: transform 0.2s;">
            Configurar meu Acesso
          </a>
        </div>

        <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-bottom: 0;">
          Se o botão acima não funcionar, utilize este link:<br>
          <a href="${inviteLink}" style="color: #6366f1; text-decoration: none; word-break: break-all;">${inviteLink}</a>
        </p>

        ${htmlFooter}
      </div>
    `;

    try {
      const resendClient = getResend();
      if (!resendClient) {
        console.log(`[Email Mock] Convite enviado para ${toEmail}`);
        return true;
      }

      await resendClient.emails.send({
        from: env.RESEND_FROM,
        to: toEmail,
        subject: `Convite Aceito: Junte-se a ${companyName} no DespesaGo`,
        html: body,
      });

      return true;
    } catch (error) {
      console.error('Erro ao enviar email de convite:', error);
      return false;
    }
  },

  /**
   * Envia e-mail de recuperação de senha (Premium Design)
   */
  async sendPasswordResetEmail(toEmail: string, resetLink: string): Promise<boolean> {
    const body = `
      <div style="${premiumStyles}">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Recupere sua Senha</h1>
          <p style="font-size: 16px; color: #64748b; margin: 0;">Redefina seu acesso de forma segura.</p>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6; text-align: center; color: #475569; margin-bottom: 32px;">
          Recebemos uma solicitação para redefinir a senha da sua conta no DespesaGo. 
          Clique no botão abaixo para prosseguir com a criação da sua nova senha.
        </p>

        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${resetLink}" style="background-color: #000000; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 14px; font-weight: 700; font-size: 16px; display: inline-block;">
            Redefinir minha Senha
          </a>
        </div>

        <div style="padding: 16px; background-color: #fff7ed; border-radius: 12px; border: 1px solid #ffedd5; margin-bottom: 32px;">
          <p style="color: #9a3412; font-size: 13px; text-align: center; margin: 0;">
             Este link é válido por apenas 1 hora. Se você não solicitou esta alteração, pode ignorar este e-mail.
          </p>
        </div>

        ${htmlFooter}
      </div>
    `;

    try {
      const resendClient = getResend();
      if (!resendClient) {
        console.log(`[Email Mock] Reset Link enviado para ${toEmail}: ${resetLink}`);
        return true;
      }

      await resendClient.emails.send({
        from: env.RESEND_FROM,
        to: toEmail,
        subject: `Recuperação de Acesso - DespesaGo`,
        html: body,
      });

      return true;
    } catch (error) {
      console.error('Erro ao enviar email de reset:', error);
      return false;
    }
  },

  /**
   * Envia e-mail de Magic Link (Premium Design)
   */
  async sendMagicLinkEmail(toEmail: string, magicLink: string): Promise<boolean> {
    const body = `
      <div style="${premiumStyles}">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Acesse sua conta</h1>
          <p style="font-size: 16px; color: #64748b; margin: 0;">Login seguro e sem senha.</p>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6; text-align: center; color: #475569; margin-bottom: 32px;">
          Clique no botão abaixo para entrar instantaneamente no DespesaGo. 
          Este link é pessoal e não deve ser compartilhado.
        </p>

        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${magicLink}" style="background-color: #000000; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 14px; font-weight: 700; font-size: 16px; display: inline-block;">
            Fazer Login Agora
          </a>
        </div>

        <div style="padding: 16px; background-color: #f0fdf4; border-radius: 12px; border: 1px solid #dcfce7; margin-bottom: 32px;">
          <p style="color: #166534; font-size: 13px; text-align: center; margin: 0;">
             Este link é válido por apenas 1 hora e funciona apenas uma vez.
          </p>
        </div>

        ${htmlFooter}
      </div>
    `;

    try {
      const resendClient = getResend();
      if (!resendClient) {
        console.log(`[Email Mock] Magic Link enviado para ${toEmail}: ${magicLink}`);
        return true;
      }

      await resendClient.emails.send({
        from: env.RESEND_FROM,
        to: toEmail,
        subject: `Link de Acesso - DespesaGo`,
        html: body,
      });

      return true;
    } catch (error) {
      console.error('Erro ao enviar email de magic link:', error);
      return false;
    }
  },
};
