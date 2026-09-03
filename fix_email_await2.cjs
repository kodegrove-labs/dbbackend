const fs = require('fs');

// Fix register.flow.ts
let regCode = fs.readFileSync('src/flow/register.flow.ts', 'utf8');
const searchStr = `  (async () => {
    try {
      await sendWelcomeEmail(email, username || email.split('@')[0]);
      await sendVerificationEmail(email, token);
    } catch (e) {
      console.error('Failed to send registration emails:', e);
    }
  })();`;

const replaceStr = `  try {
    await sendWelcomeEmail(email, username || email.split('@')[0]);
    await sendVerificationEmail(email, token);
  } catch (e) {
    console.error('Failed to send registration emails:', e);
  }`;

regCode = regCode.replace(searchStr, replaceStr);

// Just in case it's in a single line or formatting is different
if(regCode.includes('(async () => {')) {
  regCode = regCode.replace(/\(async \(\) => \{\s*try \{\s*await sendWelcomeEmail\(email, username \|\| email.split\('@'\)\[0\]\);\s*await sendVerificationEmail\(email, token\);\s*\} catch \(e\) \{\s*console.error\('Failed to send registration emails:', e\);\s*\}\s*\}\)\(\);/g, replaceStr);
}

fs.writeFileSync('src/flow/register.flow.ts', regCode);
