<template>
  <div>
    <div class="topbar">
      <div style="display:flex;gap:8px;align-items:center">
        <strong>编辑器</strong>
        <input v-model="title" style="padding:6px 8px"/>
        <span style="color:#888">{{ saveStateLabel }}</span>
      </div>
      <div>
        <router-link class="btn" :to="`/preview/${resume?.resumeId}`">预览</router-link>
        <button class="btn primary" @click="addWork">新增工作</button>
      </div>
    </div>
    <div class="editor-layout">
      <div class="panel left" style="padding:12px">
        <h3>区块</h3>
        <ul style="list-style:none;padding:0">
          <li v-for="s in resume?.sections" :key="s.id" style="display:flex;align-items:center;gap:6px;margin:6px 0">
            <input type="checkbox" v-model="s.visible">
            <span>{{ s.title }}</span>
          </li>
        </ul>
      </div>
      <div class="canvas">
        <div class="page">
          <h1 style="margin:0 0 8px">{{ title }}</h1>
          <section v-for="s in resume?.sections" :key="s.id" v-show="s.visible" style="margin-top:16px">
            <h3>{{ s.title }}</h3>
            <div v-for="(it, i) in s.items" :key="i" style="padding:6px 0;border-bottom:1px dashed #eee">
              <template v-if="it.type==='work'">
                <div style="font-weight:600">{{ (it as any).company }} · {{ (it as any).role }}</div>
                <small style="color:#888">{{ (it as any).start }} - {{ (it as any).end || '至今' }}</small>
                <ul style="margin:6px 0 0 18px">
                  <li v-for="(h,idx) in (it as any).highlights" :key="idx">{{ h }}</li>
                </ul>
              </template>
            </div>
          </section>
        </div>
      </div>
      <div class="panel right" style="padding:12px">
        <h3>样式</h3>
        <label>主题色</label>
        <input type="color" v-model="resume!.style.themeColor"/>
        <label>字号</label>
        <input type="number" v-model.number="resume!.style.fontSize" min="10" max="14"/>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useResumeStore, type Resume, type ResumeSection, type WorkItem } from '@/store/resume'
import { getResume, updateResume } from '@/api/resume'

const route = useRoute()
const store = useResumeStore()
const resume = computed(() => store.resume)
const title = computed({
  get: () => resume.value?.meta.title || '',
  set: (v: string) => store.applyPatch(d => d.meta.title = v)
})
const saveStateLabel = computed(() => ({ idle:'', saving:'保存中...', saved:'已保存', conflict:'有冲突', error:'保存失败' } as any)[store.saveState])

onMounted(async () => {
  const id = String(route.params.resumeId)
  const data = await getResume(id)
  store.setResume(data)
})

function addWork() {
  if (!resume.value) return
  const section = resume.value.sections.find(s => s.type === 'work')
  const work: WorkItem = { type:'work', company:'未命名公司', role:'职位', start:'2022-01', end:'2023-12', highlights:['示例亮点 1','示例亮点 2'] }
  store.applyPatch(d => {
    if (section) {
      section.items.push(work)
    } else {
      const s: ResumeSection = { id: crypto.randomUUID(), type:'work', title:'工作经历', visible:true, items:[work] }
      d.sections.push(s)
    }
  })
}

// 自动保存（去抖）
let timer: number | null = null
watch(() => store.resume, async (val) => {
  if (!val) return
  if (timer) clearTimeout(timer)
  store.saveState = 'saving'
  timer = window.setTimeout(async () => {
    try {
      const updated = await updateResume(val.resumeId, val, { version: val.meta.version })
      store.setResume(updated)
      store.saveState = 'saved'
    } catch (e: any) {
      store.saveState = e?.response?.status === 409 ? 'conflict' : 'error'
    }
  }, 800)
}, { deep: true })
</script>


