"use strict";
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
    
    rows.forEach(function(x) {
      try {
        var obj = JSON.parse(x.html_content);
        console.log('ID: ' + x.id + ' | Name: ' + x.name);
        console.log('  layout.type: ' + (obj.layout ? obj.layout.type : 'N/A'));
        console.log('  theme.colors.primary: ' + (obj.theme && obj.theme.colors ? obj.theme.colors.primary : 'N/A'));
        console.log('  sectionStyles keys: ' + Object.keys(obj.sectionStyles || {}).join(', '));
        console.log('---');
      } catch(e) {
        console.log('PARSE ERROR: ' + e.message);
      }
    });
    
    await c.end();
    process.exit(0);
  } catch(e) {
    console.error('Connection error: ' + e.message);
    process.exit(1);
  }
}

main();
