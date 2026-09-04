const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  '<header className="max-w-7xl w-full mb-8 text-center">',
  '<header className="w-full mb-8 text-center">'
);

content = content.replace(
  '<nav className="max-w-7xl w-full flex flex-wrap gap-3 justify-center mb-8">',
  '<nav className="w-full flex flex-wrap gap-3 justify-center mb-8">'
);

content = content.replace(
  '<main className="max-w-7xl w-full flex-1 flex flex-col bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden relative">',
  '<main className="w-full flex-1 flex flex-col bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden relative">'
);

fs.writeFileSync('src/App.tsx', content);
console.log("Updated App.tsx successfully");
