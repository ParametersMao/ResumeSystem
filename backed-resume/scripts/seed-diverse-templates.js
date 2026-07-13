const mysql = require('mysql2/promise')

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'resume_system',
  charset: 'utf8mb4',
}

const legacySeedNames = [
  'ATS Minimal Clean',
  'Executive Black Gold',
  'Compact One Page',
  'Editorial Rose Brand',
  'Nordic Product Sidebar',
  'Data Analyst Timeline',
  'Creator Spotlight Orange',
  'Legal Classic Ink',
  '全民简历 · 极简 ATS 投递版',
  '全民简历 · 清爽教育经历版',
]

const templates = [
  makeTemplate({
    name: '全民简历 · 蓝色右上证件照',
    variant: 'ats',
    category: '通用',
    tags: '全民简历,右上照片,蓝色,单栏,行政,校招,社招',
    primary: '#5272B7',
    accent: '#8AA6E8',
    weight: 180,
    useCount: 92,
    avatar: { placement: 'header-right', shape: 'square', width: 94, height: 118 },
    description: '参考正式投递场景的单栏结构：姓名和求职信息在左，证件照固定右上，正文分组清晰。',
    thumb: 'top-photo',
  }),
  makeTemplate({
    name: '全民简历 · 左栏头像信息版',
    variant: 'sidebar',
    category: '通用',
    tags: '全民简历,双栏,左侧栏,头像,联系方式,技能',
    primary: '#5799C9',
    accent: '#EAF4FB',
    weight: 172,
    useCount: 88,
    avatar: { placement: 'sidebar-top', shape: 'square', width: 112, height: 136 },
    description: '左侧栏集中头像、基本信息和技能，右侧承载教育、经历和项目，适合信息较多的候选人。',
    thumb: 'sidebar',
  }),
  makeTemplate({
    name: '全民简历 · 居中标题头像版',
    variant: 'classic',
    category: '行政',
    tags: '全民简历,居中标题,右上照片,简洁,行政,职能',
    primary: '#173F5F',
    accent: '#DCE9F5',
    weight: 168,
    useCount: 77,
    avatar: { placement: 'header-right', shape: 'square', width: 92, height: 116 },
    description: '顶部标题居中，头像在右侧，个人信息横向排列，接近传统中文简历的正式版式。',
    thumb: 'center-title',
  }),
  makeTemplate({
    name: '全民简历 · 深蓝横条标题版',
    variant: 'compact',
    category: '职能',
    tags: '全民简历,深蓝,横条标题,一页,财务,法务,行政',
    primary: '#1F4E6D',
    accent: '#E5EEF5',
    weight: 162,
    useCount: 74,
    avatar: { placement: 'default', shape: 'square', width: 94, height: 118 },
    description: '深蓝模块标题条和紧凑信息流，适合希望一页承载较多经历的职能岗位。',
    thumb: 'ribbon',
  }),
  makeTemplate({
    name: '全民简历 · 图标时间轴版',
    variant: 'timeline',
    category: '技术',
    tags: '全民简历,时间轴,项目经历,技术,产品,数据',
    primary: '#3F8FBD',
    accent: '#E8F3F8',
    weight: 154,
    useCount: 68,
    avatar: { placement: 'meta-card', shape: 'square', width: 90, height: 112 },
    description: '用时间线组织工作和项目经历，适合项目较多、成长路径明确的技术/产品/数据岗位。',
    thumb: 'timeline',
  }),
  makeTemplate({
    name: '正式表格 · 规范信息版',
    variant: 'classic',
    category: '正式岗位',
    tags: '表格,正式,国企,事业单位,教师,医护,规范信息',
    primary: '#31577B',
    accent: '#EDF3F8',
    weight: 176,
    useCount: 0,
    avatar: { placement: 'header-right', shape: 'square', width: 78, height: 98 },
    description: '用规范表格承载基本信息与经历，字段边界清晰，适合国企、事业单位、教师和医护岗位。',
    thumb: 'table',
  }),
  makeTemplate({
    name: '技术开发 · ATS 单栏投递版',
    variant: 'ats',
    category: '技术',
    tags: 'ATS,技术开发,前端,后端,测试,数据,无照片,单栏',
    primary: '#243B53',
    accent: '#E8EDF3',
    weight: 190,
    useCount: 0,
    avatar: { enabled: false, placement: 'hidden', shape: 'square', width: 0, height: 0 },
    description: '无照片、单一阅读顺序，个人优势和技术技能前置，职位、公司和时间层级清晰，适合技术岗位与 ATS 系统投递。',
    thumb: 'ats',
  }),
  makeTemplate({
    name: '全民简历 · 商务高管深色版',
    variant: 'executive',
    category: '管理',
    tags: '高管,管理,咨询,商务,深色,稳重',
    primary: '#26384F',
    accent: '#C8A96A',
    weight: 138,
    useCount: 43,
    avatar: { placement: 'header-right', shape: 'square', width: 88, height: 112 },
    description: '稳重商务风，强调可信度、业绩和管理经验。',
    thumb: 'executive',
  }),
  makeTemplate({
    name: '专业人才 · 非对称能力叙事版',
    variant: 'editorial',
    category: '通用',
    tags: '非对称,能力叙事,技能进度,专业人才,资深职能,双栏',
    primary: '#386B78',
    accent: '#E8EFEC',
    weight: 182,
    useCount: 0,
    avatar: { placement: 'header-right', shape: 'square', width: 112, height: 142 },
    description: '左栏组织身份、基础信息、教育、技能与证书，右栏以照片和个人陈述起笔，再展开工作与项目主线。',
    thumb: 'asymmetric',
  }),
  makeTemplate({
    name: '应届校招 · 项目实习优先版',
    variant: 'editorial',
    category: '校招',
    tags: '校招,应届生,项目经历,实习经历,校园经历,教育背景',
    primary: '#2F80A7',
    accent: '#D9ECF5',
    weight: 185,
    useCount: 0,
    avatar: { placement: 'header-right', shape: 'square', width: 88, height: 112 },
    description: '教育信息压缩为顶部摘要，项目和实习进入正文主线，再补充校园成果、技能与荣誉。',
    thumb: 'student',
  }),
  makeTemplate({
    name: '产品运营 · 成果导向版',
    variant: 'spotlight',
    category: '产品运营',
    tags: '产品,运营,增长,市场,成果导向,数据分析,业务指标',
    primary: '#3156D3',
    accent: '#E8EDFF',
    weight: 188,
    useCount: 0,
    avatar: { enabled: false, placement: 'hidden', shape: 'square', width: 0, height: 0 },
    description: '用业务问题、个人行动和指标结果组织项目与经历，侧栏承载能力、教育和补充信息。',
    thumb: 'spotlight',
  }),
]

