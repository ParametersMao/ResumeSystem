<template>
  <div>
    <div class="topbar">
      <div>预览</div>
      <div>
        <button class="btn" @click="goBack">返回编辑</button>
        <button class="btn primary" @click="exportPdfClick">导出 PDF</button>
      </div>
    </div>
    <div class="canvas">
      <div ref="pageRef" class="page">
        <h1 style="margin:0 0 8px">{{ resume?.meta.title }}</h1>
        <div v-for="s in resume?.sections" :key="s.id" style="margin-top:16px">
          <h3 v-if="s.visible">{{ s.title }}</h3>
          <ul v-if="s.visible" style="margin:0;padding-left:18px">
            <li v-for="(it, idx) in s.items" :key="idx">{{ formatItem(it) }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getResume } from '@/api/resume'
import type { Resume, SectionItem } from '@/store/resume'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { exportResumePdfByHtml } from '@/api/resume'

const route = useRoute()
const router = useRouter()
const resume = ref<Resume | null>(null)
const pageRef = ref<HTMLElement | null>(null)

function goBack() { router.back() }

function formatItem(it: SectionItem) {
  if ((it as any).company) return `${(it as any).company} - ${(it as any).role}`
  if ((it as any).name) return `${(it as any).name}`
  return JSON.stringify(it)
}

async function exportPdfClick() {
  if (!pageRef.value) return
  // 方案A：本地导出（保留）
  const canvas = await html2canvas(pageRef.value, { scale: 2, useCORS: true })
  const img = canvas.toDataURL('image/jpeg', 0.92)
  const pdf = new jsPDF('p', 'mm', 'a4')
  const w = 210
  const h = 297
  const imgW = w
  const imgH = (canvas.height * imgW) / canvas.width
  let left = imgH
  let pos = 0
  pdf.addImage(img, 'JPEG', 0, pos, imgW, imgH)
  left -= h
  while (left > 0) {
    pos = left - imgH
    pdf.addPage()
    pdf.addImage(img, 'JPEG', 0, pos, imgW, imgH)
    left -= h
  }
  pdf.save('resume.pdf')

  // 方案B：服务端导出（对接后端）
  const html = pageRef.value.outerHTML
  try {
    const { url } = await exportResumePdfByHtml(html)
    if (url) window.open(url, '_blank')
  } catch (e) {
    // 忽略失败，仍保留本地导出结果
  }
}

onMounted(async () => {
  const id = String(route.params.resumeId)
  resume.value = await getResume(id)
})
</script>


