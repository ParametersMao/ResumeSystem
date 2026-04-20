const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function run() {
  const hash = await bcrypt.hash('123456', 10);
  console.log('Generated hash:', hash);

  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'resume_system'
  });

  // Update c_users
  await conn.query('UPDATE c_users SET password=? WHERE username=?', [hash, 'testuser']);
  console.log('Updated c_users');

  // Update admin_users
  await conn.query('UPDATE admin_users SET password=? WHERE id IN (1,2)', [hash]);
  console.log('Updated admin_users');

  // Verify
  const [rows] = await conn.query('SELECT id, username, password FROM c_users WHERE username=?', ['testuser']);
  console.log('Stored hash:', rows[0].password);

  const match = await bcrypt.compare('123456', rows[0].password);
  console.log('Password match test:', match);

  await conn.end();
}

run().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
