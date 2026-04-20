const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'resume_system'
  });

  console.log('=== resumes table ===');
  const [rows] = await conn.query('DESCRIBE resumes');
  console.log(JSON.stringify(rows, null, 2));

  console.log('\n=== Sample data ===');
  const [data] = await conn.query('SELECT * FROM resumes LIMIT 2');
  console.log(JSON.stringify(data, null, 2));

  await conn.end();
}

main().catch(e => console.log('Error:', e.message));