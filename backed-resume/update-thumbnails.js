'use strict';

const mysql = require('mysql2/promise');

// 简单的 SVG 占位图（base64 data URL，避免外部依赖）
// 宽200 高280 白底黑框
const svgBlackWhite = `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="280" viewBox="0 0 200 280">
<rect width="200" height="280" fill="#ffffff"/>
<rect x="20" y="30" width="160" height="12" rx="2" fill="#111111"/>
<rect x="20" y="52" width="100" height="8" rx="2" fill="#888888"/>
<rect x="20" y="80" width="140" height="6" rx="1" fill="#cccccc"/>
<rect x="20" y="94" width="120" height="6" rx="1" fill="#cccccc"/>
<rect x="20" y="108" width="130" height="6" rx="1" fill="#cccccc"/>
<rect x="20" y="140" width="80" height="8" rx="1" fill="#111111"/>
<rect x="20" y="156" width="160" height="4" rx="1" fill="#e5e5e5"/>
<rect x="20" y="168" width="140" height="4" rx="1" fill="#e5e5e5"/>
<rect x="20" y="180" width="150" height="4" rx="1" fill="#e5e5e5"/>
<rect x="20" y="200" width="80" height="8" rx="1" fill="#111111"/>
<rect x="20" y="216" width="160" height="4" rx="1" fill="#e5e5e5"/>
<rect x="20" y="228" width="120" height="4" rx="1" fill="#e5e5e5"/>
<rect x="20" y="248" width="80" height="8" rx="1" fill="#111111"/>
<rect x="20" y="264" width="160" height="4" rx="1" fill="#e5e5e5"/>
</svg>`).toString('base64')}`;

// 蓝色
const svgBlue = `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="280" viewBox="0 0 200 280">
<rect width="200" height="280" fill="#1a56db"/>
<rect x="20" y="30" width="160" height="14" rx="2" fill="#ffffff"/>
<rect x="20" y="52" width="110" height="8" rx="2" fill="rgba(255,255,255,0.75)"/>
<rect x="20" y="85" width="80" height="7" rx="1" fill="rgba(255,255,255,0.6)"/>
<rect x="20" y="100" width="160" height="3" rx="1" fill="rgba(255,255,255,0.2)"/>
<rect x="20" y="108" width="140" height="3" rx="1" fill="rgba(255,255,255,0.2)"/>
<rect x="20" y="130" width="80" height="7" rx="1" fill="rgba(255,255,255,0.6)"/>
<rect x="20" y="145" width="160" height="3" rx="1" fill="rgba(255,255,255,0.2)"/>
<rect x="20" y="153" width="130" height="3" rx="1" fill="rgba(255,255,255,0.2)"/>
<rect x="20" y="175" width="80" height="7" rx="1" fill="rgba(255,255,255,0.6)"/>
<rect x="20" y="190" width="160" height="3" rx="1" fill="rgba(255,255,255,0.2)"/>
<rect x="20" y="198" width="110" height="3" rx="1" fill="rgba(255,255,255,0.2)"/>
<rect x="20" y="220" width="80" height="7" rx="1" fill="rgba(255,255,255,0.6)"/>
<rect x="20" y="235" width="160" height="3" rx="1" fill="rgba(255,255,255,0.2)"/>
<rect x="20" y="243" width="140" height="3" rx="1" fill="rgba(255,255,255,0.2)"/>
</svg>`).toString('base64')}`;

// 绿色
const svgGreen = `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="280" viewBox="0 0 200 280">
<rect width="200" height="280" fill="#10b981"/>
<rect x="20" y="25" width="160" height="14" rx="2" fill="#ffffff"/>
<rect x="20" y="47" width="100" height="8" rx="2" fill="rgba(255,255,255,0.8)"/>
<rect x="20" y="75" width="70" height="6" rx="1" fill="rgba(255,255,255,0.6)"/>
<rect x="20" y="88" width="160" height="2" rx="1" fill="rgba(255,255,255,0.15)"/>
<rect x="20" y="95" width="130" height="2" rx="1" fill="rgba(255,255,255,0.15)"/>
<rect x="20" y="110" width="70" height="6" rx="1" fill="rgba(255,255,255,0.6)"/>
<rect x="20" y="123" width="160" height="2" rx="1" fill="rgba(255,255,255,0.15)"/>
<rect x="20" y="130" width="110" height="2" rx="1" fill="rgba(255,255,255,0.15)"/>
<rect x="20" y="145" width="70" height="6" rx="1" fill="rgba(255,255,255,0.6)"/>
<rect x="20" y="158" width="160" height="2" rx="1" fill="rgba(255,255,255,0.15)"/>
<rect x="20" y="165" width="140" height="2" rx="1" fill="rgba(255,255,255,0.15)"/>
<rect x="20" y="185" width="70" height="6" rx="1" fill="rgba(255,255,255,0.6)"/>
<rect x="20" y="198" width="160" height="2" rx="1" fill="rgba(255,255,255,0.15)"/>
<rect x="20" y="205" width="100" height="2" rx="1" fill="rgba(255,255,255,0.15)"/>
<rect x="20" y="225" width="70" height="6" rx="1" fill="rgba(255,255,255,0.6)"/>
<rect x="20" y="238" width="160" height="2" rx="1" fill="rgba(255,255,255,0.15)"/>
<rect x="20" y="245" width="120" height="2" rx="1" fill="rgba(255,255,255,0.15)"/>
</svg>`).toString('base64')}`;

async function main() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'resume_system',
    charset: 'utf8mb4'
  });

  const updates = [
    { id: 1, name: 'Simple Black White', thumbnail: svgBlackWhite },
    { id: 2, name: 'Blue Professional', thumbnail: svgBlue },
    { id: 3, name: 'Green Fresh', thumbnail: svgGreen }
  ];

  for (const { id, name, thumbnail } of updates) {
    await pool.execute(
      'UPDATE templates SET thumbnail = ? WHERE id = ?',
      [thumbnail, id]
    );
    console.log(`✅ Thumbnail [${id}] "${name}" updated`);
  }

  await pool.end();
  console.log('\n🎉 All thumbnails updated!');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
