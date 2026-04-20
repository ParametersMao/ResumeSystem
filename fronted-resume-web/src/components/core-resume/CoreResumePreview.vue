<template>
  <div class="core-preview-shell">
    <div ref="sheetRef" class="resume-sheet" :class="`variant-${templateVariant}`" :style="sheetStyle">
      <template v-if="templateVariant === 'sidebar'">
        <div class="sidebar-layout">
          <aside class="sidebar-column">
            <div class="sidebar-identity">
              <h1 class="resume-name">{{ document.profile.name || '张三' }}</h1>
              <p class="resume-role">{{ document.profile.title || '前端工程师' }}</p>
            </div>

            <section v-if="contactItems.length" class="sidebar-block">
              <h2>联系方式</h2>
              <div class="sidebar-meta-list">
                <span v-for="item in contactItems" :key="item.label">
                  <strong>{{ item.label }}：</strong>{{ item.value }}
                </span>
              </div>
            </section>

            <section v-if="skillsSection" class="sidebar-block">
              <h2>{{ skillsSection.title }}</h2>
              <div class="skills-list">
                <span
                  v-for="(item, index) in skillsSection.items"
                  :key="`${skillsSection.id}-${index}`"
                  class="skill-pill"
                >
                  {{ item.name || item.text }}
                </span>
              </div>
            </section>
          </aside>

          <main class="sidebar-main">
            <section
              v-for="section in mainSections"
              :key="section.id"
              class="resume-section"
            >
              <div class="section-heading">
                <span class="section-heading-bar"></span>
                <h2>{{ section.title }}</h2>
              </div>

              <div v-if="section.type === 'summary'" class="section-items">
                <p
                  v-for="(item, index) in section.items"
                  :key="`${section.id}-${index}`"
                  class="item-description summary-block"
                >
                  {{ getDescription(item) }}
                </p>
              </div>

              <div v-else class="section-items">
                <article
                  v-for="(item, index) in section.items"
                  :key="`${section.id}-${index}`"
                  class="section-item"
                >
                  <div class="item-heading">
                    <h3>{{ getPrimaryText(section.type, item) }}</h3>
                    <span v-if="getSecondaryText(section.type, item)">{{ getSecondaryText(section.type, item) }}</span>
                  </div>
                  <div class="item-subheading">
                    <span>{{ formatDuration(item.duration) || item.date }}</span>
                  </div>
                  <p v-if="getDescription(item)" class="item-description">{{ getDescription(item) }}</p>
                </article>
              </div>
            </section>
          </main>
        </div>
      </template>

      <template v-else-if="templateVariant === 'timeline'">
        <header class="timeline-hero">
          <div class="timeline-hero-copy">
            <p class="eyebrow">CAREER STORY</p>
            <h1 class="resume-name">{{ document.profile.name || '张三' }}</h1>
            <p class="resume-role">{{ document.profile.title || '前端工程师' }}</p>
          </div>
          <div class="timeline-contact-grid">
            <span v-for="item in contactItems" :key="item.label">
              <strong>{{ item.label }}</strong>
              <em>{{ item.value }}</em>
            </span>
          </div>
        </header>

        <section
          v-for="section in visibleSections"
          :key="section.id"
          class="timeline-section"
        >
          <div class="timeline-marker">
            <span class="timeline-dot"></span>
            <h2>{{ section.title }}</h2>
          </div>

          <div v-if="section.type === 'skills'" class="timeline-skills">
            <span
              v-for="(item, index) in section.items"
              :key="`${section.id}-${index}`"
              class="timeline-skill"
            >
              {{ item.name || item.text }}
            </span>
          </div>

          <div v-else-if="section.type === 'summary'" class="section-items">
            <p
              v-for="(item, index) in section.items"
              :key="`${section.id}-${index}`"
              class="item-description summary-block timeline-summary"
            >
              {{ getDescription(item) }}
            </p>
          </div>

          <div v-else class="timeline-list">
            <article
              v-for="(item, index) in section.items"
              :key="`${section.id}-${index}`"
              class="timeline-card"
            >
              <div class="timeline-card-top">
                <div>
                  <h3>{{ getPrimaryText(section.type, item) }}</h3>
                  <p v-if="getSecondaryText(section.type, item)">{{ getSecondaryText(section.type, item) }}</p>
                </div>
                <span class="timeline-date">{{ formatDuration(item.duration) || item.date }}</span>
              </div>
              <p v-if="getDescription(item)" class="item-description">{{ getDescription(item) }}</p>
            </article>
          </div>
        </section>
      </template>

      <template v-else-if="templateVariant === 'spotlight'">
        <header class="spotlight-hero">
          <div class="spotlight-copy">
            <p class="spotlight-kicker">PERSONAL BRAND</p>
            <h1 class="resume-name">{{ document.profile.name || '张三' }}</h1>
            <p class="resume-role">{{ document.profile.title || '前端工程师' }}</p>
            <p v-if="summarySection?.items?.length" class="spotlight-summary">
              {{ getDescription(summarySection.items[0]) }}
            </p>
          </div>
          <div class="spotlight-meta-card">
            <div v-for="item in contactItems" :key="item.label" class="spotlight-meta-item">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </header>

        <div class="spotlight-body">
          <aside class="spotlight-side">
            <section v-if="skillsSection" class="spotlight-panel">
              <div class="section-heading">
                <span class="section-heading-bar"></span>
                <h2>{{ skillsSection.title }}</h2>
              </div>
              <div class="spotlight-skill-grid">
                <span
                  v-for="(item, index) in skillsSection.items"
                  :key="`${skillsSection.id}-${index}`"
                  class="spotlight-skill"
                >
                  {{ item.name || item.text }}
                </span>
              </div>
            </section>

            <section
              v-for="section in supportSections"
              :key="section.id"
              class="spotlight-panel"
            >
              <div class="section-heading">
                <span class="section-heading-bar"></span>
                <h2>{{ section.title }}</h2>
              </div>

              <div v-if="section.type === 'summary'" class="section-items">
                <p
                  v-for="(item, index) in section.items"
                  :key="`${section.id}-${index}`"
                  class="item-description summary-block"
                >
                  {{ getDescription(item) }}
                </p>
              </div>

              <div v-else class="section-items">
                <article
                  v-for="(item, index) in section.items"
                  :key="`${section.id}-${index}`"
                  class="section-item compact-item"
                >
                  <div class="item-heading">
                    <h3>{{ getPrimaryText(section.type, item) }}</h3>
                  </div>
                  <div class="item-subheading">
                    <span>{{ getSecondaryText(section.type, item) }}</span>
                    <span>{{ formatDuration(item.duration) || item.date }}</span>
                  </div>
                  <p v-if="getDescription(item)" class="item-description">{{ getDescription(item) }}</p>
                </article>
              </div>
            </section>
          </aside>

          <main class="spotlight-main">
            <section
              v-for="section in featuredSections"
              :key="section.id"
              class="resume-section spotlight-section"
            >
              <div class="section-heading">
                <span class="section-heading-bar"></span>
                <h2>{{ section.title }}</h2>
              </div>

              <div class="section-items">
                <article
                  v-for="(item, index) in section.items"
                  :key="`${section.id}-${index}`"
                  class="spotlight-card"
                >
                  <div class="spotlight-card-head">
                    <div>
                      <h3>{{ getPrimaryText(section.type, item) }}</h3>
                      <p v-if="getSecondaryText(section.type, item)">{{ getSecondaryText(section.type, item) }}</p>
                    </div>
                    <span class="spotlight-date">{{ formatDuration(item.duration) || item.date }}</span>
                  </div>
                  <p v-if="getDescription(item)" class="item-description">{{ getDescription(item) }}</p>
                </article>
              </div>
            </section>
          </main>
        </div>
      </template>

      <template v-else>
        <header class="resume-header">
          <div>
            <h1 class="resume-name">{{ document.profile.name || '张三' }}</h1>
            <p class="resume-role">{{ document.profile.title || '前端工程师' }}</p>
          </div>
          <div class="resume-meta">
            <span v-for="item in contactItems" :key="item.label">
              <strong>{{ item.label }}：</strong>{{ item.value }}
            </span>
          </div>
        </header>

        <section
          v-for="section in visibleSections"
          :key="section.id"
          class="resume-section"
        >
          <div class="section-heading">
            <span class="section-heading-bar"></span>
            <h2>{{ section.title }}</h2>
          </div>

          <div v-if="section.type === 'skills'" class="skills-list">
            <span
              v-for="(item, index) in section.items"
              :key="`${section.id}-${index}`"
              class="skill-pill"
            >
              {{ item.name || item.text }}
            </span>
          </div>

          <div v-else-if="section.type === 'summary'" class="section-items">
            <p
              v-for="(item, index) in section.items"
              :key="`${section.id}-${index}`"
              class="item-description summary-block"
            >
              {{ getDescription(item) }}
            </p>
          </div>

          <div v-else class="section-items">
            <article
              v-for="(item, index) in section.items"
              :key="`${section.id}-${index}`"
              class="section-item"
            >
              <div class="item-heading">
                <h3>{{ getPrimaryText(section.type, item) }}</h3>
                <span v-if="getSecondaryText(section.type, item)">{{ getSecondaryText(section.type, item) }}</span>
              </div>
              <div class="item-subheading">
                <span>{{ formatDuration(item.duration) || item.date }}</span>
              </div>
              <p v-if="getDescription(item)" class="item-description">{{ getDescription(item) }}</p>
            </article>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CoreResumeDocument, CoreResumeSectionItem, CoreSectionType } from '@/core-resume/model'
