"use strict";
const mysql = require('mysql2/promise');

async function main() {
  try {
    console.log('Connecting...');
    const c = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '123456',
      database: 'resume_system'
    });
    console.log('Connected!');
    
    const [rows] = await c.query('SELECT id, name, html_content FROM templates');
    console.log('Rows:', rows.length);
    
    rows.forEach(function(x) {
      try {
        var obj = JSON.parse(x.html_content);
        console.log('ID: ' + x.id + ' | Name: ' + x.name);
        console.log('  layout.type: ' + (obj.layout ? obj.layout.type : 'N/A'));
        console.log('  sectionStyles keys: ' + Object.keys(obj.sectionStyles || {}).join(', '));
        console.log('---');
      } catch(e) {
        console.log('PARSE ERROR: ' + e.message);
      }
    });
    
    await c.end();
    process.exit(0);
  } catch(e) {
    console.error('Error type:', e.constructor.name);
    console.error('Error code:', e.code);
    console.error('Error errno:', e.errno);
    console.error('Error message:', e.message);
    console.error('Error stack:', e.stack);
    process.exit(1);
  }
}

main();
