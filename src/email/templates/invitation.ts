import { baseStyles } from './baseStyles';

export const invitation = (data: { inviterName: string; teamName: string; appName: string; inviteLink?: string }) => {
  const link = data.inviteLink || 'https://google.com';
  return {
    subject: `You've been invited to join ${data.teamName} on ${data.appName}`,
    text: `Hi there,\n\n${data.inviterName} has invited you to join the ${data.teamName} team on ${data.appName}.\n\nClick the link below to accept the invitation and get started:\n${link}\n\nIf you don't want to join this team, you can ignore this email.\n\n© ${new Date().getFullYear()} ${data.appName}. All rights reserved.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="header" style="background-color: #10b981;">
            <h1>Team Invitation</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p><strong>${data.inviterName}</strong> has invited you to collaborate with them on the <strong>${data.teamName}</strong> team in ${data.appName}.</p>
            <p>By joining, you'll get access to shared projects, resources, and be able to collaborate with your team members in real-time.</p>
            <div class="button-container">
              <a href="${link}" class="button" style="background-color: #10b981;">Accept Invitation</a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">If you don't know ${data.inviterName} or don't want to join this team, you can safely ignore this email.</p>
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
