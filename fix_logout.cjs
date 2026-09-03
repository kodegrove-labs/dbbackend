const fs = require('fs');
let code = fs.readFileSync('src/auth/auth.controller.ts', 'utf8');
code = code.replace(
  "res.clearCookie('token', { sameSite: 'none', secure: true });",
  "res.clearCookie('token', { httpOnly: true, sameSite: 'none', secure: true });"
);
code = code.replace(
  "res.clearCookie('refresh_token', { sameSite: 'none', secure: true });",
  "res.clearCookie('refresh_token', { httpOnly: true, sameSite: 'none', secure: true });"
);
fs.writeFileSync('src/auth/auth.controller.ts', code);
