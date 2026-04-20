const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'resume_system'
  });
  
  console.log('Connected to database');
  
  // 更新模板使用次数
  await conn.query('UPDATE templates SET use_count = 150 WHERE id = 1');
  await conn.query('UPDATE templates SET use_count = 89 WHERE id = 2');
  await conn.query('UPDATE templates SET use_count = 45 WHERE id = 3');
  console.log('Updated templates use_count');
  
  // 获取 testuser 的 ID
  const [users] = await conn.query('SELECT id FROM c_users WHERE username = ?', ['testuser']);
  const userId = users[0]?.id;
  console.log('User ID:', userId);
  
  if (userId) {
    // 插入简历记录（最近7天的数据）
    const resumeValues = [];
    const aiOpValues = [];
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      dates.push(dateStr);
    }
    
    // 每天插入几条简历
    for (const dateStr of dates) {
      const count = Math.floor(Math.random() * 5) + 1;
      for (let j = 0; j < count; j++) {
        resumeValues.push([userId, 1, `Test Resume ${dateStr}-${j}`, '{}', '{}', dateStr]);
      }
    }
    
    // 插入简历
    if (resumeValues.length > 0) {
      await conn.query('INSERT INTO resumes (user_id, template_id, title, content, html_content, create_time) VALUES ?', [resumeValues]);
      console.log('Inserted', resumeValues.length, 'resumes');
    }
    
    // 插入 AI 操作记录
    const opTypes = ['optimize', 'translate', 'suggest', 'format'];
    for (const dateStr of dates) {
      const count = Math.floor(Math.random() * 10) + 2;
      for (let j = 0; j < count; j++) {
        aiOpValues.push([userId, opTypes[Math.floor(Math.random() * opTypes.length)], 'test input', 'test output', 100, dateStr]);
      }
    }
    
    if (aiOpValues.length > 0) {
      await conn.query('INSERT INTO ai_operations (user_id, operation_type, input_text, output_text, tokens_used, create_time) VALUES ?', [aiOpValues]);
      console.log('Inserted', aiOpValues.length, 'AI operations');
    }
  }
  
  // 验证数据
  const [resumeCount] = await conn.query('SELECT COUNT(*) as count FROM resumes');
  const [aiCount] = await conn.query('SELECT COUNT(*) as count FROM ai_operations');
  const [templates] = await conn.query('SELECT id, name, use_count FROM templates');
  
  console.log('\n=== Final Stats ===');
  console.log('Resumes:', resumeCount[0].count);
  console.log('AI Operations:', aiCount[0].count);
  console.log('Templates:', templates);
  
  await conn.end();
  console.log('\nDone!');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
