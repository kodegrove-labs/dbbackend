import nodemailer from 'nodemailer';
import { templates } from './templates';

// You would typically use environment variables for this.
// For testing, we can use Ethereal Email (https://ethereal.email/)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER, // Replace with actual or Ethereal user
    pass: process.env.SMTP_PASS, // Replace with actual or Ethereal pass
  },
});

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Auth Service" <no-reply@example.com>',
      to,
      subject,
      text,
      html: html || text,
    });
    
    console.log('Message sent: %s', info.messageId);
    
    if (!process.env.SMTP_HOST || process.env.SMTP_HOST.includes('ethereal')) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Could not send email');
  }
};

export const sendWelcomeEmail = async (to: string, name: string) => {
  const appName = 'My App'; // Could be env var
  const dashboardLink = `${process.env.APP_URL || 'http://localhost:3000'}/dashboard`;
  const { subject, html, text } = templates.welcome({ name, appName, dashboardLink });
  return sendEmail(
    to,
    subject,
    text || 'Welcome to our application!',
    html
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
    html
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
    html
  );
};