function makeTemplate({ name, variant, category, tags, primary, accent, weight, useCount, avatar, description, thumb }) {
  const layoutKey = {
    'top-photo': 'qm-blue-top-photo',
    sidebar: 'qm-sidebar-profile',
    'center-title': 'qm-classic-centered',
    ribbon: 'qm-ribbon-compact',
    timeline: 'qm-timeline-icons',
    table: 'qm-table-formal',
    ats: 'qm-minimal-ats',
    executive: 'qm-executive-business',
    student: 'qm-student-editorial',
    spotlight: 'qm-spotlight-featured',
    asymmetric: 'qm-asymmetric-profile',
  }[thumb] || 'qm-blue-top-photo'

  return {
    name,
    category,
    tags,
    useCount,
    thumbnail: makeResumeThumbnail({ name, primary, accent, variant, thumb }),
    htmlContent: JSON.stringify(
      {
        variant,
        layoutKey,
        recommendWeight: weight,
        meta: {
          source: 'original-qmjianli-structure-inspired',
          recommendWeight: weight,
          description,
        },
        layout: {
          key: layoutKey,
          variant,
          avatar,
        },
        sectionDefaults: thumb === 'asymmetric'
          ? {
              order: ['intention', 'education', 'skills', 'awards', 'summary', 'experience', 'projects', 'internship', 'campus', 'custom', 'hobbies'],
              visible: ['intention', 'education', 'skills', 'awards', 'summary', 'experience', 'projects'],
              hidden: ['internship', 'campus', 'custom', 'hobbies'],
            }
          : variant === 'editorial'
          ? {
              order: ['education', 'projects', 'internship', 'campus', 'skills', 'awards', 'summary', 'experience', 'intention', 'custom', 'hobbies'],
              visible: ['education', 'projects', 'internship', 'campus', 'skills', 'awards', 'summary', 'intention'],
              hidden: ['experience'],
            }
          : variant === 'spotlight'
            ? {
                order: ['summary', 'projects', 'experience', 'internship', 'skills', 'education', 'awards', 'intention', 'campus', 'custom', 'hobbies'],
                visible: ['summary', 'projects', 'experience', 'skills', 'education', 'intention'],
              }
          : undefined,
        theme: {
          variant,
          colors: {
            primary,
            accent,
          },
          typography: {
            fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
          },
          spacing: {
            sectionSpacing: variant === 'compact' ? 12 : variant === 'ats' ? 18 : 22,
            itemSpacing: variant === 'compact' ? 8 : 12,
          },
        },
      },
      null,
      2,
    ),
    cssContent: '',
  }
}

