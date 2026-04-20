const mysql = require('mysql2/promise');
async function addStatusField() {
  const conn = await mysql.createConnection({host:'localhost',user:'root',password:'123456',database:'resume_system'});
  
  // 添加 status 字段
  await conn.query(`
    ALTER TABLE ai_operations 
    ADD COLUMN status ENUM('processing', 'success', 'failed') DEFAULT 'success' 
    AFTER tokens_used
  `);
  
  console.log('Added status field to ai_operations table');
  await conn.end();
}
addStatusField();
