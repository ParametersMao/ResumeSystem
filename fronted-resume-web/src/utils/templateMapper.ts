import type { ResumeSection } from '@/types/resume'
import { normalizeSectionRichText } from './richText'
import { getCanonicalSectionType } from './sectionType'

function clone<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value))
}

export function mergeSectionsFromTemplate(
  templateSections: any[],
  resumeSections: ResumeSection[]
): ResumeSection[] {
  const existingByType = new Map<string, ResumeSection>()
  ;(resumeSections || []).forEach((section) => {
    const typeKey = getCanonicalSectionType(section.type) || section.type
    if (!typeKey) return
    existingByType.set(typeKey, section)
  })

  const merged: ResumeSection[] = []

  templateSections.forEach((tplSection: any, index: number) => {
    if (!tplSection || !tplSection.type) return

    const typeKey = getCanonicalSectionType(tplSection.type) || tplSection.type
    if (!typeKey) return

    const existing = existingByType.get(typeKey)
    const baseId =
      tplSection.id ||
      existing?.id ||
      `${tplSection.type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    const title =
      tplSection.title ??
      tplSection.config?.title ??
      existing?.title ??
      String(typeKey).toUpperCase()

    const visible =
      tplSection.visible !== undefined
        ? tplSection.visible
        : existing?.visible !== undefined
        ? existing.visible
        : true

    const order =
      typeof tplSection.order === 'number'
        ? tplSection.order
        : existing?.order ?? index

    const config = {
      ...(tplSection.config ? clone(tplSection.config) : {}),
      ...(existing?.config ? clone(existing.config) : {})
    }

    const style = {
      ...(tplSection.style ? clone(tplSection.style) : {}),
      ...(existing?.style ? clone(existing.style) : {})
    }

    const sourceItems =
      existing && Array.isArray(existing.items)
        ? clone(existing.items)
        : Array.isArray(tplSection.items)
        ? clone(tplSection.items)
        : []

    const mergedData =
      existing?.data || tplSection.data
        ? {
            ...(tplSection.data ? clone(tplSection.data) : {}),
            ...(existing?.data ? clone(existing.data) : {})
          }
        : undefined

    const normalized = normalizeSectionRichText({
      id: baseId,
      type: typeKey as any,
      title,
      visible,
      order,
      items: sourceItems,
      config,
      style,
      data: mergedData
    } as ResumeSection)

    merged.push({
      id: baseId,
      type: typeKey,
      title,
      visible,
      order,
      items: normalized.items,
      config: normalized.config,
      style: normalized.style,
      ...(mergedData ? { data: mergedData } : {})
    })

    existingByType.delete(typeKey)
  })

  // Append remaining user sections (custom等)
  const remaining = Array.from(existingByType.values())
    .map((section) => normalizeSectionRichText(section))
    .sort((a, b) => (a.order || 0) - (b.order || 0))

  const result = [...merged, ...remaining]
  return result.sort((a, b) => (a.order || 0) - (b.order || 0))
}

export function applyTemplateToResume(
  templateSections: any[] | undefined,
  resumeSections: ResumeSection[]
): ResumeSection[] {
  if (!Array.isArray(templateSections) || templateSections.length === 0) {
    return (resumeSections || []).map((section) => normalizeSectionRichText(section))
  }
  const validTemplateSections = templateSections
    .filter((section) => section && section.type)
    .map((section) => clone(section))

  if (!resumeSections || resumeSections.length <= 1) {
    return validTemplateSections
      .map((tplSection: any, idx: number) => {
        const config = tplSection.config ? clone(tplSection.config) : {}
        const style = tplSection.style ? clone(tplSection.style) : {}
        const items = Array.isArray(tplSection.items) ? clone(tplSection.items) : []
        const data = tplSection.data ? clone(tplSection.data) : undefined
        const canonicalType = getCanonicalSectionType(tplSection.type) || tplSection.type

        const normalized = normalizeSectionRichText({
          id: tplSection.id || `${tplSection.type}-${Date.now()}-${idx}`,
          type: canonicalType as any,
          title: tplSection.title || tplSection.config?.title || canonicalType,
          visible: tplSection.visible !== false,
          order: typeof tplSection.order === 'number' ? tplSection.order : idx,
          items,
          config,
          style,
          data
        } as ResumeSection)

        return {
          id: normalized.id,
          type: canonicalType,
          title: normalized.title,
          visible: normalized.visible,
          order: normalized.order,
          items: normalized.items,
          config: normalized.config,
          style: normalized.style,
          ...(data ? { data } : {})
        }
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  return mergeSectionsFromTemplate(validTemplateSections, resumeSections || [])
}


