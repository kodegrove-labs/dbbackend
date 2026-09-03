const fs = require('fs');

let loginCode = fs.readFileSync('src/flow/login.flow.ts', 'utf8');
loginCode = loginCode.replace(
  "await db.update(users).set({ last_sign_in_at: new Date() }).where(eq(users.id, user.id));",
  "await db.update(users).set({ last_sign_in_at: new Date(), updated_at: new Date() }).where(eq(users.id, user.id));"
);
fs.writeFileSync('src/flow/login.flow.ts', loginCode);

let googleCode = fs.readFileSync('src/flow/google-login.flow.ts', 'utf8');
googleCode = googleCode.replace(
  "await db.update(users).set({ last_sign_in_at: new Date() }).where(eq(users.id, user.id));",
  "await db.update(users).set({ last_sign_in_at: new Date(), updated_at: new Date() }).where(eq(users.id, user.id));"
);
fs.writeFileSync('src/flow/google-login.flow.ts', googleCode);