import { resolveTemplateVariant } from '@/core-resume/templates'

interface ContactItem {
  label: string
  value: string
}

interface Props {
  document: CoreResumeDocument
}

const props = defineProps<Props>()

const sheetRef = ref<HTMLElement | null>(null)

const contactItems = computed<ContactItem[]>(() => {
  const profile = props.document.profile
  return [
    { label: '电话', value: profile.phone },
    { label: '邮箱', value: profile.email },
    { label: '性别', value: profile.gender },
    { label: '年龄', value: profile.age },
    { label: '经验', value: profile.yearsOfExperience },
    { label: '主页', value: profile.site },
  ].filter((item) => item.value)
})

const templateVariant = computed(() =>
  resolveTemplateVariant(props.document as unknown as { templateVariant?: unknown; templateName?: unknown }),
)
const visibleSections = computed(() => props.document.sections.filter((section) => section.visible))
const skillsSection = computed(() => visibleSections.value.find((section) => section.type === 'skills'))
const summarySection = computed(() => visibleSections.value.find((section) => section.type === 'summary'))
const mainSections = computed(() => visibleSections.value.filter((section) => section.type !== 'skills'))
const featuredSections = computed(() =>
  visibleSections.value.filter((section) => ['experience', 'projects', 'internship'].includes(section.type)),
)
const supportSections = computed(() =>
  visibleSections.value.filter((section) => !['experience', 'projects', 'internship', 'skills', 'summary'].includes(section.type)),
)

