<template>
  <div class="preview-page">
    <div class="preview-toolbar">
      <div>
        <h1>{{ title }}</h1>
        <p>只读预览页，基于同一份核心文档渲染。</p>
      </div>
      <div class="toolbar-actions">
        <el-button @click="goBack">返回</el-button>
        <el-button type="primary" @click="exportPdf" :loading="exporting">导出 PDF</el-button>
      </div>
    </div>

    <CoreResumePreview ref="previewRef" :document="documentState" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import CoreResumePreview from '@/components/core-resume/CoreResumePreview.vue'
import { buildResumeTitle, createEmptyDocument, ensureAllSections, parseResumeContent } from '@/core-resume/model'
import { exportResumePdfByHtml, getResume } from '@/api/resume'
import { buildCoreResumePrintHtml } from '@/core-resume/print'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const previewRef = ref<InstanceType<typeof CoreResumePreview> | null>(null)
const documentState = ref(createEmptyDocument())
const exporting = ref(false)
const loadedResume = ref<{ id: number; templateId?: number } | null>(null)

const title = computed(() => buildResumeTitle(documentState.value.profile))

onMounted(loadResume)

async function loadResume() {
  try {
    await userStore.initUserState()
    const resume = await getResume(String(route.params.resumeId), userStore.user?.id)
    loadedResume.value = { id: Number(resume.id), templateId: resume.templateId }
    const parsed = parseResumeContent(resume.content)
    if (parsed) {
      documentState.value = ensureAllSections(parsed)
    }
  } catch (error) {
    console.error('加载预览失败:', error)
    ElMessage.error('加载预览失败')
  }
}

function goBack() {
  router.back()
}

async function exportPdf() {
  const sheet = previewRef.value?.sheetRef
  if (!sheet) {
    return
  }
  exporting.value = true
  try {
    const html = buildCoreResumePrintHtml(sheet.outerHTML, title.value)
    const { url, pageCount } = await exportResumePdfByHtml(html, {
      resumeId: loadedResume.value?.id,
      templateId: loadedResume.value?.templateId,
    })
    const link = document.createElement('a')
    link.href = url
    link.download = `${title.value.replace(/[\\/:*?"<>|]/g, '-') || 'resume'}.pdf`
    link.rel = 'noopener'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    ElMessage.success(`PDF 已由服务端统一导出，共 ${pageCount} 页`)
  } catch (error) {
    console.error('导出 PDF 失败:', error)
    ElMessage.error('导出失败，请稍后重试')
  } finally {
    exporting.value = false
  }
}
</script>

<style scoped>
.preview-page {
  min-height: 100vh;
  background: #f8fafc;
}

.preview-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 20px 24px 0;
}

.preview-toolbar h1 {
  margin: 0;
}

.preview-toolbar p {
  margin: 6px 0 0;
  color: #64748b;
}

.toolbar-actions {
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .preview-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
