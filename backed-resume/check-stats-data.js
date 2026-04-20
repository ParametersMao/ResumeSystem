const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'resume_system'
  });
  
  // 检查简历按日期分组
  const [resumeTrend] = await conn.query(`
    SELECT DATE(create_time) as date, COUNT(*) as count 
    FROM resumes 
    GROUP BY DATE(create_time) 
    ORDER BY date DESC 
    LIMIT 7
  `);
  console.log('Resume trend:', resumeTrend);
  
  // 检查用户趋势
  const [userTrend] = await conn.query(`
    SELECT DATE(create_time) as date, COUNT(*) as count 
    FROM c_users 
    GROUP BY DATE(create_time) 
    ORDER BY date DESC 
    LIMIT 7
  `);
  console.log('User trend:', userTrend);
  
  // 检查 AI 操作趋势
  const [aiTrend] = await conn.query(`
    SELECT DATE(create_time) as date, COUNT(*) as count 
    FROM ai_operations 
    GROUP BY DATE(create_time) 
    ORDER BY date DESC 
    LIMIT 7
  `);
  console.log('AI trend:', aiTrend);
  
  // 热门模板
  const [templates] = await conn.query(`
    SELECT id, name, use_count 
    FROM templates 
    ORDER BY use_count DESC 
    LIMIT 5
  `);
  console.log('Popular templates:', templates);
  
  // 用户活跃度（按 AI 操作次数）
  const [userActivity] = await conn.query(`
    SELECT u.id, u.username, COUNT(ao.id) as ai_operation_count
    FROM c_users u
    LEFT JOIN ai_operations ao ON u.id = ao.user_id
    GROUP BY u.id, u.username
    ORDER BY ai_operation_count DESC
    LIMIT 10
  `);
  console.log('User activity:', userActivity);
  
  await conn.end();
}

main().catch(console.error);