const sheetStyle = computed(() => {
  const theme = props.document.theme
  return {
    '--resume-primary': theme.primaryColor,
    '--resume-font': theme.fontFamily,
    '--resume-heading-font': theme.headingFontFamily,
    '--resume-section-spacing': `${theme.sectionSpacing}px`,
    '--resume-item-spacing': `${theme.itemSpacing}px`,
    '--resume-font-size': `${theme.fontSize}px`,
    '--resume-line-height': String(theme.lineHeight),
  }
})

function getPrimaryText(type: CoreSectionType, item: CoreResumeSectionItem) {
  switch (type) {
    case 'intention':
      return String(item.intention || '求职意向')
    case 'education':
      return String(item.school || '学校名称')
    case 'experience':
    case 'internship':
      return String(item.company || '公司名称')
    case 'projects':
      return String(item.name || '项目名称')
    case 'campus':
      return String(item.org || '校园组织')
    case 'skills':
      return String(item.name || '')
    case 'awards':
      return String(item.name || '奖项名称')
    case 'summary':
      return '个人简介'
    case 'hobbies':
      return String(item.text || '兴趣爱好')
    case 'custom':
      return String(item.name || '自定义模块')
    default:
      return ''
  }
}

function getSecondaryText(type: CoreSectionType, item: CoreResumeSectionItem) {
  switch (type) {
    case 'education':
      return String(item.degree || item.major || '')
    case 'experience':
    case 'internship':
    case 'projects':
    case 'campus':
      return String(item.role || '')
    case 'awards':
      return String(item.org || '')
    default:
      return ''
  }
}

