const fs = require('fs');
let code = fs.readFileSync('src/frontend/database/FlatView.tsx', 'utf8');

code = code.replace(/className="overflow-x-auto"/g, 'className="overflow-auto max-h-[400px]"');
code = code.replace(/<thead className="bg-gray-50 text-gray-600">/g, '<thead className="bg-gray-50 text-gray-600 sticky top-0 z-10 shadow-sm">');

fs.writeFileSync('src/frontend/database/FlatView.tsx', code);
