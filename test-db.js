const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL);
sql`SELECT 1 as num`.then(res => { console.log(res); process.exit(0); }).catch(err => { console.error(err); process.exit(1); });