function getDescription(item: CoreResumeSectionItem) {
  return String(item.desc || item.text || '')
}

function formatDuration(value: unknown) {
  if (!value || typeof value !== 'object') {
    return ''
  }
  const duration = value as { start?: string; end?: string }
  return [duration.start, duration.end].filter(Boolean).join(' - ')
}

defineExpose({
  sheetRef,
})
</script>

<style scoped>
.core-preview-shell {
  padding: 28px;
  min-height: 100%;
  background:
    linear-gradient(180deg, rgba(37, 99, 235, 0.06), transparent 25%),
    #eef2ff;
}

.resume-sheet {
  width: min(100%, 820px);
  min-height: 1120px;
  margin: 0 auto;
  padding: 42px 46px;
  background: #fff;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.14);
  border-radius: 24px;
  font-family: var(--resume-font);
  font-size: var(--resume-font-size);
  line-height: var(--resume-line-height);
  color: #0f172a;
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
  background:
    linear-gradient(180deg, rgba(37, 99, 235, 0.06), rgba(37, 99, 235, 0)) #ffffff;
}

.resume-sheet.variant-spotlight {
  padding: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.02), rgba(15, 23, 42, 0)) #fff;
}

.resume-header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 24px;
  margin-bottom: var(--resume-section-spacing);
  border-bottom: 2px solid rgba(37, 99, 235, 0.16);
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

.resume-meta,
.sidebar-meta-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #475569;
}

.resume-meta {
  min-width: 220px;
}

.sidebar-layout {
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  min-height: 1120px;
}

