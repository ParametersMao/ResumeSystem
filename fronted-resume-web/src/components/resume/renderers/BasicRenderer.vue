<template>
  <section class="basic-section basic-renderer">
    <div class="basic-content">
      <div class="basic-container">
        <!-- 卡片布局（当模板提供 .basic-card 样式时启用） -->
        <div v-if="useCardLayout" class="basic-card">
          <img v-if="avatarUrl" :src="avatarUrl" class="basic-avatar" :alt="`${name || '头像'}`" />
          <div class="basic-card-main">
            <div class="basic-name" v-if="name">{{ name }}</div>
            <div class="basic-intent" v-if="title">{{ title }}</div>
            <div class="basic-info-row">
              <div class="info-item"><span>性别</span><span>{{ basic.gender }}</span></div>
              <div class="info-item"><span>年龄</span><span>{{ basic.age }}</span></div>
              <div class="info-item"><span>工龄</span><span>{{ basic.yearsOfExperience }}</span></div>
              <div class="info-item"><span>所在地</span><span>{{ contacts.site }}</span></div>
              <div class="info-item"><span>电话</span><span>{{ contacts.phone }}</span></div>
              <div class="info-item"><span>邮箱</span><span>{{ contacts.email }}</span></div>
            </div>
          </div>
        </div>

        <!-- 原有横幅布局（作为兜底） -->
        <div class="basic-banner" v-else-if="showBanner">
          <div v-if="avatarUrl" class="basic-avatar-wrapper">
            <img :src="avatarUrl" class="basic-avatar" :alt="`${name || '头像'}`" />
          </div>

          <div class="basic-banner-main">
            <div class="basic-tag" v-if="bannerTag">{{ bannerTag }}</div>
            <div class="basic-name" v-if="name">{{ name }}</div>
            <div class="basic-title" v-if="title">{{ title }}</div>
            <div class="basic-subtitle" v-if="bannerSubtitle">{{ bannerSubtitle }}</div>

            <div v-if="metaItems.length" class="basic-meta-list">
              <div
                v-for="(item, index) in metaItems"
                :key="`meta-${index}`"
                class="basic-meta-item"
              >
                <img
                  v-if="isIconUrl(item.icon)"
                  class="meta-icon-image"
                  :src="normalizeIconUrl(item.icon)"
                  alt=""
                />
                <span v-else-if="item.icon" class="meta-icon">{{ item.icon }}</span>
                <span v-if="item.label" class="meta-label">{{ item.label }}</span>
                <span v-if="item.value" class="meta-value">{{ item.value }}</span>
              </div>
            </div>

            <div v-if="contactItems.length" class="basic-contact-list">
              <div
                v-for="(item, index) in contactItems"
                :key="`contact-${index}`"
                class="basic-contact-item"
              >
                <img
                  v-if="isIconUrl(item.icon)"
                  class="contact-icon-image"
                  :src="normalizeIconUrl(item.icon)"
                  alt=""
                />
                <span v-else-if="item.icon" class="contact-icon">{{ item.icon }}</span>
                <span v-if="item.label" class="contact-label">{{ item.label }}</span>
                <span v-if="item.value" class="contact-value">{{ item.value }}</span>
              </div>
            </div>
          </div>

          <div v-if="actions.length" class="basic-actions">
            <a
              v-for="(action, index) in actions"
              :key="`action-${index}`"
              class="basic-action"
              :class="{
                'basic-action--primary': action.type === 'primary',
                'basic-action--secondary': action.type === 'secondary'
              }"
              :href="action.href || '#'"
              :target="action.target || '_self'"
            >
              {{ action.label }}
            </a>
          </div>
        </div>

        <div v-if="summaryContent" class="basic-summary">
          <div v-if="summaryContent.html" v-html="summaryContent.html"></div>
          <p v-else>{{ summaryContent.text }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { normalizeRichTextValue } from '@/utils/richText'
import type { ResumeSection } from '@/types/resume'

interface BannerAction {
  label: string
  href?: string
  target?: string
  type?: string
}

const props = defineProps<{
  section: ResumeSection
  config?: Record<string, any>
  styleConfig?: Record<string, any>
}>()

const injectedResumeData = inject<any>('resumeData', {})
const sectionData = computed(() => props.section?.data ?? {})
const basic = computed(() => sectionData.value.basic ?? (injectedResumeData?.profile?.basic ?? {}))
const contactsMap = computed(() => basic.value.contacts ?? (injectedResumeData?.profile?.basic?.contacts ?? {}))

const name = computed(() => basic.value.name ?? '')
const title = computed(() => basic.value.title ?? '')
const avatar = computed(() => basic.value.avatar ?? '')
const avatarUrl = computed(() => {
  const raw = String(avatar.value || '')
  const cleaned = raw.replace(/[`"']/g, '').trim()
  return cleaned
})
const contacts = computed(() => contactsMap.value || {})

const bannerConfig = computed(() => sectionData.value.banner ?? {})
const bannerTag = computed(() => bannerConfig.value.tag ?? sectionData.value.tag ?? '')
const bannerSubtitle = computed(
  () => bannerConfig.value.subtitle ?? bannerConfig.value.description ?? ''
)

function resolvePath(path?: string) {
  if (!path) return undefined
  const sources: Record<string, any> = {
    basic: basic.value,
    contacts: contactsMap.value,
    data: sectionData.value
  }
  const segments = path.split('.').filter(Boolean)
  if (!segments.length) return undefined

  let current: any
  if (segments[0] in sources) {
    current = sources[segments[0]]
    segments.shift()
  } else {
    current = basic.value
  }

  for (const segment of segments) {
    if (current == null) return undefined
    current = current[segment]
  }
  return current
}

const fallbackMeta = computed(() => {
  const items: Array<Record<string, any>> = []
  if (basic.value.gender) {
    items.push({ label: '性别', value: basic.value.gender })
  }
  if (basic.value.age) {
    items.push({ label: '年龄', value: basic.value.age })
  }
  if (basic.value.yearsOfExperience) {
    items.push({ label: '工作经验', value: basic.value.yearsOfExperience })
  }
  const location = resolvePath('contacts.site') ?? basic.value.location
  if (location) {
    items.push({ label: '所在地', value: location })
  }
  return items
})

const metaItems = computed(() => {
  const raw = sectionData.value.meta
  if (Array.isArray(raw) && raw.length) {
    return raw
      .map((item: any) => {
        const value = item.value ?? resolvePath(item.field ?? item.key)
        if (!item.label && !value) return null
        return {
          label: item.label ?? '',
          value,
          icon: item.icon ?? '',
          type: item.type ?? ''
        }
      })
      .filter(Boolean) as Array<Record<string, any>>
  }
  return fallbackMeta.value
})

const contactItems = computed(() => {
  const raw = sectionData.value.contacts
  if (Array.isArray(raw) && raw.length) {
    return raw
      .map((item: any) => {
        const value = item.value ?? resolvePath(item.field ?? item.key)
        if (!item.label && !value) return null
        return {
          label: item.label ?? '',
          value,
          icon: item.icon ?? '',
          type: item.type ?? ''
        }
      })
      .filter(Boolean) as Array<Record<string, any>>
  }

  const contacts = contactsMap.value
  const list: Array<Record<string, any>> = []
  if (contacts.phone) list.push({ label: '电话', value: contacts.phone })
  if (contacts.email) list.push({ label: '邮箱', value: contacts.email })
  if (contacts.site) list.push({ label: '个人网站', value: contacts.site })
  return list
})

const actions = computed(() => {
  const source = bannerConfig.value.actions ?? sectionData.value.actions ?? []
  if (!Array.isArray(source)) return []
  return source
    .map((action: any) =>
      action && action.label
        ? {
            label: action.label,
            href: action.href,
            target: action.target,
            type: action.type
          }
        : null
    )
    .filter(Boolean) as BannerAction[]
})

function isIconUrl(icon: any): boolean {
  const value = getIconValue(icon)
  return (
    value.startsWith('http') ||
    value.startsWith('data:') ||
    /\.(svg|png|jpe?g|gif|webp)$/i.test(value)
  )
}

function normalizeIconUrl(icon: any): string {
  return getIconValue(icon)
}

function getIconValue(icon: any): string {
  if (!icon) return ''
  if (typeof icon === 'string') return icon.trim()
  return String(icon.url || icon.value || icon.text || '').trim()
}

const summaryContent = computed(() => {
  let raw =
    sectionData.value.summary ??
    sectionData.value.description ??
    bannerConfig.value.summary ??
    basic.value.summary

  if (!raw && typeof sectionData.value.basic?.summary === 'string') {
    raw = sectionData.value.basic.summary
  }

  if (!raw) return null
  const normalized = normalizeRichTextValue(raw)
  if (normalized.html) {
    return { html: normalized.html, text: normalized.text }
  }
  if (normalized.text) {
    return { text: normalized.text }
  }
  return null
})

const showBanner = computed(() => {
  return Boolean(
    avatarUrl.value ||
      name.value ||
      title.value ||
      bannerTag.value ||
      bannerSubtitle.value ||
      metaItems.value.length ||
      contactItems.value.length ||
      actions.value.length
  )
})

// 根据样式配置判断是否使用卡片布局
const useCardLayout = computed(() => {
  const custom = props.styleConfig?.custom || {}
  return Boolean(custom['.basic-card'])
})
</script>

<style scoped>
.basic-section {
  width: 100%;
}

.basic-content {
  width: 100%;
}

.basic-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 卡片布局结构匹配模板 customCss */
.basic-card {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 20px;
  align-items: center;
}

.basic-card-main {
  display: flex;
  flex-direction: column;
}

.basic-banner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 20px;
  align-items: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 12px;
}

.basic-avatar-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.basic-avatar {
  width: 96px;
  height: 112px;
  border-radius: 10px;
  object-fit: cover;
}

.basic-banner-main {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.basic-name {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.basic-title,
.basic-intent {
  font-size: 14px;
  color: #555;
}

.basic-subtitle {
  font-size: 13px;
  color: #777;
}

.basic-meta-list,
.basic-contact-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}

.basic-meta-item,
.basic-contact-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #444;
}

.meta-icon-image,
.contact-icon-image {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.basic-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
}

.basic-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 18px;
  border-radius: 999px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  color: inherit;
  border: 1px solid currentColor;
}

.basic-action--primary {
  background-color: #0f3d7a;
  color: #fff;
  border-color: transparent;
}

.basic-summary {
  font-size: 13px;
  line-height: 1.8;
  color: #444;
}

@media (max-width: 768px) {
  .basic-banner {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .basic-actions {
    align-items: center;
  }
}
  .basic-info-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(120px, 1fr));
    gap: 8px 16px;
    font-size: 13px;
  }

  .info-item { display: flex; align-items: center; gap: 6px; }
  .info-item span:first-child { font-weight: 600; }
</style>
