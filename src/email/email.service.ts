import nodemailer from 'nodemailer';
import { templates } from './templates';
import { db } from '../db';
import { emailMessages, users } from '../db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

let etherealAccount: any = null;
let transporter: any = null;

export function isRealSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
}

export function getSmtpStatus() {
  return {
    isConfigured: isRealSmtpConfigured(),
    host: process.env.SMTP_HOST || 'smtp.ethereal.email (test sandbox)',
    port: parseInt(process.env.SMTP_PORT || '587'),
    from: process.env.SMTP_FROM || process.env.SMTP_USER || '"Auth Service" <no-reply@example.com>',
    user: process.env.SMTP_USER || 'ethereal test account',
    isEthereal: !isRealSmtpConfigured() || (process.env.SMTP_HOST || '').includes('ethereal')
  };
}

async function getTransporter() {
  if (transporter) return transporter;

  if (isRealSmtpConfigured()) {
    const port = parseInt(process.env.SMTP_PORT || '587');
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // Must be true for port 465 (SMTPS)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate test account automatically
    if (!etherealAccount) {
      etherealAccount = await nodemailer.createTestAccount();
    }
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: etherealAccount.user,
        pass: etherealAccount.pass,
      },
    });
  }
  return transporter;
}

export const sendEmail = async (
  to: string, 
  subject: string, 
  text: string, 
  html?: string, 
  templateName: string = 'custom',
  senderUserId?: string | null
) => {
  const messageId = crypto.randomUUID();
  let userId = senderUserId || null;
  
  // If no explicit sender specified (e.g. system welcome/verification emails), associate with recipient if they are in DB
  if (!userId) {
    try {
      const userRes = await db.select().from(users).where(eq(users.email, to)).limit(1);
      if (userRes.length > 0) userId = userRes[0].id;
    } catch (e) {
      // ignore
    }
  }

  // Pre-insert pending state
  try {
    await db.insert(emailMessages).values({
      id: messageId,
      user_id: userId,
      to_email: to,
      template: templateName,
      status: 'pending',
    });
  } catch (e) {
    console.error('Failed to log email as pending', e);
  }

  try {
    const t = await getTransporter();
    const isEthereal = !isRealSmtpConfigured() || (process.env.SMTP_HOST || '').includes('ethereal');
    const fromAddress = process.env.SMTP_FROM || (process.env.SMTP_USER ? `"${process.env.SMTP_USER}" <${process.env.SMTP_USER}>` : '"Auth Service" <no-reply@example.com>');

    const info = await t.sendMail({
      from: fromAddress,
      to,
      subject,
      text,
      html: html || text,
    });
    
    let previewUrl = '';
    if (isEthereal) {
      previewUrl = nodemailer.getTestMessageUrl(info) || '';
      console.log('Preview URL (Ethereal test inbox): %s', previewUrl);
    }
    
    // Update successful state
    try {
      await db.update(emailMessages)
        .set({ 
          status: 'sent', 
          provider_message_id: previewUrl || info.messageId, 
          sent_at: new Date() 
        })
        .where(eq(emailMessages.id, messageId));
    } catch (e) {
      console.error('Failed to update email status', e);
    }
    
    return {
      ...info,
      previewUrl,
      isEthereal,
      from: fromAddress,
      userId
    };
  } catch (error: any) {
    console.error('Error sending email:', error);
    
    try {
      await db.update(emailMessages)
        .set({ status: 'failed' })
        .where(eq(emailMessages.id, messageId));
    } catch (e) {
      // ignore
    }
    
    throw new Error(error.message || 'Could not send email');
  }
};

export const sendWelcomeEmail = async (to: string, name: string) => {
  const appName = 'My App';
  const dashboardLink = `${process.env.APP_URL || 'http://localhost:3000'}/dashboard`;
  const { subject, html, text } = templates.welcome({ name, appName, dashboardLink });
  return sendEmail(
    to,
    subject,
    text || 'Welcome to our application!',
    html,
    'welcome'
  );
};

export const sendVerificationEmail = async (to: string, token: string) => {
  const url = `${process.env.APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  const appName = 'My App';
  const name = to.split('@')[0];
  const { subject, html, text } = templates.verifyEmail({ name, verifyLink: url, appName });
  
  return sendEmail(
    to,
    subject,
    text || `Please verify your email by visiting: ${url}`,
    html,
    'email_verification'
  );
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
  const url = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  const appName = 'My App';
  const name = to.split('@')[0];
  const { subject, html, text } = templates.passwordReset({ name, resetLink: url, appName });
  
  return sendEmail(
    to,
    subject,
    text || `Reset your password by visiting: ${url}`,
    html,
    'password_reset'
  );
};

export const sendInvoiceEmail = async (to: string, amount: string, invoiceId: string) => {
  const appName = 'My App';
  const name = to.split('@')[0];
  const date = new Date().toLocaleDateString();
  const receiptLink = `${process.env.APP_URL || 'http://localhost:3000'}/receipt/${invoiceId}`;
  
  const { subject, html, text } = templates.invoice({ name, appName, amount, invoiceId, date, receiptLink });
  
  return sendEmail(
    to,
    subject,
    text,
    html,
    'invoice'
  );
};

export const sendSecurityAlertEmail = async (to: string, deviceName: string, location: string) => {
  const appName = 'My App';
  const name = to.split('@')[0];
  const time = new Date().toLocaleString();
  const reviewLink = `${process.env.APP_URL || 'http://localhost:3000'}/security`;
  
  const { subject, html, text } = templates.securityAlert({ name, appName, deviceName, location, time, reviewLink });
  
  return sendEmail(
    to,
    subject,
    text,
    html,
    'security_alert'
  );
};

export const sendInvitationEmail = async (to: string, inviterName: string, teamName: string) => {
  const appName = 'My App';
  const inviteLink = `${process.env.APP_URL || 'http://localhost:3000'}/invite/accept`;
  
  const { subject, html, text } = templates.invitation({ inviterName, teamName, appName, inviteLink });
  
  return sendEmail(
    to,
    subject,
    text,
    html,
    'invitation'
  );
};
