<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="hero-content">
        <span class="eyebrow">JD 驱动的中文简历优化</span>
        <h1>每个目标岗位，<br />都值得一份专属简历</h1>
        <p class="hero-subtitle">
          从岗位目标出发组织经历，用 AI 辅助诊断和润色；不直接覆盖、不替你编造，
          每次关键修改都可以保存、对比和回滚。
        </p>
        <div class="hero-actions">
          <router-link to="/resumes" class="btn-primary">开始制作</router-link>
          <router-link to="/templates" class="btn-secondary">查看 ATS 版式</router-link>
        </div>
        <div class="trust-row">
          <span>事实由你确认</span>
          <span>修改可追溯</span>
          <span>PDF 稳定导出</span>
        </div>
      </div>

      <div class="hero-workspace" aria-label="岗位专属简历工作流示意">
        <div class="workspace-topbar">
          <div>
            <span class="workspace-label">目标岗位</span>
            <strong>前端工程师</strong>
          </div>
          <span class="version-pill">岗位版本 v3</span>
        </div>
        <div class="workspace-body">
          <div class="resume-sheet">
            <div class="sheet-header">
              <div>
                <strong>张三</strong>
                <span>前端工程师</span>
              </div>
              <div class="avatar-placeholder"></div>
            </div>
            <div v-for="section in previewSections" :key="section" class="sheet-section">
              <span>{{ section }}</span>
              <i></i>
              <i class="short"></i>
            </div>
          </div>
          <aside class="review-panel">
            <span class="review-label">优化原则</span>
            <div class="review-item done">
              <b>01</b>
              <p><strong>保留事实</strong><span>不补造经历和数字</span></p>
            </div>
            <div class="review-item active">
              <b>02</b>
              <p><strong>聚焦岗位</strong><span>突出相关能力与结果</span></p>
            </div>
            <div class="review-item">
              <b>03</b>
              <p><strong>控制版面</strong><span>优先清晰和可投递</span></p>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <section class="promise-section">
      <div class="section-heading">
        <span class="eyebrow">现在已经可以完成</span>
        <h2>一份简历，从编辑到投递版本</h2>
        <p>不堆砌尚未开放的能力，先把每次真实投递需要的基础流程做好。</p>
      </div>
      <div class="promise-grid">
        <article v-for="item in promises" :key="item.title" class="promise-card">
          <span>{{ item.index }}</span>
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </article>
      </div>
    </section>

    <section class="workflow-section">
      <div class="workflow-copy">
        <span class="eyebrow light">可控的 AI 辅助</span>
        <h2>建议先审核，再写进简历</h2>
        <p>
          AI 润色、补全和深度诊断都会先返回建议。你决定是否应用；系统在关键修改前保留版本，
          需要时可以比较差异或恢复旧稿。
        </p>
        <router-link to="/templates" class="text-link">选择一套合适的信息结构 →</router-link>
      </div>
      <div class="workflow-steps">
        <div v-for="step in workflow" :key="step.index" class="workflow-step">
          <span>{{ step.index }}</span>
          <div><strong>{{ step.title }}</strong><p>{{ step.description }}</p></div>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <span class="eyebrow">从一份可信的事实简历开始</span>
      <h2>先完成内容，<br />再为目标岗位保存专属版本</h2>
      <p>当前支持在线编辑、AI 辅助、版本记录和 PDF 导出。</p>
      <router-link to="/resumes" class="btn-primary">创建我的简历</router-link>
    </section>
  </div>
</template>

<script setup lang="ts">
const previewSections = ['个人优势', '工作经历', '项目经历', '专业技能']

const promises = [
  { index: '01', title: '结构化编辑', description: '按教育、工作、项目和技能模块维护内容，并随时切换适合的版式。' },
  { index: '02', title: 'AI 辅助表达', description: '对已有事实做润色、补全和诊断，所有建议由你确认后再应用。' },
  { index: '03', title: '版本对比回滚', description: '为重要修改保存快照，比较不同版本，并恢复到任意历史稿。' },
  { index: '04', title: 'PDF 投递导出', description: '使用与编辑预览一致的服务端渲染流程，生成便于投递和打印的 PDF。' },
]

const workflow = [
  { index: '1', title: '建立事实底稿', description: '先写清真实经历、职责、行动和结果。' },
  { index: '2', title: '明确目标岗位', description: '围绕岗位方向检查关键词、重点和内容缺口。' },
  { index: '3', title: '逐条应用建议', description: '查看修改理由，只采用符合事实的表达。' },
  { index: '4', title: '保存投递版本', description: '保留岗位专属版本，并导出最终 PDF。' },
]
</script>

