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
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(220px, 0.8fr) auto;
    grid-template-areas: "identity meta avatar";
    align-items: start;
    gap: 24px;
    padding-bottom: 24px;
    margin-bottom: var(--resume-section-spacing);
    border-bottom: 2px solid rgba(37, 99, 235, 0.16);
    break-inside: avoid;
  }

  .resume-identity {
    grid-area: identity;
    min-width: 0;
  }

  .resume-header-side {
    grid-area: meta;
    display: flex;
    align-items: flex-start;
    gap: 18px;
  }

  .resume-avatar-wrap {
    grid-area: avatar;
    display: flex;
    justify-content: flex-end;
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

  .outcome-metrics {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 8px;
  }

  .outcome-metrics span {
    padding: 3px 6px;
    border-radius: 999px;
    color: var(--resume-primary);
    font-size: 8px;
    font-weight: 800;
    background: rgba(37, 99, 235, 0.08);
    border: 1px solid rgba(37, 99, 235, 0.14);
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

  .variant-classic {
    position: relative;
    padding-top: 74px;
    border-radius: 8px;
  }

  .variant-classic::before {
    content: "PERSONAL RESUME";
    position: absolute;
    top: 18px;
    left: 32px;
    right: 32px;
    height: 46px;
    display: flex;
    align-items: center;
    padding: 0 26px;
    background: var(--resume-primary);
    color: #fff;
    font-family: var(--resume-heading-font);
    font-size: 28px;
    font-weight: 600;
  }

  .variant-classic .resume-header {
    grid-template-columns: minmax(0, 1fr) minmax(360px, 1fr) 116px;
    border-bottom: 1px solid #cbd5e1;
  }

  .variant-classic .resume-name {
    display: inline-block;
    padding-bottom: 6px;
    border-bottom: 4px solid var(--resume-primary);
    color: var(--resume-primary);
  }

  .variant-classic .resume-meta {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 24px;
  }

  .variant-classic .resume-avatar {
    width: 102px;
    height: 126px;
    border-radius: 4px;
    box-shadow: none;
  }

  .variant-ats {
    padding: 18px 22px;
    border-radius: 0;
  }

  .variant-ats .resume-header {
    position: relative;
    grid-template-columns: minmax(0, 1fr) 118px;
    grid-template-areas:
      "identity avatar"
      "meta avatar";
    border-bottom: 1px solid #111827;
    padding-bottom: 12px;
    margin-bottom: 16px;
    text-align: center;
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
    justify-content: center;
    gap: 5px 12px;
    margin-top: 8px;
    color: #374151;
  }

  .variant-ats .resume-avatar {
    width: 96px;
    height: 116px;
    border-radius: 0;
    box-shadow: none;
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
    grid-template-columns: minmax(0, 1fr) minmax(260px, 0.85fr) 118px;
    border-bottom: 2px solid rgba(146, 64, 14, 0.26);
  }

  .variant-executive .resume-meta {
    gap: 6px;
  }

  .variant-executive .resume-avatar {
    width: 100px;
    height: 124px;
    border-radius: 6px;
    box-shadow: none;
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
    grid-template-columns: 132px minmax(0, 1fr) minmax(260px, 0.9fr);
    grid-template-areas: "avatar identity meta";
    align-items: center;
    padding-bottom: 12px;
    margin-bottom: 12px;
    border-bottom: 1px solid #94a3b8;
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
    position: relative;
    padding: 5px 18px 5px 24px;
    background: color-mix(in srgb, var(--resume-primary) 84%, #0f172a);
    color: #fff;
    font-size: 15px;
  }

  .variant-compact .section-heading h2::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    border-top: 14px solid transparent;
    border-bottom: 14px solid transparent;
    border-left: 10px solid #fff;
  }

  .variant-compact .section-heading-bar {
    display: none;
  }

  .variant-compact .resume-avatar {
    width: 112px;
    height: 138px;
    border-radius: 0;
    box-shadow: none;
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
    grid-template-columns: minmax(0, 1fr) minmax(220px, 0.74fr) 122px;
    margin: 0;
    padding: 28px 32px 24px;
    color: #fff;
    background: linear-gradient(135deg, var(--resume-primary), #0f172a);
    border-bottom: 0;
  }

  .variant-editorial .resume-avatar {
    width: 104px;
    height: 130px;
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: none;
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

  .variant-classic,
  .variant-sidebar,
  .variant-ats,
  .variant-executive,
  .variant-compact {
    --resume-ink: #172033;
    --resume-muted: #536071;
    color: var(--resume-ink);
    box-shadow: none;
  }

  .variant-classic {
    padding: 76px 32px 34px;
    border-radius: 0;
  }

  .variant-classic::before {
    top: 10px;
    left: 10px;
    right: 10px;
    height: 38px;
    padding: 0 26px;
    font-size: 25px;
    letter-spacing: 0.04em;
  }

  .variant-classic .resume-header {
    grid-template-columns: minmax(190px, 0.9fr) minmax(300px, 1fr) 128px;
    gap: 18px;
    padding: 0 10px 20px;
    margin-bottom: 20px;
    border-bottom: 1px solid #b8c0ca;
  }

  .variant-classic .resume-name {
    margin-bottom: 6px;
    padding-bottom: 8px;
    border-bottom-width: 4px;
    font-size: 28px;
  }

  .variant-classic .resume-role {
    color: var(--resume-primary);
    font-size: 15px;
  }

  .variant-classic .resume-meta {
    align-content: start;
    min-width: 0;
    font-size: 14px;
    color: #111827;
  }

  .variant-classic .resume-avatar-wrap {
    align-self: center;
  }

  .variant-classic .resume-avatar {
    width: 104px;
    height: 132px;
    border: 0;
    background: transparent;
    object-fit: contain;
  }

  .variant-classic .resume-section + .resume-section {
    margin-top: 24px;
  }

  .variant-classic .section-heading {
    gap: 0;
    align-items: flex-end;
    margin-bottom: 14px;
    border-bottom: 1px solid #8d96a3;
  }

  .variant-classic .section-heading h2 {
    padding: 0 12px 7px 0;
    border-bottom: 4px solid var(--resume-primary);
    color: var(--resume-primary);
    font-size: 19px;
  }

  .variant-classic .section-heading-bar {
    display: none;
  }

  .variant-classic .section-item,
  .variant-classic .summary-block {
    padding: 0;
    border-radius: 0;
    background: transparent;
  }

  .variant-classic .item-heading h3,
  .variant-classic .item-heading span {
    font-size: 15px;
    font-weight: 800;
    color: #111827;
  }

  .variant-classic .item-description {
    margin-top: 8px;
    color: #2f3a4a;
  }

  .resume-sheet.variant-sidebar {
    position: relative;
    width: min(100%, 820px);
    padding: 0;
    border-radius: 0;
    background: #fff;
  }

  .resume-sheet.variant-sidebar::before {
    content: "";
    position: absolute;
    top: 10px;
    left: 0;
    right: 0;
    height: 22px;
    background:
      linear-gradient(90deg, #5a9cc9 0 61%, transparent 61% 90%, #5a9cc9 90%);
    z-index: 1;
  }

  .variant-sidebar .sidebar-layout {
    grid-template-columns: 250px minmax(0, 1fr);
    min-height: 1120px;
  }

  .variant-sidebar .sidebar-column {
    padding: 70px 26px 36px;
    background: #f0f0f0;
    color: var(--resume-ink);
  }

  .variant-sidebar .sidebar-identity {
    display: grid;
    justify-items: center;
    margin-bottom: 26px;
    text-align: center;
  }

  .variant-sidebar .sidebar-avatar {
    width: 122px;
    height: 154px;
    margin-bottom: 28px;
    border: 1px solid var(--resume-primary);
    border-radius: 0;
    box-shadow: none;
    object-fit: contain;
  }

  .variant-sidebar .sidebar-identity .resume-name {
    color: var(--resume-primary);
    font-size: 31px;
    font-weight: 500;
    letter-spacing: 0.08em;
  }

  .variant-sidebar .sidebar-column .resume-role {
    color: #111827;
    font-size: 14px;
  }

  .variant-sidebar .sidebar-block {
    padding-top: 20px;
    border-top: 1px solid #d8d8d8;
  }

  .variant-sidebar .sidebar-block h2 {
    width: 170px;
    margin: 0 auto 16px;
    padding: 8px 12px;
    border: 2px solid var(--resume-primary);
    color: #111827;
    text-align: center;
    font-size: 15px;
    letter-spacing: 0.12em;
  }

  .variant-sidebar .sidebar-meta-list,
  .variant-sidebar .skills-list {
    color: #111827;
    font-size: 14px;
  }

  .variant-sidebar .skill-pill {
    background: #ffffff;
    border: 1px solid #d8d8d8;
    color: #111827;
  }

  .variant-sidebar .sidebar-main {
    padding: 66px 34px 36px;
  }

  .variant-sidebar .section-heading {
    position: relative;
    margin-bottom: 14px;
    padding-left: 40px;
  }

  .variant-sidebar .section-heading::before {
    content: "";
    position: absolute;
    left: 14px;
    top: 28px;
    bottom: -240px;
    width: 3px;
    background: color-mix(in srgb, var(--resume-primary) 82%, #fff);
  }

  .variant-sidebar .resume-section:last-child .section-heading::before {
    display: none;
  }

  .variant-sidebar .section-heading-bar {
    position: absolute;
    left: 0;
    width: 30px;
    height: 30px;
    border-radius: 999px;
    background: var(--resume-primary);
  }

  .variant-sidebar .section-heading h2 {
    color: var(--resume-primary);
    font-size: 21px;
    font-weight: 500;
  }

  .variant-sidebar .section-item,
  .variant-sidebar .summary-block {
    padding: 0 0 0 40px;
    border: 0;
    border-radius: 0;
    background: transparent;
  }

  .variant-ats {
    padding: 34px 36px;
    border-radius: 0;
    box-shadow: none;
  }

  .variant-ats .resume-header {
    grid-template-columns: 132px minmax(0, 1fr) 132px;
    grid-template-areas: ". identity avatar" ". meta avatar";
    min-height: 132px;
    padding-bottom: 24px;
    margin-bottom: 20px;
    border-bottom: 0;
    text-align: center;
  }

  .variant-ats .resume-avatar-wrap {
    align-self: start;
    justify-content: center;
  }

  .variant-ats .resume-avatar {
    width: 96px;
    height: 120px;
    border: 0;
    object-fit: contain;
  }

  .variant-ats .resume-name {
    font-size: 30px;
    font-weight: 800;
  }

  .variant-ats .resume-role {
    color: #111827;
    font-weight: 600;
  }

  .variant-ats .resume-meta {
    max-width: 540px;
    min-width: 0;
    margin: 8px auto 0;
    justify-content: center;
    gap: 6px 14px;
    color: #111827;
  }

  .variant-ats .resume-meta span {
    display: inline-flex;
    gap: 4px;
  }

  .variant-ats .section-heading {
    margin-bottom: 16px;
    padding-bottom: 5px;
    border-bottom: 1px solid var(--resume-primary);
  }

  .variant-ats .section-heading h2 {
    color: #173e63;
    font-size: 20px;
  }

  .variant-ats .section-item,
  .variant-ats .summary-block {
    padding: 0;
    border-radius: 0;
    background: transparent;
  }

  .resume-sheet.layout-qm-blue-top-photo {
    padding: 12px 32px 32px;
    border-radius: 0;
    background: #fff;
    color: #111827;
    box-shadow: none;
  }

  .layout-qm-blue-top-photo .qm-blue-titlebar {
    height: 38px;
    display: flex;
    align-items: center;
    padding: 0 26px;
    margin-bottom: 28px;
    background: var(--resume-primary);
    color: #fff;
    font-family: var(--resume-heading-font);
    font-size: 25px;
    letter-spacing: 0.04em;
  }

  .layout-qm-blue-top-photo .qm-blue-identity {
    position: relative;
    min-height: 142px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 142px;
    gap: 24px;
    padding: 0 10px 18px;
    border-bottom: 1px solid #b8c0ca;
    break-inside: avoid;
  }

  .layout-qm-blue-top-photo .qm-blue-name-group {
    display: flex;
    align-items: baseline;
    gap: 36px;
    min-width: 0;
  }

  .layout-qm-blue-top-photo .resume-name {
    margin: 0;
    padding-bottom: 8px;
    border-bottom: 4px solid var(--resume-primary);
    color: var(--resume-primary);
    font-size: 30px;
    font-weight: 800;
    line-height: 1.18;
    white-space: nowrap;
  }

  .layout-qm-blue-top-photo .resume-role {
    margin: 0;
    color: var(--resume-primary);
    font-size: 15px;
    font-weight: 800;
  }

  .layout-qm-blue-top-photo .qm-blue-meta {
    grid-column: 1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 9px 52px;
    max-width: 560px;
    padding-top: 22px;
    color: #111827;
    font-size: 14px;
  }

  .layout-qm-blue-top-photo .qm-blue-avatar-wrap {
    grid-column: 2;
    grid-row: 1 / span 2;
    align-self: start;
    justify-content: center;
  }

  .layout-qm-blue-top-photo .qm-blue-avatar {
    width: 104px;
    height: 132px;
    border: 0;
    border-radius: 0;
    object-fit: contain;
    box-shadow: none;
  }

  .layout-qm-blue-top-photo .resume-section + .resume-section {
    margin-top: 18px;
  }

  .layout-qm-blue-top-photo .section-heading {
    gap: 0;
    align-items: flex-end;
    margin-bottom: 12px;
    border-bottom: 1px solid #8d96a3;
  }

  .layout-qm-blue-top-photo .section-heading h2 {
    padding: 0 12px 7px 0;
    border-bottom: 4px solid var(--resume-primary);
    color: var(--resume-primary);
    font-size: 20px;
  }

  .layout-qm-blue-top-photo .section-heading-bar {
    display: none;
  }

  .layout-qm-blue-top-photo .section-item,
  .layout-qm-blue-top-photo .summary-block {
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
  }

  .layout-qm-blue-top-photo .qm-blue-item-heading {
    display: grid;
    grid-template-columns: 150px minmax(0, 1fr) minmax(120px, auto);
    gap: 22px;
    align-items: baseline;
  }

  .layout-qm-blue-top-photo .qm-blue-date,
  .layout-qm-blue-top-photo .item-heading h3,
  .layout-qm-blue-top-photo .item-heading span {
    font-size: 15px;
    font-weight: 800;
    color: #111827;
  }

  .layout-qm-blue-top-photo .item-description {
    margin-top: 8px;
    color: #2f3a4a;
  }

  .resume-sheet.layout-qm-ribbon-compact {
    padding: 34px 34px 32px;
    border-radius: 0;
    background: #fff;
    color: #111827;
    box-shadow: none;
  }

  .layout-qm-ribbon-compact .resume-header {
    grid-template-columns: 142px minmax(0, 1fr);
    grid-template-areas:
      "avatar identity"
      "avatar meta";
    align-items: center;
    gap: 16px 34px;
    min-height: 154px;
    padding: 0 0 26px;
    margin-bottom: 22px;
    border-bottom: 1px solid #9aa3af;
  }

  .layout-qm-ribbon-compact .resume-avatar-wrap {
    justify-content: center;
  }

  .layout-qm-ribbon-compact .resume-avatar {
    width: 112px;
    height: 138px;
    border: 0;
    border-radius: 0;
    object-fit: contain;
    box-shadow: none;
  }

  .layout-qm-ribbon-compact .resume-name {
    color: #173e63;
    font-size: 32px;
    letter-spacing: 0.08em;
  }

  .layout-qm-ribbon-compact .resume-role {
    color: #111827;
    font-weight: 800;
  }

  .layout-qm-ribbon-compact .resume-meta {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 7px 44px;
    min-width: 0;
    color: #111827;
  }

  .layout-qm-ribbon-compact .resume-section + .resume-section {
    margin-top: 22px;
  }

  .layout-qm-ribbon-compact .section-heading {
    position: relative;
    gap: 0;
    align-items: center;
    margin-bottom: 14px;
    border-bottom: 1px solid #9aa3af;
  }

  .layout-qm-ribbon-compact .section-heading h2 {
    min-width: 104px;
    margin-bottom: -1px;
    padding: 7px 18px 7px 26px;
    background: #173e63;
    color: #fff;
    font-size: 17px;
    line-height: 1.15;
  }

  .layout-qm-ribbon-compact .section-heading h2::before {
    top: 0;
    border-top-width: 16px;
    border-bottom-width: 16px;
  }

  .layout-qm-ribbon-compact .section-heading-bar {
    display: none;
  }

  .layout-qm-ribbon-compact .section-item,
  .layout-qm-ribbon-compact .summary-block {
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
  }

  .resume-sheet.layout-qm-classic-centered {
    position: relative;
    padding: 42px 44px 38px;
    border-radius: 0;
    background: #ffffff;
    color: #111827;
    box-shadow: none;
  }

  .resume-sheet.layout-qm-classic-centered::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: #243b53;
  }

  .layout-qm-classic-centered .classic-centered-header {
    position: relative;
    min-height: 152px;
    padding: 8px 128px 26px;
    margin-bottom: 28px;
    border-bottom: 1px solid #243b53;
    text-align: center;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .layout-qm-classic-centered .resume-name {
    margin-bottom: 10px;
    color: #111827;
    font-size: 32px;
    letter-spacing: 0.08em;
  }

  .layout-qm-classic-centered .resume-role {
    color: #243b53;
    font-size: 15px;
  }

  .layout-qm-classic-centered .classic-centered-meta {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 7px 14px;
    margin-top: 12px;
    color: #111827;
    font-size: 14px;
  }

  .layout-qm-classic-centered .classic-centered-meta span {
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    min-width: 0;
  }

  .layout-qm-classic-centered .classic-centered-meta strong {
    color: #243b53;
    white-space: nowrap;
  }

  .layout-qm-classic-centered .classic-centered-meta em {
    min-width: 0;
    color: #111827;
    font-style: normal;
    overflow-wrap: anywhere;
  }

  .layout-qm-classic-centered .classic-centered-avatar-wrap {
    position: absolute;
    top: 8px;
    right: 0;
  }

  .layout-qm-classic-centered .classic-centered-avatar {
    width: 92px;
    height: 116px;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    object-fit: contain;
  }

  .layout-qm-classic-centered .classic-centered-section + .classic-centered-section {
    margin-top: 24px;
  }

  .layout-qm-classic-centered .section-heading {
    gap: 0;
    align-items: flex-end;
    margin-bottom: 14px;
    border-bottom: 1px solid #243b53;
  }

  .layout-qm-classic-centered .section-heading-bar {
    display: none;
  }

  .layout-qm-classic-centered .section-heading h2 {
    padding: 0 16px 7px 0;
    color: #243b53;
    font-size: 19px;
    border-bottom: 3px solid #243b53;
  }

  .layout-qm-classic-centered .section-item,
  .layout-qm-classic-centered .summary-block {
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
  }

  .layout-qm-classic-centered .classic-centered-item-heading {
    display: grid;
    grid-template-columns: minmax(150px, 0.32fr) minmax(0, 1fr) minmax(120px, 0.28fr);
    gap: 18px;
    align-items: baseline;
  }

  .layout-qm-classic-centered .classic-centered-item-heading h3,
  .layout-qm-classic-centered .classic-centered-item-heading span {
    color: #111827;
    font-size: 15px;
    font-weight: 800;
  }

  .layout-qm-classic-centered .skills-list {
    gap: 10px 42px;
  }

  .layout-qm-classic-centered .skill-pill {
    min-width: 160px;
    padding: 0 0 5px;
    border-radius: 0;
    border-bottom: 5px solid rgba(36, 59, 83, 0.24);
    background: transparent;
    color: #111827;
  }

  .resume-sheet.layout-qm-timeline-icons {
    padding: 0;
    border-radius: 0;
    overflow: hidden;
    background: #ffffff;
    box-shadow: none;
  }

  .layout-qm-timeline-icons .timeline-hero {
    grid-template-columns: 280px minmax(0, 1fr);
    gap: 34px;
    padding: 34px 40px 30px;
    margin: 0 0 34px;
    background: linear-gradient(90deg, #eef2f7 0 280px, #ffffff 280px);
    border-top: 12px solid #5a9dcc;
    border-bottom: 1px solid #d9e2ec;
  }

  .layout-qm-timeline-icons .timeline-hero-copy {
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .layout-qm-timeline-icons .eyebrow {
    color: #5a9dcc;
  }

  .layout-qm-timeline-icons .resume-name {
    color: #5a9dcc;
    font-size: 34px;
    font-weight: 500;
  }

  .layout-qm-timeline-icons .resume-role {
    color: #1f2937;
  }

  .layout-qm-timeline-icons .timeline-meta-panel {
    grid-template-columns: 112px minmax(0, 1fr);
    align-items: center;
  }

  .layout-qm-timeline-icons .timeline-avatar {
    width: 112px;
    height: 132px;
    border-radius: 0;
    border: 1px solid #5a9dcc;
    box-shadow: none;
  }

  .layout-qm-timeline-icons .timeline-contact-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 18px;
  }

  .layout-qm-timeline-icons .timeline-contact-grid span {
    padding: 0;
    border-radius: 0;
    background: transparent;
    min-width: 0;
  }

  .layout-qm-timeline-icons .timeline-contact-grid strong {
    color: #5a9dcc;
  }

  .layout-qm-timeline-icons .timeline-contact-grid em {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .layout-qm-timeline-icons .timeline-section {
    margin: 0 40px;
    padding-left: 64px;
  }

  .layout-qm-timeline-icons .timeline-section + .timeline-section {
    margin-top: 26px;
  }

  .layout-qm-timeline-icons .timeline-section::before {
    left: 20px;
    top: 0;
    bottom: -26px;
    width: 3px;
    background: #5a9dcc;
  }

  .layout-qm-timeline-icons .timeline-marker {
    min-height: 38px;
    margin-bottom: 12px;
    border-bottom: 1px solid #c9d7e3;
  }

  .layout-qm-timeline-icons .timeline-dot {
    left: -55px;
    top: -2px;
    width: 38px;
    height: 38px;
    border: 0;
    background: #5a9dcc;
    box-shadow: inset 0 0 0 10px #ffffff;
  }

  .layout-qm-timeline-icons .timeline-marker h2 {
    color: #5a9dcc;
    font-size: 22px;
  }

  .layout-qm-timeline-icons .timeline-card {
    padding: 0 0 2px;
    border: 0;
    border-radius: 0;
    background: transparent;
  }

  .layout-qm-timeline-icons .timeline-date {
    padding: 0;
    border-radius: 0;
    background: transparent;
    color: #5a9dcc;
  }

  .layout-qm-timeline-icons .timeline-skill {
    border-radius: 0;
    background: transparent;
    border-bottom: 4px solid rgba(90, 157, 204, 0.35);
  }

  .resume-sheet.layout-qm-minimal-ats {
    padding: 34px 40px 38px;
    border-radius: 0;
    background: #ffffff;
    box-shadow: none;
    color: #18212f;
    --ats-rule: #243b53;
    --ats-muted: #526071;
  }

  .ats-resume-header {
    display: grid;
    grid-template-columns: minmax(210px, .72fr) minmax(0, 1.28fr);
    gap: 28px;
    align-items: end;
    padding-bottom: 16px;
    margin-bottom: 22px;
    border-bottom: 2px solid var(--ats-rule);
    break-inside: avoid;
  }

  .ats-resume-header.has-avatar {
    grid-template-columns: minmax(190px, .68fr) minmax(0, 1.32fr) auto;
    align-items: center;
  }

  .ats-avatar-wrap {
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
  }

  .ats-avatar {
    width: 72px;
    height: 88px;
    border: 1px solid #cbd5e1;
    border-radius: 2px;
    object-fit: cover;
    box-shadow: none;
  }

  .ats-identity h1 {
    margin: 0;
    color: #111827;
    font-family: var(--resume-heading-font);
    font-size: 32px;
    line-height: 1.08;
    letter-spacing: .04em;
  }

  .ats-identity p {
    margin: 7px 0 0;
    color: var(--ats-rule);
    font-size: 14px;
    font-weight: 800;
  }

  .ats-contact-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px 18px;
    align-content: end;
    font-size: 11px;
  }

  .ats-contact-list span {
    display: flex;
    min-width: 0;
    gap: 7px;
  }

  .ats-contact-list strong {
    flex: 0 0 auto;
    color: var(--ats-muted);
    font-size: 10px;
    letter-spacing: .04em;
  }

  .ats-contact-list em {
    min-width: 0;
    overflow-wrap: anywhere;
    color: #18212f;
    font-style: normal;
  }

  .ats-section + .ats-section {
    margin-top: 18px;
  }

  .ats-section-title {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 9px;
  }

  .ats-section-title::after {
    content: '';
    height: 1px;
    flex: 1;
    background: #aeb8c5;
  }

  .ats-section-title h2 {
    margin: 0;
    color: var(--ats-rule);
    font-family: var(--resume-heading-font);
    font-size: 14px;
    line-height: 1.2;
    letter-spacing: .08em;
    white-space: nowrap;
  }

  .ats-summary p,
  .ats-description {
    margin: 0;
    color: #344154;
    white-space: pre-line;
  }

  .ats-items {
    display: grid;
    gap: 12px;
  }

  .ats-item,
  .ats-section-title {
    break-inside: avoid;
  }

  .ats-item-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 20px;
    align-items: baseline;
  }

  .ats-item-header h3 {
    margin: 0;
    color: #111827;
    font-size: 13px;
    line-height: 1.35;
  }

  .ats-item-header p {
    margin: 2px 0 0;
    color: var(--ats-muted);
    font-size: 11px;
    font-weight: 700;
  }

  .ats-item-header time {
    color: var(--ats-muted);
    font-size: 10px;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .ats-description {
    margin-top: 5px;
    font-size: 11px;
    line-height: 1.65;
  }

  .ats-skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 0;
    color: #18212f;
    font-size: 11px;
    font-weight: 700;
  }

  .ats-skills-list span + span::before {
    content: '·';
    margin: 0 9px;
    color: #7b8797;
  }

  .resume-sheet.layout-qm-executive-business {
    padding: 0;
    border-radius: 0;
    overflow: hidden;
    background: #fff;
    color: #101828;
    box-shadow: none;
  }

  .layout-qm-executive-business .resume-header {
    grid-template-columns: minmax(0, 1fr) minmax(260px, 0.82fr) 132px;
    gap: 24px;
    min-height: 178px;
    padding: 42px 46px 34px;
    margin: 0 0 30px;
    color: #fff;
    background: linear-gradient(120deg, #26384f, #111827);
    border-bottom: 0;
  }

  .layout-qm-executive-business .resume-name {
    color: #fff;
    font-size: 35px;
    letter-spacing: 0.02em;
  }

  .layout-qm-executive-business .resume-role {
    width: fit-content;
    margin-top: 14px;
    padding-bottom: 7px;
    color: #f7e4b1;
    border-bottom: 3px solid #c8a96a;
  }

  .layout-qm-executive-business .resume-role,
  .layout-qm-executive-business .resume-role * {
    color: #f7e4b1 !important;
  }

  .layout-qm-executive-business .resume-meta {
    min-width: 0;
    color: rgba(255, 255, 255, 0.88);
    font-size: 14px;
  }

  .layout-qm-executive-business .resume-meta span,
  .layout-qm-executive-business .resume-meta strong {
    color: rgba(255, 255, 255, 0.92);
  }

  .layout-qm-executive-business .resume-meta strong {
    color: #f7e4b1;
  }

  .layout-qm-executive-business .resume-avatar {
    width: 104px;
    height: 132px;
    border: 2px solid rgba(255, 255, 255, 0.72);
    border-radius: 6px;
    object-fit: contain;
    box-shadow: none;
  }

  .layout-qm-executive-business .resume-section {
    padding: 0 46px;
  }

  .layout-qm-executive-business .resume-section:last-child {
    padding-bottom: 40px;
  }

  .layout-qm-executive-business .resume-section + .resume-section {
    margin-top: 24px;
  }

  .layout-qm-executive-business .section-heading {
    gap: 14px;
    margin-bottom: 14px;
    border-bottom: 1px solid #27384f;
  }

  .layout-qm-executive-business .section-heading-bar {
    width: 38px;
    height: 4px;
    border-radius: 0;
    background: #c8a96a;
  }

  .layout-qm-executive-business .section-heading h2 {
    padding-bottom: 8px;
    color: #27384f;
    font-size: 20px;
  }

  .layout-qm-executive-business .section-item,
  .layout-qm-executive-business .summary-block {
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
  }

  .resume-sheet.layout-qm-student-editorial {
    padding: 34px 38px 38px;
    border-radius: 0;
    overflow: hidden;
    background: linear-gradient(90deg, var(--resume-primary) 0 6px, transparent 6px), #fff;
    color: #172033;
    box-shadow: none;
  }

  .student-resume-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 24px;
    align-items: start;
    padding-bottom: 20px;
    border-bottom: 2px solid #172033;
  }

  .student-eyebrow {
    margin: 0 0 7px;
    color: var(--resume-primary);
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.18em;
  }

  .student-identity h1 {
    margin: 0;
    color: #111827;
    font-family: var(--resume-heading-font);
    font-size: 30px;
    line-height: 1.08;
    letter-spacing: 0.05em;
  }

  .student-target {
    margin: 7px 0 11px;
    color: #334155;
    font-size: 12px;
    font-weight: 700;
  }

  .student-contact-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px 16px;
    color: #475569;
    font-size: 9px;
  }

  .student-contact-list strong {
    margin-right: 5px;
    color: #172033;
  }

  .student-avatar {
    width: 70px;
    height: 90px;
    border: 1px solid #cbd5e1;
    border-radius: 2px;
    object-fit: cover;
    box-shadow: 6px 6px 0 rgba(47, 128, 167, 0.14);
  }

  .student-education-spotlight {
    display: grid;
    grid-template-columns: 92px minmax(0, 1fr);
    gap: 18px;
    margin: 17px 0 21px;
    padding: 12px 15px;
    background: #eff7fa;
    border-left: 3px solid var(--resume-primary);
  }

  .student-section-kicker {
    padding-top: 3px;
    color: var(--resume-primary);
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 0.13em;
  }

  .student-education-item {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 3px 14px;
  }

  .student-education-item + .student-education-item {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #cbd5e1;
  }

  .student-education-item h2,
  .student-item h3 {
    margin: 0;
    color: #172033;
    font-size: 11px;
    line-height: 1.35;
  }

  .student-education-item p,
  .student-item-header p {
    margin: 2px 0 0;
    color: #526174;
    font-size: 9px;
  }

  .student-education-item time,
  .student-item time {
    color: #64748b;
    font-size: 8px;
    white-space: nowrap;
  }

  .student-education-item > .student-description {
    grid-column: 1 / -1;
  }

  .student-section + .student-section {
    margin-top: 14px;
  }

  .student-section-heading {
    display: grid;
    grid-template-columns: 27px minmax(0, 1fr);
    gap: 9px;
    align-items: end;
    margin-bottom: 9px;
  }

  .student-section-heading > span {
    padding-bottom: 3px;
    color: var(--resume-primary);
    font-size: 9px;
    font-weight: 800;
    border-bottom: 2px solid var(--resume-primary);
  }

  .student-section-heading p {
    margin: 0 0 1px;
    color: #94a3b8;
    font-size: 7px;
    font-weight: 800;
    letter-spacing: 0.14em;
  }

  .student-section-heading h2 {
    margin: 0;
    color: #172033;
    font-family: var(--resume-heading-font);
    font-size: 14px;
    line-height: 1.2;
  }

  .student-items {
    display: grid;
    gap: 8px;
    padding-left: 36px;
  }

  .student-item {
    padding: 0 0 9px;
    border-bottom: 1px solid #e2e8f0;
  }

  .student-item:last-child {
    padding-bottom: 0;
    border-bottom: 0;
  }

  .student-item-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
    align-items: start;
  }

  .student-description {
    margin: 5px 0 0;
    color: #3f4d60;
    font-size: 9px;
    line-height: 1.55;
    white-space: pre-line;
  }

  .student-skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    padding-left: 36px;
  }

  .student-skills-list span {
    padding: 3px 7px;
    color: #223247;
    font-size: 8px;
    font-weight: 700;
    background: #f1f5f9;
    border: 1px solid #dbe4ed;
  }

  .student-summary {
    margin-left: 36px;
    padding: 8px 11px;
    background: #f8fafc;
    border-left: 2px solid #cbd5e1;
  }

  .student-summary p {
    margin: 0;
    color: #3f4d60;
    font-size: 9px;
    line-height: 1.55;
  }

  .variant-executive {
    padding: 38px 44px;
    border-radius: 0;
    background: #fff;
  }

  .variant-executive .resume-header {
    grid-template-columns: minmax(210px, 1fr) minmax(210px, 0.9fr) 132px;
    gap: 22px;
    min-height: 154px;
    padding-bottom: 30px;
    margin-bottom: 24px;
    border-bottom: 0;
  }

  .variant-executive .resume-name {
    font-size: 32px;
    letter-spacing: 0;
  }

  .variant-executive .resume-role {
    margin-top: 12px;
    color: #111827;
  }

  .variant-executive .resume-meta {
    min-width: 0;
    color: #111827;
    font-size: 14px;
  }

  .variant-executive .resume-avatar {
    width: 104px;
    height: 132px;
    border: 0;
    object-fit: contain;
  }

  .variant-executive .section-heading {
    position: relative;
    gap: 14px;
    margin-bottom: 14px;
    border-bottom: 1px solid #27384f;
  }

  .variant-executive .section-heading-bar {
    width: 36px;
    height: 36px;
    margin-bottom: -1px;
    border-radius: 999px;
    background: #27384f;
  }

  .variant-executive .section-heading h2 {
    padding-bottom: 8px;
    color: #27384f;
    font-size: 20px;
  }

  .variant-executive .section-item,
  .variant-executive .summary-block {
    padding: 0 0 0 18px;
    border: 0;
    border-radius: 0;
    background: transparent;
  }

  .variant-compact {
    padding: 36px 34px 32px;
    border-radius: 0;
  }

  .variant-compact .resume-header {
    grid-template-columns: 150px minmax(0, 1fr);
    grid-template-areas:
      "avatar identity"
      "avatar meta";
    align-items: center;
    gap: 16px 34px;
    min-height: 150px;
    padding-bottom: 24px;
    border-bottom: 1px solid #a4aab3;
  }

  .variant-compact .resume-avatar-wrap {
    justify-content: center;
  }

  .variant-compact .resume-avatar {
    width: 122px;
    height: 150px;
    border: 0;
    object-fit: contain;
  }

  .variant-compact .resume-name {
    color: #173e63;
    font-size: 31px;
    letter-spacing: 0.08em;
  }

  .variant-compact .resume-meta {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    min-width: 0;
    gap: 7px 44px;
    color: #111827;
  }

  .variant-compact .section-heading {
    position: relative;
    align-items: center;
    gap: 0;
    margin-bottom: 16px;
    border-bottom: 1px solid #a4aab3;
  }

  .variant-compact .section-heading h2 {
    min-width: 98px;
    margin-bottom: -1px;
    padding: 6px 18px 6px 22px;
    background: #173e63;
    color: #fff;
    font-size: 17px;
    line-height: 1.15;
  }

  .variant-compact .section-heading h2::before {
    top: 0;
    border-top-width: 15px;
    border-bottom-width: 15px;
  }

  .variant-compact .section-item,
  .variant-compact .summary-block {
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
  }

  .resume-sheet.has-custom-page-margin:not(.variant-sidebar) {
    padding: var(--resume-page-margin);
  }

  .resume-sheet.has-custom-page-margin.variant-sidebar .sidebar-column {
    padding-left: min(var(--resume-page-margin), 32px);
    padding-right: min(var(--resume-page-margin), 32px);
  }

  .resume-sheet.has-custom-page-margin.variant-sidebar .sidebar-main {
    padding-left: var(--resume-page-margin);
    padding-right: var(--resume-page-margin);
  }

  .custom-document-heading {
    margin: 0 0 24px;
    padding-bottom: 14px;
    border-bottom: 1px solid #c9d4df;
    text-align: center;
    break-inside: avoid;
  }

  .custom-document-heading h1 {
    margin: 0;
    color: var(--resume-primary);
    font-family: var(--resume-heading-font);
    font-size: 27px;
    letter-spacing: .12em;
  }

  .custom-document-heading p,
  .formal-table-title span {
    display: block;
    margin: 7px 0 0;
    color: #64748b;
    font-size: 11px;
    letter-spacing: .08em;
  }

  .resume-sheet.layout-qm-table-formal {
    padding: 38px 42px 46px;
    color: #1f2937;
    --formal-border: #8da0b4;
    --formal-fill: #edf3f8;
  }

  .resume-sheet.layout-qm-table-formal.has-custom-page-margin {
    padding: var(--resume-page-margin);
  }

  .formal-table-title {
    padding: 4px 0 19px;
    text-align: center;
  }

  .formal-table-title p {
    margin: 0 0 3px;
    color: #6b7c8f;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .28em;
  }

  .formal-table-title h1 {
    margin: 0;
    color: var(--resume-primary);
    font-family: var(--resume-heading-font);
    font-size: 29px;
    letter-spacing: .3em;
    text-indent: .3em;
  }

  .formal-profile-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .formal-profile-table th,
  .formal-profile-table td {
    height: 39px;
    padding: 7px 9px;
    border: 1px solid var(--formal-border);
    color: #334155;
    font-size: 11px;
    overflow-wrap: anywhere;
    vertical-align: middle;
  }

  .formal-profile-table th,
  .formal-table-section > header {
    background: var(--formal-fill);
    font-weight: 700;
  }

  .formal-label-column { width: 74px; }
  .formal-photo-column { width: 104px; }
  .formal-profile-photo { height: 117px; padding: 8px !important; text-align: center; }
  .formal-profile-photo .resume-avatar { width: 78px; height: 98px; border: 0; border-radius: 0; object-fit: cover; box-shadow: none; }
  .formal-intention-row td { font-weight: 700; letter-spacing: .04em; }

  .formal-table-section {
    border: 1px solid var(--formal-border);
    border-top: 0;
    break-inside: avoid;
  }

  .formal-table-section > header {
    padding: 7px 13px;
    border-bottom: 1px solid var(--formal-border);
    color: #20364d;
    font-family: var(--resume-heading-font);
    font-size: 13px;
    letter-spacing: .12em;
  }

  .formal-item-meta {
    display: grid;
    grid-template-columns: 122px minmax(0, 1fr) minmax(120px, .7fr);
    border-bottom: 1px dotted #c4ced8;
  }

  .formal-item-meta > * { padding: 8px 11px; border-right: 1px solid #c4ced8; font-size: 11px; }
  .formal-item-meta > *:last-child { border-right: 0; }
  .formal-table-items article + article { border-top: 1px solid #bdc8d3; }
  .formal-table-items article > p,
  .formal-table-summary p { margin: 0; padding: 9px 12px 11px; font-size: 11px; line-height: 1.72; white-space: pre-line; }
  .formal-table-skills { display: flex; flex-wrap: wrap; padding: 9px 12px; }
  .formal-table-skills span { padding: 3px 12px 3px 0; font-size: 11px; font-weight: 700; }

  .resume-sheet.layout-qm-asymmetric-profile { padding: 0; overflow: hidden; color: #24313a; }
  .asymmetric-layout { display: grid; grid-template-columns: 44% 56%; min-height: 1080px; }
  .asymmetric-left { padding: 58px 34px 44px; background: #edf2ef; border-right: 1px solid #cbd7d5; }
  .asymmetric-right { padding: 52px 38px 44px; }
  .asymmetric-identity { padding-bottom: 24px; border-bottom: 3px solid var(--resume-primary); }
  .asymmetric-kicker,
  .asymmetric-anchor > div > p { margin: 0 0 10px; color: var(--resume-primary); font-size: 9px; font-weight: 800; letter-spacing: .24em; }
  .asymmetric-identity h1 { margin: 0; font-family: var(--resume-heading-font); font-size: 36px; letter-spacing: .12em; }
  .asymmetric-identity > p:last-child { margin: 10px 0 0; color: var(--resume-primary); font-size: 15px; font-weight: 700; }
  .asymmetric-contact,
  .asymmetric-left-section { margin-top: var(--resume-section-spacing); }
  .asymmetric-contact h2,
  .asymmetric-left-section > h2 { margin: 0 0 13px; padding-bottom: 7px; border-bottom: 1px solid #b9c8c5; font-size: 15px; letter-spacing: .1em; }
  .asymmetric-contact > div { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 14px; }
  .asymmetric-contact span { display: grid; gap: 3px; min-width: 0; }
  .asymmetric-contact strong { color: #79868b; font-size: 9px; }
  .asymmetric-contact em { font-size: 11px; font-style: normal; overflow-wrap: anywhere; }
  .asymmetric-compact-items,
  .asymmetric-skills { display: grid; gap: var(--resume-item-spacing); }
  .asymmetric-compact-items article { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 4px 12px; break-inside: avoid; }
  .asymmetric-compact-items strong { font-size: 12px; }
  .asymmetric-compact-items span,
  .asymmetric-compact-items time { color: #657278; font-size: 10px; }
  .asymmetric-compact-items p { grid-column: 1 / -1; margin: 3px 0 0; font-size: 10px; white-space: pre-line; }
  .asymmetric-skill > div { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 6px; }
  .asymmetric-skill strong { font-size: 11px; }
  .asymmetric-skill em { color: #657278; font-size: 9px; font-style: normal; }
  .asymmetric-skill > span { display: block; height: 5px; background: #ccd5d2; overflow: hidden; }
  .asymmetric-skill i { display: block; height: 100%; background: var(--resume-primary); }
  .asymmetric-anchor { display: grid; grid-template-columns: 112px minmax(0, 1fr); gap: 22px; padding-bottom: 28px; margin-bottom: 30px; border-bottom: 1px solid #bdc9cb; break-inside: avoid; }
  .asymmetric-avatar { width: 112px; height: 142px; border-radius: 0; object-fit: cover; }
  .asymmetric-anchor h2 { margin: 0; font-family: var(--resume-heading-font); font-size: 22px; }
  .asymmetric-anchor blockquote { margin: 14px 0 0; color: #46565d; font-size: 11px; line-height: 1.8; white-space: pre-line; }
  .asymmetric-anchor > div > span { display: block; margin-top: 12px; color: var(--resume-primary); font-size: 10px; font-weight: 700; }
  .asymmetric-story-section + .asymmetric-story-section { margin-top: var(--resume-section-spacing); }
  .asymmetric-story-section > header { display: flex; align-items: center; gap: 9px; margin-bottom: 16px; }
  .asymmetric-story-section > header span { width: 18px; height: 3px; background: var(--resume-primary); }
  .asymmetric-story-section > header h2 { margin: 0; font-size: 17px; letter-spacing: .08em; }
  .asymmetric-story-section article { padding-left: 27px; break-inside: avoid; }
  .asymmetric-story-section article + article { margin-top: var(--resume-item-spacing); padding-top: var(--resume-item-spacing); border-top: 1px dotted #c7d0d2; }
  .asymmetric-story-head { display: flex; justify-content: space-between; gap: 14px; }
  .asymmetric-story-head h3 { margin: 0; font-size: 13px; }
  .asymmetric-story-head p { margin: 4px 0 0; color: var(--resume-primary); font-size: 10px; font-weight: 700; }
  .asymmetric-story-head time { flex: 0 0 auto; color: #718087; font-size: 9px; }
  .asymmetric-description { margin: 9px 0 0; color: #46565d; font-size: 10.5px; line-height: 1.75; white-space: pre-line; }
  .resume-sheet.has-custom-page-margin.layout-qm-asymmetric-profile { padding: 0; }
  .resume-sheet.has-custom-page-margin.layout-qm-asymmetric-profile .asymmetric-left,
  .resume-sheet.has-custom-page-margin.layout-qm-asymmetric-profile .asymmetric-right { padding-left: var(--resume-page-margin); padding-right: var(--resume-page-margin); }

`

export function buildCoreResumePrintHtml(resumeMarkup: string, title = 'Resume Export') {
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
</html>`
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
