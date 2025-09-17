import { defineStore } from 'pinia'

export interface ResumeStyle {
  themeColor: string
  fontFamily: string
  fontSize: number
  lineHeight: number
  page: { margin: [number, number, number, number]; columns: 1 | 2 }
}

export interface ResumeMeta {
  title: string
  subtitle?: string
  updatedAt: number
  version: number
}

export interface WorkItem { type: 'work'; company: string; role: string; start: string; end?: string; highlights: string[]; techTags?: string[]; location?: string }
export interface ProjectItem { type: 'project'; name: string; role?: string; start?: string; end?: string; highlights: string[]; techTags?: string[]; repoUrl?: string }
export interface EducationItem { type: 'education'; school: string; degree?: string; major?: string; start?: string; end?: string; highlights?: string[] }
export interface SkillItem { type: 'skill'; name: string; level?: 1|2|3|4|5; tags?: string[] }
export interface AwardItem { type: 'award'; title: string; by?: string; date?: string; highlights?: string[] }
export interface SummaryItem { type: 'summary'; content: string }

export type SectionItem = WorkItem | ProjectItem | EducationItem | SkillItem | AwardItem | SummaryItem

export interface ResumeSection { id: string; type: string; title: string; visible: boolean; items: SectionItem[] }

export interface Resume {
  resumeId: string
  userId: string
  templateId: string
  meta: ResumeMeta
  style: ResumeStyle
  sections: ResumeSection[]
}

function now(): number { return Date.now() }

export const useResumeStore = defineStore('resume', {
  state: () => ({
    resume: null as Resume | null,
    lastSavedSnapshot: null as Resume | null,
    saveState: 'idle' as 'idle' | 'saving' | 'saved' | 'conflict' | 'error'
  }),
  actions: {
    setResume(resume: Resume) {
      this.resume = resume
      this.lastSavedSnapshot = JSON.parse(JSON.stringify(resume))
    },
    applyPatch(mutator: (draft: Resume) => void) {
      if (!this.resume) return
      const draft: Resume = JSON.parse(JSON.stringify(this.resume))
      mutator(draft)
      draft.meta.updatedAt = now()
      this.resume = draft
    }
  }
})


