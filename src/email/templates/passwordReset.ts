import { baseStyles } from './baseStyles';

export const passwordReset = (data: { name: string; resetLink: string; appName: string }) => ({
  subject: `Reset your password for ${data.appName}`,
  text: `Hi ${data.name},\n\nWe received a request to reset your password for your ${data.appName} account. If you didn't make this request, you can safely ignore this email.\n\nReset Password: ${data.resetLink}\n\nThis link will expire in 1 hour.\n\n© ${new Date().getFullYear()} ${data.appName}. All rights reserved.`,
  html: `
    <!DOCTYPE html>
    <html>
    <head><style>${baseStyles}</style></head>
    <body>
      <div class="container">
        <div class="header" style="background-color: #4f46e5;">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hi ${data.name},</p>
          <p>We received a request to reset your password for your ${data.appName} account. If you didn't make this request, you can safely ignore this email.</p>
          <div class="button-container">
            <a href="${data.resetLink}" class="button" style="background-color: #4f46e5;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${data.appName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
});
