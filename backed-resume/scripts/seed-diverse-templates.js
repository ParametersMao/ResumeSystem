const mysql = require('mysql2/promise')

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'resume_system',
  charset: 'utf8mb4',
}

const templates = [
  makeTemplate({
    name: 'ATS Minimal Clean',
    variant: 'ats',
    category: '通用',
    tags: 'ats,极简,正式,校招,社招',
    primary: '#111827',
    weight: 135,
    useCount: 34,
    description: '为投递系统和正式打印优化的极简版式。',
  }),
  makeTemplate({
    name: 'Executive Black Gold',
    variant: 'executive',
    category: '管理',
    tags: '管理岗,咨询,运营,黑金,商务',
    primary: '#92400e',
    weight: 128,
    useCount: 22,
    description: '稳重商务风，适合管理岗、咨询和负责人岗位。',
  }),
  makeTemplate({
    name: 'Compact One Page',
    variant: 'compact',
    category: '技术',
    tags: '一页简历,项目多,技术岗,紧凑',
    primary: '#334155',
    weight: 118,
    useCount: 28,
    description: '信息密度更高，适合项目经历较多的人。',
  }),
  makeTemplate({
    name: 'Editorial Rose Brand',
    variant: 'editorial',
    category: '创意',
    tags: '品牌,市场,内容,创意,运营',
    primary: '#e11d48',
    weight: 112,
    useCount: 18,
    description: '带杂志感头图，适合内容、品牌、市场和创意岗位。',
  }),
  makeTemplate({
    name: 'Nordic Product Sidebar',
    variant: 'sidebar',
    category: '产品',
    tags: '产品经理,SaaS,北欧,双栏',
    primary: '#0f766e',
    weight: 106,
    useCount: 26,
    description: '冷静克制的双栏产品经理模板。',
  }),
  makeTemplate({
    name: 'Data Analyst Timeline',
    variant: 'timeline',
    category: '数据',
    tags: '数据分析,商业分析,时间轴,成长路径',
    primary: '#0891b2',
    weight: 104,
    useCount: 19,
    description: '用时间轴呈现分析项目和业务成果。',
  }),
  makeTemplate({
    name: 'Creator Spotlight Orange',
    variant: 'spotlight',
    category: '创意',
    tags: '新媒体,设计,作品集,橙色,封面',
    primary: '#f97316',
    weight: 100,
    useCount: 15,
    description: '更有视觉冲击力的聚焦封面模板。',
  }),
  makeTemplate({
    name: 'Legal Classic Ink',
    variant: 'classic',
    category: '职能',
    tags: '法务,财务,行政,严谨,经典',
    primary: '#1f2937',
    weight: 96,
    useCount: 12,
    description: '适合严谨职能岗位的深墨经典单栏。',
  }),
]

function makeTemplate({ name, variant, category, tags, primary, weight, useCount, description }) {
  return {
    name,
    category,
    tags,
    useCount,
    thumbnail: makeThumbnail(name, primary, variant),
    htmlContent: JSON.stringify({
      variant,
      recommendWeight: weight,
      meta: {
        recommendWeight: weight,
        description,
      },
      layout: {
        variant,
      },
      theme: {
        variant,
        colors: {
          primary,
        },
        typography: {
          fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
        },
        spacing: {
          sectionSpacing: variant === 'compact' ? 14 : variant === 'ats' ? 18 : 24,
          itemSpacing: variant === 'compact' ? 8 : variant === 'ats' ? 10 : 14,
        },
      },
    }, null, 2),
    cssContent: '',
  }
}

function makeThumbnail(name, color, variant) {
  const title = escapeXml(name)
  const chip = escapeXml(variant.toUpperCase())
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="360" height="240" viewBox="0 0 360 240">
  <rect width="360" height="240" rx="22" fill="#f8fafc"/>
  <rect x="24" y="24" width="312" height="192" rx="16" fill="#ffffff" stroke="#e2e8f0"/>
  <rect x="44" y="44" width="96" height="10" rx="5" fill="${color}"/>
  <rect x="44" y="66" width="136" height="18" rx="9" fill="#0f172a"/>
  <rect x="44" y="96" width="232" height="6" rx="3" fill="#cbd5e1"/>
  <rect x="44" y="114" width="188" height="6" rx="3" fill="#e2e8f0"/>
  <rect x="44" y="142" width="272" height="42" rx="12" fill="${color}" opacity="0.12"/>
  <rect x="260" y="44" width="56" height="22" rx="11" fill="${color}" opacity="0.16"/>
  <text x="288" y="59" text-anchor="middle" font-size="10" font-family="Arial" fill="${color}" font-weight="700">${chip}</text>
  <text x="44" y="206" font-size="14" font-family="Arial" fill="#334155" font-weight="700">${title}</text>
</svg>`.trim()
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function main() {
  const connection = await mysql.createConnection(dbConfig)
  try {
    const names = templates.map((item) => item.name)
    await connection.query('DELETE FROM templates WHERE name IN (?)', [names])

    for (const item of templates) {
      await connection.query(
        `INSERT INTO templates
          (name, thumbnail, html_content, css_content, category, tags, is_premium, is_active, use_count, create_time, update_time)
         VALUES (?, ?, ?, ?, ?, ?, 0, 1, ?, NOW(), NOW())`,
        [item.name, item.thumbnail, item.htmlContent, item.cssContent, item.category, item.tags, item.useCount],
      )
    }

    const [rows] = await connection.query(
      'SELECT id, name, tags, use_count FROM templates WHERE name IN (?) ORDER BY id',
      [names],
    )
    console.table(rows)
  } finally {
    await connection.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
