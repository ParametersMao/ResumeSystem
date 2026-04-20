const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'resume_system',
    charset: 'utf8mb4'
  });

  const [rows] = await pool.execute('SELECT id, name, LENGTH(html_content) as len FROM templates ORDER BY id');
  console.log('模板数据长度:', JSON.stringify(rows, null, 2));
  
  // 获取一个模板的片段
  const [row] = await pool.execute('SELECT LEFT(html_content, 500) as sample FROM templates WHERE id = 1');
  console.log('模板1前500字符:', row[0].sample?.substring(0, 500));
  
  await pool.end();
}

main().catch(console.error);