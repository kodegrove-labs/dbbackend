import postgres from 'postgres';
const url = new URL(process.env.DATABASE_URL as string);
url.password = encodeURIComponent(decodeURIComponent(url.password));
console.log('Using URL:', url.href.replace(url.password, '***'));
const sql = postgres(url.href);
sql`SELECT 1 as num`.then(res => { console.log('SUCCESS:', res); process.exit(0); }).catch(err => { console.error('FAILED:', err); process.exit(1); });