function makeResumeThumbnail({ name, primary, accent, variant, thumb }) {
  const safeName = escapeXml(name.replace(/^全民简历 · /, ''))
  const photo = photoSvg(primary)
  const section = (y, label, wide = true) => `
    <text x="42" y="${y}" font-size="13" fill="${primary}" font-weight="700" font-family="Arial, sans-serif">${label}</text>
    <rect x="42" y="${y + 7}" width="${wide ? 274 : 210}" height="1.2" fill="${primary}" opacity="0.85"/>
    <rect x="42" y="${y + 22}" width="86" height="5" rx="2.5" fill="#111827"/>
    <rect x="142" y="${y + 22}" width="${wide ? 146 : 104}" height="5" rx="2.5" fill="#111827" opacity="0.75"/>
    <rect x="42" y="${y + 37}" width="${wide ? 256 : 196}" height="4" rx="2" fill="#64748b" opacity="0.7"/>
    <rect x="42" y="${y + 49}" width="${wide ? 236 : 176}" height="4" rx="2" fill="#94a3b8" opacity="0.65"/>`

  const layouts = {
    sidebar: `
      <rect x="24" y="24" width="92" height="272" fill="${primary}"/>
      <image href="${photo}" x="51" y="46" width="38" height="48"/>
      <text x="48" y="116" font-size="18" fill="#fff" font-weight="700" font-family="Arial, sans-serif">张三</text>
      <rect x="42" y="138" width="54" height="4" rx="2" fill="#fff" opacity="0.8"/>
      <rect x="42" y="160" width="48" height="4" rx="2" fill="#fff" opacity="0.65"/>
      <rect x="42" y="176" width="56" height="4" rx="2" fill="#fff" opacity="0.65"/>
      <rect x="42" y="216" width="42" height="4" rx="2" fill="#fff" opacity="0.85"/>
      <rect x="42" y="232" width="50" height="12" rx="6" fill="#fff" opacity="0.25"/>
      <text x="136" y="54" font-size="15" fill="${primary}" font-weight="700" font-family="Arial, sans-serif">PERSONAL RESUME</text>
      ${section(82, '教育背景', false)}
      ${section(154, '工作经历', false)}
      ${section(226, '自我评价', false)}`,
    timeline: `
      <rect x="24" y="24" width="312" height="60" fill="${accent}"/>
      <text x="44" y="52" font-size="23" fill="#111827" font-weight="700" font-family="Arial, sans-serif">全民简历</text>
      <image href="${photo}" x="278" y="34" width="38" height="48"/>
      <line x1="74" y1="112" x2="74" y2="270" stroke="${primary}" stroke-width="2"/>
      <circle cx="74" cy="122" r="8" fill="${primary}"/>
      <circle cx="74" cy="186" r="8" fill="${primary}"/>
      <circle cx="74" cy="250" r="8" fill="${primary}"/>
      <text x="96" y="127" font-size="14" fill="${primary}" font-weight="700" font-family="Arial, sans-serif">教育背景</text>
      <rect x="96" y="142" width="190" height="24" rx="6" fill="#fff" stroke="#dbe3ee"/>
      <text x="96" y="191" font-size="14" fill="${primary}" font-weight="700" font-family="Arial, sans-serif">工作经历</text>
      <rect x="96" y="206" width="210" height="24" rx="6" fill="#fff" stroke="#dbe3ee"/>
      <text x="96" y="255" font-size="14" fill="${primary}" font-weight="700" font-family="Arial, sans-serif">项目经历</text>`,
    table: `
      <text x="180" y="50" text-anchor="middle" font-size="23" fill="${primary}" font-weight="700" font-family="Arial, sans-serif">个人简历</text>
      <rect x="40" y="70" width="280" height="54" fill="#fff" stroke="${primary}" stroke-width="1"/>
      <rect x="40" y="70" width="54" height="27" fill="${accent}" stroke="${primary}"/>
      <rect x="180" y="70" width="54" height="27" fill="${accent}" stroke="${primary}"/>
      <rect x="40" y="97" width="54" height="27" fill="${accent}" stroke="${primary}"/>
      <rect x="180" y="97" width="54" height="27" fill="${accent}" stroke="${primary}"/>
      <text x="55" y="88" font-size="9" fill="#334155" font-family="Arial, sans-serif">姓名</text>
      <text x="195" y="88" font-size="9" fill="#334155" font-family="Arial, sans-serif">岗位</text>
      <rect x="40" y="124" width="280" height="24" fill="${accent}" stroke="${primary}"/>
      <text x="52" y="140" font-size="11" fill="${primary}" font-weight="700" font-family="Arial, sans-serif">教育背景</text>
      <rect x="40" y="148" width="280" height="50" fill="#fff" stroke="${primary}"/>
      <line x1="124" y1="148" x2="124" y2="198" stroke="${primary}" opacity=".7"/>
      <rect x="40" y="198" width="280" height="24" fill="${accent}" stroke="${primary}"/>
      <text x="52" y="214" font-size="11" fill="${primary}" font-weight="700" font-family="Arial, sans-serif">工作经历</text>
      <rect x="40" y="222" width="280" height="52" fill="#fff" stroke="${primary}"/>
      <line x1="124" y1="222" x2="124" y2="274" stroke="${primary}" opacity=".7"/>`,
    centerTitle: `
      <text x="154" y="54" text-anchor="middle" font-size="25" fill="#111827" font-weight="700" font-family="Arial, sans-serif">全民简历</text>
      <text x="154" y="78" text-anchor="middle" font-size="9" fill="#334155" font-family="Arial, sans-serif">求职意向：行政专员｜上海｜3年经验</text>
      <image href="${photo}" x="276" y="42" width="42" height="54"/>
      ${section(120, '教育背景')}
      ${section(190, '工作经历')}`,
    ribbon: `
      <image href="${photo}" x="44" y="40" width="42" height="54"/>
      <text x="118" y="54" font-size="24" fill="#111827" font-weight="700" font-family="Arial, sans-serif">全民简历</text>
      <rect x="118" y="76" width="156" height="5" rx="2.5" fill="#64748b" opacity="0.5"/>
      <rect x="42" y="118" width="76" height="22" fill="${primary}"/>
      <text x="56" y="134" font-size="13" fill="#fff" font-weight="700" font-family="Arial, sans-serif">求职意向</text>
      <rect x="118" y="129" width="198" height="1.2" fill="#9ca3af"/>
      ${section(160, '教育背景')}
      ${section(228, '工作经历')}`,
    topPhoto: `
      <rect x="28" y="28" width="304" height="18" fill="${primary}"/>
      <text x="44" y="41" font-size="12" fill="#fff" font-family="Arial, sans-serif">PERSONAL RESUME</text>
      <text x="42" y="78" font-size="23" fill="${primary}" font-weight="700" font-family="Arial, sans-serif">全民简历</text>
      <text x="142" y="75" font-size="10" fill="${primary}" font-weight="700" font-family="Arial, sans-serif">求职岗位：行政专员</text>
      <image href="${photo}" x="278" y="68" width="42" height="54"/>
      <rect x="42" y="94" width="198" height="1.3" fill="#9ca3af"/>
      <rect x="42" y="112" width="94" height="5" rx="2.5" fill="#111827"/>
      <rect x="166" y="112" width="94" height="5" rx="2.5" fill="#111827"/>
      ${section(144, '教育背景')}
      ${section(214, '工作经历')}`,
    executive: `
      <rect x="24" y="24" width="312" height="70" fill="${primary}"/>
      <text x="44" y="58" font-size="24" fill="#fff" font-weight="700" font-family="Arial, sans-serif">全民简历</text>
      <rect x="44" y="72" width="92" height="3" fill="${accent}"/>
      <image href="${photo}" x="276" y="42" width="42" height="54"/>
      ${section(124, '核心优势')}
      ${section(194, '管理经历')}`,
    ats: `
      <text x="42" y="58" font-size="25" fill="#111827" font-weight="700" font-family="Arial, sans-serif">全民简历</text>
      <text x="42" y="82" font-size="10" fill="#334155" font-family="Arial, sans-serif">前端工程师｜上海｜13800138000｜zhangsan@example.com</text>
      <image href="${photo}" x="280" y="42" width="38" height="48"/>
      ${section(116, '教育背景')}
      ${section(184, '工作经历')}
      ${section(252, '技能特长')}`,
    spotlight: `
      <rect x="24" y="24" width="312" height="72" rx="8" fill="${primary}"/>
      <text x="44" y="55" font-size="22" fill="#fff" font-weight="700" font-family="Arial, sans-serif">产品运营</text>
      <text x="44" y="76" font-size="9" fill="#fff" opacity="0.82" font-family="Arial, sans-serif">PRODUCT · GROWTH · OUTCOMES</text>
      <rect x="42" y="116" width="78" height="160" rx="8" fill="${accent}"/>
      <text x="56" y="140" font-size="12" fill="${primary}" font-weight="700" font-family="Arial, sans-serif">核心能力</text>
      <rect x="56" y="154" width="48" height="12" rx="6" fill="${primary}" opacity="0.16"/>
      <rect x="56" y="174" width="54" height="12" rx="6" fill="${primary}" opacity="0.16"/>
      <text x="142" y="132" font-size="13" fill="${primary}" font-weight="700" font-family="Arial, sans-serif">代表项目</text>
      <rect x="142" y="142" width="166" height="1.2" fill="${primary}" opacity="0.85"/>
      <rect x="142" y="158" width="72" height="5" rx="2.5" fill="#111827"/>
      <rect x="226" y="158" width="68" height="5" rx="2.5" fill="#111827" opacity="0.65"/>
      <rect x="142" y="174" width="152" height="4" rx="2" fill="#64748b" opacity="0.65"/>
      <text x="142" y="212" font-size="13" fill="${primary}" font-weight="700" font-family="Arial, sans-serif">工作经历</text>
      <rect x="142" y="222" width="166" height="1.2" fill="${primary}" opacity="0.85"/>
      <rect x="142" y="238" width="82" height="5" rx="2.5" fill="#111827"/>
      <rect x="238" y="238" width="56" height="5" rx="2.5" fill="#111827" opacity="0.65"/>`,
    asymmetric: `
      <rect x="24" y="24" width="137" height="272" fill="${accent}"/>
      <text x="42" y="54" font-size="9" fill="${primary}" font-weight="700" font-family="Arial, sans-serif">PERSONAL PROFILE</text>
      <text x="42" y="82" font-size="22" fill="#1f2937" font-weight="700" font-family="Arial, sans-serif">王小明</text>
      <rect x="42" y="96" width="91" height="3" fill="${primary}"/>
      <rect x="42" y="120" width="46" height="4" rx="2" fill="#64748b"/>
      <rect x="42" y="134" width="74" height="4" rx="2" fill="#94a3b8"/>
      <rect x="42" y="170" width="75" height="4" rx="2" fill="#1f2937"/>
      <rect x="42" y="183" width="92" height="5" fill="#cbd5d1"/>
      <rect x="42" y="183" width="76" height="5" fill="${primary}"/>
      <rect x="42" y="210" width="69" height="4" rx="2" fill="#1f2937"/>
      <rect x="42" y="223" width="92" height="5" fill="#cbd5d1"/>
      <rect x="42" y="223" width="63" height="5" fill="${primary}"/>
      <image href="${photo}" x="184" y="42" width="52" height="66"/>
      <text x="250" y="54" font-size="9" fill="${primary}" font-weight="700" font-family="Arial, sans-serif">PROFILE</text>
      <rect x="250" y="70" width="64" height="5" rx="2" fill="#1f2937"/>
      <rect x="250" y="84" width="61" height="4" rx="2" fill="#94a3b8"/>
      <text x="184" y="142" font-size="12" fill="${primary}" font-weight="700" font-family="Arial, sans-serif">工作经历</text>
      <rect x="184" y="153" width="130" height="1" fill="${primary}"/>
      <rect x="184" y="170" width="72" height="5" rx="2" fill="#1f2937"/>
      <rect x="272" y="170" width="42" height="4" rx="2" fill="#94a3b8"/>
      <rect x="184" y="186" width="124" height="4" rx="2" fill="#64748b"/>
      <text x="184" y="226" font-size="12" fill="${primary}" font-weight="700" font-family="Arial, sans-serif">项目经历</text>
      <rect x="184" y="237" width="130" height="1" fill="${primary}"/>
      <rect x="184" y="254" width="78" height="5" rx="2" fill="#1f2937"/>
      <rect x="184" y="270" width="116" height="4" rx="2" fill="#64748b"/>`,
    student: `
      <rect x="24" y="24" width="312" height="56" fill="${accent}"/>
      <text x="44" y="58" font-size="24" fill="${primary}" font-weight="700" font-family="Arial, sans-serif">全民简历</text>
      <image href="${photo}" x="278" y="42" width="40" height="52"/>
      ${section(112, '教育背景')}
      ${section(180, '代表项目')}
      ${section(248, '实习经历')}`,
  }

  const body = layouts[thumb] || layouts.topPhoto
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="360" height="320" viewBox="0 0 360 320">
  <rect width="360" height="320" rx="20" fill="#eef2f7"/>
  <rect x="18" y="14" width="324" height="292" rx="6" fill="#ffffff" stroke="#d6dee9"/>
  ${body}
  <rect x="28" y="286" width="146" height="16" rx="8" fill="${primary}" opacity="0.1"/>
  <text x="42" y="298" font-size="10" fill="${primary}" font-weight="700" font-family="Arial, sans-serif">${safeName}</text>
</svg>`.trim()
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function photoSvg(primary) {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="80" height="100" viewBox="0 0 80 100">
  <rect width="80" height="100" fill="#fff"/>
  <circle cx="40" cy="30" r="17" fill="#f2c9a0"/>
  <path d="M20 31c3-20 34-25 42-4-5-5-12-8-22-8-9 0-16 3-20 12z" fill="#3b2418"/>
  <circle cx="34" cy="33" r="2.2" fill="#111827"/>
  <circle cx="47" cy="33" r="2.2" fill="#111827"/>
  <path d="M32 45c6 4 12 4 17 0" stroke="#b65c4a" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M17 100c2-26 14-39 23-39s21 13 23 39z" fill="${primary}"/>
  <path d="M31 64l9 17 9-17" fill="#fff" opacity=".92"/>
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
    const replaceNames = [...legacySeedNames, ...names]
    await connection.query('DELETE FROM templates WHERE name IN (?)', [replaceNames])

    for (const item of templates) {
      await connection.query(
        `INSERT INTO templates
          (name, thumbnail, html_content, css_content, category, tags, is_premium, is_active, use_count, create_time, update_time)
         VALUES (?, ?, ?, ?, ?, ?, 0, 1, ?, NOW(), NOW())`,
        [item.name, item.thumbnail, item.htmlContent, item.cssContent, item.category, item.tags, item.useCount],
      )
    }

    const [rows] = await connection.query(
      'SELECT id, name, tags, use_count FROM templates WHERE name IN (?) ORDER BY use_count DESC, id',
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
