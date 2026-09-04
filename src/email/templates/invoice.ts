import { baseStyles } from './baseStyles';

export const invoice = (data: { name: string; appName: string; amount: string; invoiceId: string; date: string; receiptLink?: string }) => {
  const link = data.receiptLink || 'https://google.com';
  return {
    subject: `Your Receipt from ${data.appName} [${data.invoiceId}]`,
    text: `Hi ${data.name},\n\nThank you for your purchase from ${data.appName}.\n\nInvoice ID: ${data.invoiceId}\nDate: ${data.date}\nAmount Paid: ${data.amount}\n\nYou can view your receipt here: ${link}\n\nIf you have any questions, simply reply to this email.\n\n© ${new Date().getFullYear()} ${data.appName}. All rights reserved.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank you for your purchase!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.name},</p>
            <p>We've successfully processed your payment. Here are the details of your transaction:</p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Invoice ID</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.invoiceId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Date</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; font-size: 18px;">Total Paid</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold; font-size: 18px; color: #111827;">${data.amount}</td>
              </tr>
            </table>
            <div class="button-container">
              <a href="${link}" class="button" style="background-color: #374151;">View Receipt Online</a>
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
