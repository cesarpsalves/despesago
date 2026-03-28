import { Resend } from 'resend';
import { env } from '../../config/env.js';

// Configuração do Resend
const resend = new Resend(env.RESEND_API_KEY);

const htmlFooter = `
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
    <p>Este é um e-mail automático do DespesaGo. Por favor, não responda.</p>
    <p>&copy; ${new Date().getFullYear()} DespesaGo - Gestão de Despesas Inteligente</p>
  </div>
`;

export const emailService = {
  /**
   * Envia e-mail de convite para funcionário
   */
  async sendInviteEmail(toEmail: string, companyName: string, inviteLink: string): Promise<boolean> {
    const body = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px;">
        <h2 style="color: #4f46e5;">Olá!</h2>
        <p>Você foi convidado para participar da empresa <strong>${companyName}</strong> no DespesaGo.</p>
        <p>Para aceitar o convite e configurar seu acesso, clique no botão abaixo:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Aceitar Convite</a>
        </div>
        <p style="color: #666; font-size: 14px;">Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
        <p style="color: #666; font-size: 14px; word-break: break-all;">${inviteLink}</p>
      </div>
      ${htmlFooter}
    `;

    try {
      if (!env.RESEND_API_KEY) {
        console.log('--- MOCK EMAIL BEGIN ---');
        console.log(`Para: ${toEmail}`);
        console.log(`Assunto: Convite DespesaGo - ${companyName}`);
        console.log(`Link: ${inviteLink}`);
        console.log('--- MOCK EMAIL END ---');
        return true;
      }

      await resend.emails.send({
        from: env.RESEND_FROM,
        to: toEmail,
        subject: `Você foi convidado para a empresa ${companyName} no DespesaGo`,
        html: body,
      });

      return true;
    } catch (error) {
      console.error('Erro ao enviar email de convite:', error);
      return false;
    }
  },

  /**
   * Envia e-mail de recuperação de senha
   */
  async sendPasswordResetEmail(toEmail: string, resetLink: string): Promise<boolean> {
    const body = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px;">
        <h2 style="color: #4f46e5;">Recuperação de Senha</h2>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta no DespesaGo.</p>
        <p>Clique no botão abaixo para criar uma nova senha:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Redefinir Senha</a>
        </div>
        <p style="color: #666; font-size: 14px;">Este link expirará em breve por motivos de segurança.</p>
        <p style="color: #666; font-size: 14px;">Se você não solicitou a redefinição, pode ignorar este e-mail com segurança.</p>
        <p style="color: #666; font-size: 14px; word-break: break-all;">${resetLink}</p>
      </div>
      ${htmlFooter}
    `;

    try {
      if (!env.RESEND_API_KEY) {
        console.log('--- MOCK RESET EMAIL BEGIN ---');
        console.log(`Para: ${toEmail}`);
        console.log(`Link: ${resetLink}`);
        console.log('--- MOCK RESET EMAIL END ---');
        return true;
      }

      await resend.emails.send({
        from: env.RESEND_FROM,
        to: toEmail,
        subject: `Recuperação de senha - DespesaGo`,
        html: body,
      });

      return true;
    } catch (error) {
      console.error('Erro ao enviar email de reset:', error);
      return false;
    }
  },
};
