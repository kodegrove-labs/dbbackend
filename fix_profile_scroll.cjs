const fs = require('fs');
let code = fs.readFileSync('src/frontend/ProfileTab.tsx', 'utf8');

code = code.replace(/<ul className="text-sm space-y-2">/g, '<ul className="text-sm space-y-2 max-h-48 overflow-y-auto pr-2">');

fs.writeFileSync('src/frontend/ProfileTab.tsx', code);