.sidebar-column {
  padding: 42px 26px;
  background: linear-gradient(180deg, var(--resume-primary), color-mix(in srgb, var(--resume-primary) 72%, #0f172a));
  color: #eff6ff;
}

.sidebar-identity {
  margin-bottom: 28px;
}

.sidebar-column .resume-role {
  color: rgba(255, 255, 255, 0.92);
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
}

.timeline-hero-copy {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.eyebrow {
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
}

.timeline-card-top {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
}

.timeline-card-top h3 {
  margin: 0;
  font-size: 16px;
}

.timeline-card-top p {
  margin: 4px 0 0;
  color: #475569;
  font-size: 13px;
}

.timeline-date {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.12);
  color: var(--resume-primary);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.timeline-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.timeline-skill {
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
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--resume-primary) 28%, #ffffff), transparent 42%),
    linear-gradient(135deg, color-mix(in srgb, var(--resume-primary) 12%, #ffffff), #ffffff 68%);
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.spotlight-kicker {
  margin: 0 0 10px;
  font-size: 12px;
  letter-spacing: 0.18em;
  color: var(--resume-primary);
  font-weight: 700;
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
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(12px);
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

.spotlight-skill-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.spotlight-skill {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(37, 99, 235, 0.08);
  color: var(--resume-primary);
  font-weight: 600;
}

.compact-item {
  padding: 14px 16px;
}

.spotlight-card {
  padding: 20px 22px;
  border-radius: 22px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95));
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05);
}

.spotlight-card-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.spotlight-card-head h3 {
  margin: 0;
  font-size: 17px;
}

.spotlight-card-head p {
  margin: 6px 0 0;
  color: #475569;
}

.spotlight-date {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.05);
  color: var(--resume-primary);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.resume-section + .resume-section {
  margin-top: var(--resume-section-spacing);
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
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

.section-item,
.summary-block {
  padding: 16px 18px;
  border-radius: 16px;
  background: #f8fafc;
}

.variant-sidebar .section-item,
.variant-sidebar .summary-block {
  background: #ffffff;
  border: 1px solid #e2e8f0;
}

.item-heading {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
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

.summary-block {
  margin: 0;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
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

.variant-sidebar .skill-pill {
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
}

.variant-ats {
  padding: 34px 42px;
  border-radius: 8px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
}

.variant-ats .resume-header {
  display: block;
  border-bottom: 1px solid #111827;
  padding-bottom: 14px;
  margin-bottom: 18px;
}

.variant-ats .resume-name {
  font-size: 30px;
}

.variant-ats .resume-role {
  color: #111827;
}

.variant-ats .resume-meta {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-top: 10px;
  color: #374151;
}

.variant-ats .section-heading {
  border-bottom: 1px solid #d1d5db;
  padding-bottom: 6px;
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
  padding: 46px 50px;
  background:
    linear-gradient(90deg, #111827 0 12px, transparent 12px),
    linear-gradient(180deg, rgba(146, 64, 14, 0.08), transparent 30%),
    #fffaf0;
  border-radius: 18px;
}

.variant-executive .resume-header {
  border-bottom: 2px solid rgba(146, 64, 14, 0.26);
}

.variant-executive .resume-name {
  font-size: 38px;
  letter-spacing: 0.02em;
}

.variant-executive .section-heading-bar {
  width: 26px;
  height: 3px;
  border-radius: 0;
}

.variant-executive .section-item,
.variant-executive .summary-block {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(146, 64, 14, 0.14);
}

.variant-compact {
  padding: 28px 34px;
  border-radius: 12px;
  font-size: calc(var(--resume-font-size) - 1px);
}

.variant-compact .resume-header {
  padding-bottom: 14px;
  margin-bottom: 14px;
}

.variant-compact .resume-name {
  font-size: 28px;
}

.variant-compact .resume-section + .resume-section {
  margin-top: 14px;
}

.variant-compact .section-heading {
  margin-bottom: 8px;
}

.variant-compact .section-heading h2 {
  font-size: 15px;
}

.variant-compact .section-heading-bar {
  height: 16px;
}

.variant-compact .section-items {
  gap: 8px;
}

.variant-compact .section-item,
.variant-compact .summary-block {
  padding: 10px 12px;
  border-radius: 10px;
}

.variant-editorial {
  padding: 0;
  border-radius: 28px;
  overflow: hidden;
}

.variant-editorial .resume-header {
  margin: 0;
  padding: 40px 46px 32px;
  color: #fff;
  background:
    radial-gradient(circle at 84% 12%, rgba(255, 255, 255, 0.28), transparent 28%),
    linear-gradient(135deg, var(--resume-primary), #0f172a);
  border-bottom: 0;
}

.variant-editorial .resume-role,
.variant-editorial .resume-meta {
  color: rgba(255, 255, 255, 0.86);
}

.variant-editorial .resume-section {
  padding: 0 46px;
}

.variant-editorial .resume-section:first-of-type {
  padding-top: 34px;
}

.variant-editorial .resume-section:last-child {
  padding-bottom: 42px;
}

.variant-editorial .section-heading {
  align-items: flex-end;
}

.variant-editorial .section-heading-bar {
  width: 34px;
  height: 4px;
  border-radius: 0;
}

.variant-editorial .section-item,
.variant-editorial .summary-block {
  background: #fff;
  border: 1px solid rgba(225, 29, 72, 0.14);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

@media (max-width: 900px) {
  .core-preview-shell {
    padding: 16px;
  }

  .resume-sheet {
    min-height: auto;
    padding: 28px 22px;
    border-radius: 18px;
  }

  .resume-header,
  .timeline-hero,
  .timeline-card-top,
  .spotlight-card-head {
    flex-direction: column;
  }

  .timeline-hero,
  .spotlight-hero {
    grid-template-columns: 1fr;
  }

  .timeline-contact-grid {
    grid-template-columns: 1fr;
  }

  .sidebar-layout {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .spotlight-body {
    grid-template-columns: 1fr;
  }

  .resume-meta {
    min-width: 0;
  }

  .resume-sheet.variant-sidebar {
    padding: 0;
  }

  .sidebar-column,
  .sidebar-main,
  .spotlight-side,
  .spotlight-main {
    padding: 26px 22px;
  }
}
</style>
