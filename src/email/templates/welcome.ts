import { baseStyles } from './baseStyles';

export const welcome = (data: { name: string; appName: string; dashboardLink?: string }) => {
  const link = data.dashboardLink || 'https://google.com';
  return {
    subject: `Welcome to ${data.appName}!`,
    text: `Hi ${data.name},\n\nWe're thrilled to have you on board. ${data.appName} is designed to help you achieve your goals quickly and efficiently.\n\nGet started by exploring your dashboard and setting up your profile. You can access it here: ${link}\n\nIf you have any questions, simply reply to this email. We're here to help!\n\n© ${new Date().getFullYear()} ${data.appName}. All rights reserved.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ${data.appName}!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.name},</p>
            <p>We're thrilled to have you on board. ${data.appName} is designed to help you achieve your goals quickly and efficiently.</p>
            <p>Get started by exploring your dashboard and setting up your profile.</p>
            <div class="button-container">
              <a href="${link}" class="button">Go to Dashboard</a>
            </div>
            <p>If you have any questions, simply reply to this email. We're here to help!</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${data.appName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};
