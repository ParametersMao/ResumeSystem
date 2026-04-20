const mysql = require('mysql2/promise');
async function check() {
  const conn = await mysql.createConnection({host:'localhost',user:'root',password:'123456',database:'resume_system'});
  const [rows] = await conn.query('DESCRIBE ai_operations');
  console.log('=== ai_operations table ===');
  console.log(JSON.stringify(rows, null, 2));
  await conn.end();
}
check();
