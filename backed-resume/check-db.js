const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'resume_system'
  });

  console.log('=== Templates ===');
  const [t] = await conn.query('SELECT id, name, use_count FROM templates');
  console.log(JSON.stringify(t, null, 2));

  console.log('\n=== Resumes count ===');
  const [r] = await conn.query('SELECT COUNT(*) as cnt FROM resumes');
  console.log(r);

  console.log('\n=== AI Operations count ===');
  const [a] = await conn.query('SELECT COUNT(*) as cnt FROM ai_operations');
  console.log(a);

  await conn.end();
}

main().catch(e => console.log('Error:', e.message));