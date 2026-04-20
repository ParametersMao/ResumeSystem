const mysql = require('mysql2/promise');

async function main() {
  try {
    const c = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '123456',
      database: 'resume_system'
    });
    
    const [rows] = await c.query('SELECT id, name, html_content FROM templates');
    
    rows.forEach(x => {
      try {
        const obj = JSON.parse(x.html_content);
        console.log('ID:', x.id, '| Name:', x.name);
        console.log('  layout.type:', obj.layout?.type);
        console.log('  theme.colors.primary:', obj.theme?.colors?.primary);
        console.log('  sectionStyles keys:', Object.keys(obj.sectionStyles || {}).join(', '));
        console.log('  ---');
      } catch(e) {
        console.log('ID:', x.id, '| Name:', x.name, '| PARSE ERROR:', e.message);
      }
    });
    
    await c.end();
  } catch(e) {
    console.error('Connection error:', e.message);
  }
}

main();
