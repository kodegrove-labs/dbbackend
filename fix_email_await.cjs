const fs = require('fs');

// Fix register.flow.ts
let regCode = fs.readFileSync('src/flow/register.flow.ts', 'utf8');
regCode = regCode.replace(
  /\(async \(\) => \{\n\s*try \{\n\s*await sendWelcomeEmail[\s\S]*?\}\(\)\);/,
  `try {
    await sendWelcomeEmail(email, username || email.split('@')[0]);
    await sendVerificationEmail(email, token);
  } catch (e) {
    console.error('Failed to send registration emails:', e);
  }`
);
fs.writeFileSync('src/flow/register.flow.ts', regCode);

// Fix google-login.flow.ts
let googleCode = fs.readFileSync('src/flow/google-login.flow.ts', 'utf8');
googleCode = googleCode.replace(
  "sendWelcomeEmail(email, payload.name || email.split('@')[0]).catch(console.error);",
  "await sendWelcomeEmail(email, payload.name || email.split('@')[0]).catch(console.error);"
);
fs.writeFileSync('src/flow/google-login.flow.ts', googleCode);
