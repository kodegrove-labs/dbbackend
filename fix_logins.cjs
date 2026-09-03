const fs = require('fs');

// Fix loginUserFlow
let loginCode = fs.readFileSync('src/flow/login.flow.ts', 'utf8');
loginCode = loginCode.replace(
  "return { accessToken, refreshToken, user",
  "await db.update(users).set({ last_sign_in_at: new Date() }).where(eq(users.id, user.id));\n  return { accessToken, refreshToken, user"
);
fs.writeFileSync('src/flow/login.flow.ts', loginCode);

// Fix google-login.flow.ts
let googleCode = fs.readFileSync('src/flow/google-login.flow.ts', 'utf8');
googleCode = googleCode.replace(
  "return { accessToken, refreshToken, user",
  "await db.update(users).set({ last_sign_in_at: new Date() }).where(eq(users.id, user.id));\n  return { accessToken, refreshToken, user"
);
fs.writeFileSync('src/flow/google-login.flow.ts', googleCode);

// Fix register.flow.ts so that registering auto-sets last_sign_in_at? No, registration doesn't issue a token right away, they still have to log in. Wait, register.flow.ts doesn't return tokens. Wait, it doesn't? Let's check auth.controller.ts.
