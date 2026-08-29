import { baseStyles } from './baseStyles';

export const verifyEmail = (data: { name: string; verifyLink: string; appName: string }) => ({
  subject: `Verify your email for ${data.appName}`,
  text: `Hi ${data.name},\n\nPlease confirm your email address by visiting the link below. This ensures we have the right email to reach you for important account updates.\n\nVerify Email: ${data.verifyLink}\n\n© ${new Date().getFullYear()} ${data.appName}. All rights reserved.`,
  html: `
    <!DOCTYPE html>
    <html>
    <head><style>${baseStyles}</style></head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Email Address</h1>
        </div>
        <div class="content">
          <p>Hi ${data.name},</p>
          <p>Please confirm your email address by clicking the button below. This ensures we have the right email to reach you for important account updates.</p>
          <div class="button-container">
            <a href="${data.verifyLink}" class="button">Verify Email</a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #2563eb;">${data.verifyLink}</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${data.appName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
});
