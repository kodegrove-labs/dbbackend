import { baseStyles } from './baseStyles';

type VerifyEmailData = {
  name: string;
  verifyLink: string;
  appName: string;
};

export const verifyEmail = (data: VerifyEmailData) => {
  const year = new Date().getFullYear();

  return {
    subject: `Verify your email for ${data.appName}`,

    text: `Hi ${data.name},

Please verify your email address by visiting the link below:

${data.verifyLink}

If you didn't create an account with ${data.appName}, you can safely ignore this email.

© ${year} ${data.appName}. All rights reserved.`,

    html: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>${baseStyles}</style>
        </head>

        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email Address</h1>
            </div>

            <div class="content">
              <p>Hi ${data.name},</p>

              <p>
                Please verify your email address by clicking the button below.
              </p>

              <div class="button-container">
                <a
                  href="${data.verifyLink}"
                  class="button"
                  role="button"
                >
                  Verify Email
                </a>
              </div>

              <p>
                If the button doesn't work, copy and paste this link into
                your browser:
              </p>

              <p style="word-break: break-all;">
                <a href="${data.verifyLink}">
                  ${data.verifyLink}
                </a>
              </p>

              <p>
                If you didn't create an account with ${data.appName},
                you can safely ignore this email.
              </p>
            </div>

            <div class="footer">
              <p>&copy; ${year} ${data.appName}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
};
