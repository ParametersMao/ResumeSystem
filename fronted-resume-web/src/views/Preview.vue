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
import { getResume } from '@/api/resume'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const previewRef = ref<InstanceType<typeof CoreResumePreview> | null>(null)
const documentState = ref(createEmptyDocument())
const exporting = ref(false)

const title = computed(() => buildResumeTitle(documentState.value.profile))

onMounted(loadResume)

async function loadResume() {
  try {
    await userStore.initUserState()
    const resume = await getResume(String(route.params.resumeId), userStore.user?.id)
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
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ])
    const canvas = await html2canvas(sheet, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = 210
    const pageHeight = 297
    const imageHeight = (canvas.height * pageWidth) / canvas.width
    let remaining = imageHeight
    let y = 0

    pdf.addImage(imgData, 'JPEG', 0, y, pageWidth, imageHeight)
    remaining -= pageHeight

    while (remaining > 0) {
      y = remaining - imageHeight
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, y, pageWidth, imageHeight)
      remaining -= pageHeight
    }

    pdf.save(`${title.value}.pdf`)
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