<style scoped>
.home-page { max-width: 1240px; margin: 0 auto; padding: 0 28px 80px; color: #142033; }
.hero-section { min-height: 640px; display: grid; grid-template-columns: minmax(0, .9fr) minmax(520px, 1.1fr); gap: 64px; align-items: center; padding: 72px 0 88px; }
.eyebrow { display: inline-flex; color: #2563eb; font-size: 13px; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; }
.hero-content h1 { margin: 18px 0 24px; font-size: clamp(42px, 4vw, 58px); line-height: 1.08; letter-spacing: -.04em; color: #0f172a; text-wrap: balance; }
.hero-subtitle { max-width: 610px; margin: 0; color: #526078; font-size: 18px; line-height: 1.85; }
.hero-actions { display: flex; gap: 14px; margin-top: 34px; }
.btn-primary, .btn-secondary { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 24px; border-radius: 12px; font-weight: 800; text-decoration: none; transition: .2s ease; }
.btn-primary { color: #fff; background: #2563eb; box-shadow: 0 14px 30px rgba(37, 99, 235, .22); }
.btn-secondary { color: #1e40af; background: #eff6ff; border: 1px solid #bfdbfe; }
.btn-primary:hover, .btn-secondary:hover { transform: translateY(-2px); }
.trust-row { display: flex; flex-wrap: wrap; gap: 10px 20px; margin-top: 30px; color: #64748b; font-size: 13px; font-weight: 700; }
.trust-row span::before { content: '✓'; margin-right: 7px; color: #16a34a; }
.hero-workspace { overflow: hidden; border: 1px solid #dbe4f0; border-radius: 24px; background: #f8fafc; box-shadow: 0 30px 80px rgba(15, 23, 42, .13); transform: rotate(1deg); }
.workspace-topbar { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid #e2e8f0; background: rgba(255,255,255,.9); }
.workspace-topbar > div { display: grid; gap: 2px; }
.workspace-label, .review-label { color: #94a3b8; font-size: 11px; font-weight: 800; letter-spacing: .12em; }
.version-pill { padding: 7px 10px; border-radius: 999px; color: #1d4ed8; background: #dbeafe; font-size: 12px; font-weight: 800; }
.workspace-body { display: grid; grid-template-columns: 1fr 190px; gap: 14px; padding: 18px; }
.resume-sheet { min-height: 440px; padding: 32px; border-radius: 12px; background: #fff; box-shadow: 0 8px 24px rgba(15,23,42,.08); }
.sheet-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 22px; border-bottom: 3px solid #1d4ed8; }
.sheet-header > div:first-child { display: grid; gap: 5px; }
.sheet-header strong { font-size: 25px; }
.sheet-header span { color: #2563eb; font-size: 13px; font-weight: 800; }
.avatar-placeholder { width: 48px; height: 58px; border-radius: 8px; background: linear-gradient(150deg, #dbeafe, #eff6ff); }
.sheet-section { display: grid; gap: 8px; margin-top: 22px; }
.sheet-section span { color: #1e3a8a; font-size: 12px; font-weight: 900; }
.sheet-section i { display: block; width: 100%; height: 7px; border-radius: 99px; background: #dbe4f0; }
.sheet-section i.short { width: 68%; background: #e8eef6; }
.review-panel { display: flex; flex-direction: column; gap: 10px; padding: 18px 14px; border-radius: 12px; background: #0f172a; color: #fff; }
.review-label { color: #64748b; margin-bottom: 4px; }
.review-item { display: flex; gap: 10px; padding: 12px 10px; border: 1px solid #27364c; border-radius: 10px; }
.review-item.active { border-color: #3b82f6; background: #172554; }
.review-item.done b { color: #4ade80; }
.review-item b { color: #60a5fa; font-size: 11px; }
.review-item p { display: grid; gap: 4px; margin: 0; }
.review-item strong { font-size: 12px; }
.review-item span { color: #94a3b8; font-size: 10px; line-height: 1.5; }
.promise-section { padding: 92px 0; }
.section-heading { max-width: 650px; margin-bottom: 40px; }
.section-heading h2, .workflow-copy h2, .cta-section h2 { margin: 12px 0 14px; color: #0f172a; font-size: clamp(32px, 4vw, 46px); line-height: 1.2; letter-spacing: -.03em; text-wrap: balance; }
.section-heading p, .workflow-copy > p, .cta-section p { color: #64748b; line-height: 1.8; }
.promise-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.promise-card { min-height: 205px; padding: 26px; border: 1px solid #e2e8f0; border-radius: 18px; background: #fff; }
.promise-card > span { color: #2563eb; font-size: 12px; font-weight: 900; }
.promise-card h3 { margin: 34px 0 10px; font-size: 19px; }
.promise-card p { margin: 0; color: #64748b; font-size: 14px; line-height: 1.75; }
.workflow-section { display: grid; grid-template-columns: .85fr 1.15fr; gap: 70px; padding: 64px; border-radius: 28px; background: #0f172a; }
.eyebrow.light { color: #60a5fa; }
.workflow-copy h2 { color: #fff; }
.workflow-copy > p { color: #a8b5c8; }
.text-link { display: inline-flex; margin-top: 20px; color: #93c5fd; font-weight: 800; text-decoration: none; }
.workflow-steps { display: grid; gap: 12px; }
.workflow-step { display: grid; grid-template-columns: 38px 1fr; gap: 14px; padding: 16px; border: 1px solid #26354a; border-radius: 14px; }
.workflow-step > span { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; color: #93c5fd; background: #172554; font-weight: 900; }
.workflow-step strong { color: #fff; }
.workflow-step p { margin: 5px 0 0; color: #94a3b8; font-size: 13px; }
.cta-section { max-width: 790px; margin: 0 auto; padding: 110px 0 35px; text-align: center; }
.cta-section p { margin-bottom: 30px; }
@media (max-width: 1050px) { .hero-section { grid-template-columns: 1fr; } .hero-workspace { max-width: 720px; transform: none; } .promise-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 760px) { .home-page { padding: 0 18px 56px; } .hero-section { padding: 52px 0 64px; gap: 42px; } .hero-actions { flex-direction: column; } .workspace-body { grid-template-columns: 1fr; } .review-panel { display: grid; grid-template-columns: repeat(3, 1fr); } .review-label { grid-column: 1 / -1; } .promise-grid { grid-template-columns: 1fr; } .workflow-section { grid-template-columns: 1fr; padding: 34px 24px; gap: 36px; } }
@media (max-width: 520px) { .hero-content h1 { font-size: 38px; } .workspace-body { padding: 10px; } .resume-sheet { min-height: 390px; padding: 22px; } .review-panel { grid-template-columns: 1fr; } .review-label { grid-column: auto; } }
</style>
