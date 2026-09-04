import { baseStyles } from './baseStyles';

export const securityAlert = (data: { name: string; appName: string; deviceName: string; location: string; time: string; reviewLink?: string }) => {
  const link = data.reviewLink || 'https://google.com';
  return {
    subject: `Security Alert: New sign-in to ${data.appName}`,
    text: `Hi ${data.name},\n\nWe noticed a new sign-in to your ${data.appName} account.\n\nDevice: ${data.deviceName}\nLocation: ${data.location}\nTime: ${data.time}\n\nIf this was you, you can ignore this email. If this wasn't you, please secure your account immediately: ${link}\n\n© ${new Date().getFullYear()} ${data.appName}. All rights reserved.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="header" style="background-color: #ef4444;">
            <h1>Security Alert</h1>
          </div>
          <div class="content">
            <p>Hi ${data.name},</p>
            <p>We noticed a new sign-in to your <strong>${data.appName}</strong> account from a device we haven't seen recently.</p>
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px 0;"><strong>Device:</strong> ${data.deviceName}</p>
              <p style="margin: 0 0 8px 0;"><strong>Location:</strong> ${data.location}</p>
              <p style="margin: 0;"><strong>Time:</strong> ${data.time}</p>
            </div>
            <p>If this was you, you can safely ignore this email.</p>
            <p><strong>If you don't recognize this activity, someone else might be trying to access your account.</strong> Please secure your account immediately by resetting your password.</p>
            <div class="button-container">
              <a href="${link}" class="button" style="background-color: #ef4444;">Secure My Account</a>
            </div>
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
