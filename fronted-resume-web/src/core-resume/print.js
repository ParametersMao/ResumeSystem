const coreResumePrintStyles = `
  @page {
    size: A4;
    margin: 5mm;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    background: #ffffff;
  }

  body {
    font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
    color: #0f172a;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .core-preview-shell {
    padding: 0;
    background: #ffffff;
  }

  .resume-sheet {
    width: 100%;
    min-height: auto;
    margin: 0 auto;
    padding: 0;
    background: #fff;
    box-shadow: none;
    border-radius: 0;
    font-family: var(--resume-font);
    font-size: var(--resume-font-size);
    line-height: var(--resume-line-height);
    color: #0f172a;
  }

  .resume-header {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    padding-bottom: 24px;
    margin-bottom: var(--resume-section-spacing);
    border-bottom: 2px solid rgba(37, 99, 235, 0.16);
    break-inside: avoid;
  }

  .resume-identity {
    min-width: 0;
  }

  .resume-header-side {
    display: flex;
    align-items: flex-start;
    gap: 18px;
  }

  .resume-avatar {
    width: 86px;
    height: 108px;
    flex: 0 0 auto;
    border-radius: 18px;
    object-fit: cover;
    border: 1px solid rgba(148, 163, 184, 0.28);
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
    background: #fff;
  }

  .avatar-shape-circle {
    border-radius: 999px;
  }

  .avatar-shape-square {
    border-radius: 6px;
  }

  .avatar-shape-rounded {
    border-radius: 18px;
  }

  .sidebar-avatar {
    width: 96px;
    height: 120px;
    margin-bottom: 18px;
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 14px 30px rgba(15, 23, 42, 0.16);
  }

  .timeline-avatar {
    justify-self: end;
  }

  .spotlight-avatar {
    justify-self: center;
    width: 96px;
    height: 120px;
  }

  .resume-name {
    margin: 0 0 8px;
    font-size: 34px;
    line-height: 1.1;
    font-family: var(--resume-heading-font);
  }

  .resume-role {
    margin: 0;
    font-size: 16px;
    color: var(--resume-primary);
    font-weight: 600;
  }

  .resume-meta {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 220px;
    color: #475569;
  }

  .resume-sheet.variant-sidebar,
  .resume-sheet.variant-timeline,
  .resume-sheet.variant-spotlight {
    overflow: hidden;
  }

  .resume-sheet.variant-sidebar {
    padding: 0;
  }

  .resume-sheet.variant-timeline {
    padding: 34px 38px 42px;
    background: linear-gradient(180deg, rgba(37, 99, 235, 0.06), rgba(37, 99, 235, 0)) #ffffff;
  }

  .resume-sheet.variant-spotlight {
    padding: 0;
    background: linear-gradient(180deg, rgba(15, 23, 42, 0.02), rgba(15, 23, 42, 0)) #fff;
  }

  .sidebar-layout {
    display: grid;
    grid-template-columns: 250px minmax(0, 1fr);
    min-height: auto;
  }

  .sidebar-column {
    padding: 42px 26px;
    background: linear-gradient(180deg, var(--resume-primary), #0f172a);
    color: #eff6ff;
  }

  .sidebar-identity {
    margin-bottom: 28px;
  }

  .sidebar-column .resume-role {
    color: rgba(255, 255, 255, 0.92);
  }

  .sidebar-meta-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: #dbeafe;
  }

  .sidebar-block + .sidebar-block {
    margin-top: 24px;
  }

  .sidebar-block h2 {
    margin: 0 0 12px;
    font-size: 14px;
    letter-spacing: 0.08em;
    color: rgba(255, 255, 255, 0.78);
  }

  .sidebar-main {
    padding: 42px 34px;
  }

  .timeline-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(260px, 0.9fr);
    gap: 24px;
    padding-bottom: 26px;
    margin-bottom: 28px;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .timeline-hero-copy {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .eyebrow,
  .spotlight-kicker {
    margin: 0;
    font-size: 12px;
    letter-spacing: 0.18em;
    color: var(--resume-primary);
    font-weight: 700;
  }

  .timeline-contact-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .timeline-meta-panel {
    display: grid;
    gap: 14px;
    justify-items: stretch;
  }

  .timeline-contact-grid span {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 12px;
    border-radius: 16px;
    background: rgba(37, 99, 235, 0.06);
  }

  .timeline-contact-grid strong {
    font-size: 11px;
    letter-spacing: 0.08em;
    color: #475569;
  }

  .timeline-contact-grid em {
    font-style: normal;
    color: #0f172a;
  }

  .timeline-section {
    position: relative;
    padding-left: 34px;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .timeline-section + .timeline-section {
    margin-top: calc(var(--resume-section-spacing) + 6px);
  }

  .timeline-section::before {
    content: '';
    position: absolute;
    left: 10px;
    top: 12px;
    bottom: -18px;
    width: 2px;
    background: linear-gradient(180deg, rgba(37, 99, 235, 0.34), rgba(37, 99, 235, 0.08));
  }

  .timeline-section:last-child::before {
    bottom: 18px;
  }

  .timeline-marker {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }

  .timeline-dot {
    position: absolute;
    left: -34px;
    top: 4px;
    width: 22px;
    height: 22px;
    border-radius: 999px;
    border: 5px solid rgba(37, 99, 235, 0.12);
    background: var(--resume-primary);
    box-sizing: border-box;
  }

  .timeline-marker h2 {
    margin: 0;
    font-size: 19px;
    font-family: var(--resume-heading-font);
  }

  .timeline-list {
    display: grid;
    gap: 14px;
  }

  .timeline-card {
    padding: 18px 20px;
    border-radius: 20px;
    background: linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(241, 245, 249, 0.92));
    border: 1px solid rgba(148, 163, 184, 0.18);
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .timeline-card-top {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    align-items: flex-start;
  }

  .timeline-card-top h3,
  .spotlight-card-head h3 {
    margin: 0;
    font-size: 16px;
  }

  .timeline-card-top p,
  .spotlight-card-head p {
    margin: 4px 0 0;
    color: #475569;
    font-size: 13px;
  }

  .timeline-date,
  .spotlight-date {
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(37, 99, 235, 0.12);
    color: var(--resume-primary);
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }

  .timeline-skills,
  .spotlight-skill-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .timeline-skill,
  .spotlight-skill {
    display: inline-flex;
    align-items: center;
    padding: 9px 14px;
    border-radius: 12px;
    background: rgba(15, 23, 42, 0.05);
    color: #0f172a;
    font-weight: 600;
  }

  .timeline-summary {
    border-left: 4px solid rgba(37, 99, 235, 0.18);
    background: rgba(248, 250, 252, 0.92);
  }

  .spotlight-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) 280px;
    gap: 20px;
    padding: 40px 42px 30px;
    background: linear-gradient(135deg, rgba(124, 58, 237, 0.1), #ffffff 68%);
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .spotlight-copy {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .spotlight-summary {
    margin: 8px 0 0;
    max-width: 560px;
    color: #334155;
  }

  .spotlight-meta-card {
    display: grid;
    gap: 12px;
    padding: 18px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(148, 163, 184, 0.2);
  }

  .spotlight-meta-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .spotlight-meta-item span {
    font-size: 11px;
    letter-spacing: 0.08em;
    color: #64748b;
  }

  .spotlight-meta-item strong {
    color: #0f172a;
  }

  .spotlight-body {
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr);
  }

  .spotlight-side {
    padding: 30px 24px 36px;
    background: #f8fafc;
    border-right: 1px solid rgba(148, 163, 184, 0.14);
  }

  .spotlight-main {
    padding: 30px 30px 38px;
  }

  .spotlight-panel + .spotlight-panel,
  .spotlight-section + .spotlight-section {
    margin-top: 24px;
  }

  .compact-item {
    padding: 14px 16px;
  }

  .spotlight-card {
    padding: 20px 22px;
    border-radius: 22px;
    border: 1px solid rgba(148, 163, 184, 0.16);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95));
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .spotlight-card-head {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
  }

  .resume-section + .resume-section {
    margin-top: var(--resume-section-spacing);
  }

  .resume-section {
    break-inside: auto;
    page-break-inside: auto;
  }

  .section-heading {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
    break-after: avoid;
    page-break-after: avoid;
  }

  .section-heading-bar {
    width: 8px;
    height: 22px;
    border-radius: 999px;
    background: var(--resume-primary);
  }

  .section-heading h2 {
    margin: 0;
    font-size: 18px;
    font-family: var(--resume-heading-font);
  }

  .section-items {
    display: flex;
    flex-direction: column;
    gap: var(--resume-item-spacing);
  }

  .section-item {
    padding: 16px 18px;
    border-radius: 16px;
    background: #f8fafc;
    break-inside: auto;
    page-break-inside: auto;
  }

  .item-heading {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: baseline;
    break-after: avoid;
    page-break-after: avoid;
  }

  .item-heading h3 {
    margin: 0;
    font-size: 15px;
  }

  .item-heading span {
    color: #475569;
    font-size: 13px;
  }

  .item-subheading {
    margin-top: 6px;
    color: #64748b;
    font-size: 12px;
  }

  .item-description {
    margin: 10px 0 0;
    color: #334155;
    white-space: pre-wrap;
  }

  .skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    break-inside: avoid;
  }

  .skill-pill {
    display: inline-flex;
    align-items: center;
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(37, 99, 235, 0.1);
    color: var(--resume-primary);
    font-weight: 600;
  }

  .variant-sidebar .section-item,
  .variant-sidebar .summary-block {
    background: #ffffff;
    border: 1px solid #e2e8f0;
  }

  .variant-sidebar .skill-pill {
    background: rgba(255, 255, 255, 0.16);
    color: #ffffff;
  }

  .variant-ats {
    padding: 18px 22px;
    border-radius: 0;
  }

  .variant-ats .resume-header {
    display: block;
    border-bottom: 1px solid #111827;
    padding-bottom: 12px;
    margin-bottom: 16px;
  }

  .variant-ats .resume-name {
    font-size: 28px;
  }

  .variant-ats .resume-role {
    color: #111827;
  }

  .variant-ats .resume-meta {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 5px 12px;
    margin-top: 8px;
    color: #374151;
  }

  .variant-ats .section-heading {
    border-bottom: 1px solid #d1d5db;
    padding-bottom: 5px;
  }

  .variant-ats .section-heading-bar {
    display: none;
  }

  .variant-ats .section-item,
  .variant-ats .summary-block {
    padding: 0;
    background: transparent;
    border-radius: 0;
  }

  .variant-executive {
    padding: 28px 32px;
    background: linear-gradient(90deg, #111827 0 8px, transparent 8px), #fffaf0;
  }

  .variant-executive .resume-header {
    border-bottom: 2px solid rgba(146, 64, 14, 0.26);
  }

  .variant-executive .resume-name {
    font-size: 34px;
    letter-spacing: 0.02em;
  }

  .variant-executive .section-heading-bar {
    width: 24px;
    height: 3px;
    border-radius: 0;
  }

  .variant-executive .section-item,
  .variant-executive .summary-block {
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(146, 64, 14, 0.14);
  }

  .variant-compact {
    padding: 18px 22px;
    font-size: calc(var(--resume-font-size) - 1px);
  }

  .variant-compact .resume-header {
    padding-bottom: 12px;
    margin-bottom: 12px;
  }

  .variant-compact .resume-name {
    font-size: 26px;
  }

  .variant-compact .resume-section + .resume-section {
    margin-top: 12px;
  }

  .variant-compact .section-heading {
    margin-bottom: 7px;
  }

  .variant-compact .section-heading h2 {
    font-size: 15px;
  }

  .variant-compact .section-heading-bar {
    height: 16px;
  }

  .variant-compact .section-items {
    gap: 7px;
  }

  .variant-compact .section-item,
  .variant-compact .summary-block {
    padding: 9px 11px;
    border-radius: 8px;
  }

  .variant-editorial {
    padding: 0;
    overflow: hidden;
  }

  .variant-editorial .resume-header {
    margin: 0;
    padding: 28px 32px 24px;
    color: #fff;
    background: linear-gradient(135deg, var(--resume-primary), #0f172a);
    border-bottom: 0;
  }

  .variant-editorial .resume-role,
  .variant-editorial .resume-meta {
    color: rgba(255, 255, 255, 0.86);
  }

  .variant-editorial .resume-section {
    padding: 0 32px;
  }

  .variant-editorial .resume-section:first-of-type {
    padding-top: 24px;
  }

  .variant-editorial .resume-section:last-child {
    padding-bottom: 28px;
  }

  .variant-editorial .section-heading-bar {
    width: 28px;
    height: 4px;
    border-radius: 0;
  }

  .variant-editorial .section-item,
  .variant-editorial .summary-block {
    background: #fff;
    border: 1px solid rgba(225, 29, 72, 0.14);
  }

`;
export function buildCoreResumePrintHtml(resumeMarkup, title = 'Resume Export') {
    return `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <style>${coreResumePrintStyles}</style>
  </head>
  <body>
    ${resumeMarkup}
  </body>
</html>`;
}
function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
