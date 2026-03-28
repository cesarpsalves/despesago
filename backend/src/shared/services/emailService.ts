import nodemailer from 'nodemailer';
import { env } from '../../../config/env.js';

// Configuração do transportador (SMTP)
// Por padrão, se as variáveis não existirem, usará um comportamento de log ou falha silenciosa segura.
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || 'smtp.example.com',
  port: Number(env.SMTP_PORT) || 587,
  secure: env.SMTP_SECURE === 'true',
  auth: {
    user: env.SMTP_USER || '',
    pass: env.SMTP_PASS || '',
  },
});

export const emailService = {
  /**
   * Envia um email de convite com layout profissional
   */
  sendInviteEmail: async (toEmail: string, companyName: string, inviteLink: string) => {
    const htmlHeader = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 24px; color: #1e293b;">
        <img src="https://despesago.com.br/logo/logo_preto_fundo_transparente.png" alt="DespesaGo" style="height: 32px; margin-bottom: 32px;" />
    `;

    const htmlFooter = `
        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8;">
          © ${new Date().getFullYear()} DespesaGo — Gestão Corporativa de Despesas Inteligente.
        </div>
      </div>
    `;

    const body = `
      ${htmlHeader}
      <h1 style="font-size: 24px; font-weight: 800; margin-bottom: 16px; letter-spacing: -0.025em;">Você foi convidado! 🚀</h1>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        A empresa <strong>${companyName}</strong> convidou você para gerenciar despesas corporativas no DespesaGo.
      </p>
      <a href="${inviteLink}" style="display: inline-block; background-color: #10b981; color: white; padding: 16px 32px; border-radius: 12px; font-weight: bold; text-decoration: none; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);">
        Aceitar Convite e Entrar
      </a>
      <p style="margin-top: 32px; font-size: 14px; color: #64748b;">
        Se o botão acima não funcionar, copie e cole este link no seu navegador:<br/>
        <span style="word-break: break-all; color: #10b981;">${inviteLink}</span>
      </p>
      ${htmlFooter}
    `;

    try {
      if (!env.SMTP_USER || !env.SMTP_PASS) {
        console.log('--- MOCK EMAIL BEGIN ---');
        console.log(`Para: ${toEmail}`);
        console.log(`Assunto: Convite DespesaGo - ${companyName}`);
        console.log(`Link: ${inviteLink}`);
        console.log('--- MOCK EMAIL END ---');
        return true;
      }

      await transporter.sendMail({
        from: `"DespesaGo" <${env.SMTP_FROM || 'contato@despesago.com.br'}>`,
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
   * Envia email de recuperação de senha
   */
  sendPasswordResetEmail: async (toEmail: string, resetLink: string) => {
    const htmlHeader = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 24px; color: #1e293b;">
        <img src="https://despesago.com.br/logo/logo_preto_fundo_transparente.png" alt="DespesaGo" style="height: 32px; margin-bottom: 32px;" />
    `;

    const htmlFooter = `
        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8;">
          Se você não solicitou este e-mail, pode ignorá-lo com segurança.<br/><br/>
          © ${new Date().getFullYear()} DespesaGo — Gestão Corporativa de Despesas Inteligente.
        </div>
      </div>
    `;

    const body = `
      ${htmlHeader}
      <h1 style="font-size: 24px; font-weight: 800; margin-bottom: 16px; letter-spacing: -0.025em;">Recuperação de Senha 🔒</h1>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
        Recebemos uma solicitação para redefinir a senha da sua conta no DespesaGo. Clique no botão abaixo para escolher uma nova senha.
      </p>
      <a href="${resetLink}" style="display: inline-block; background-color: #0f172a; color: white; padding: 16px 32px; border-radius: 12px; font-weight: bold; text-decoration: none; font-size: 16px; shadow: 0 4px 12px rgba(15, 23, 42, 0.2);">
        Redefinir Minha Senha
      </a>
      <p style="margin-top: 32px; font-size: 14px; color: #64748b;">
        Este link expira em 24 horas. Se o botão não funcionar, use o link abaixo:<br/>
        <span style="word-break: break-all; color: #0f172a;">${resetLink}</span>
      </p>
      ${htmlFooter}
    `;

    try {
      if (!env.SMTP_USER || !env.SMTP_PASS) {
        console.log('--- MOCK RESET EMAIL BEGIN ---');
        console.log(`Para: ${toEmail}`);
        console.log(`Link: ${resetLink}`);
        console.log('--- MOCK RESET EMAIL END ---');
        return true;
      }

      await transporter.sendMail({
        from: `"DespesaGo" <${env.SMTP_FROM || 'contato@despesago.com.br'}>`,
        to: toEmail,
        subject: `Recuperação de senha - DespesaGo`,
        html: body,
      });
      return true;
    } catch (error) {
      console.error('Erro ao enviar email de reset:', error);
      return false;
    }
  }
};
