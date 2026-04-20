import { computed, ref } from 'vue';
import { resolveTemplateVariant } from '@/core-resume/templates';
const props = defineProps();
const sheetRef = ref(null);
const contactItems = computed(() => {
    const profile = props.document.profile;
    return [
        { label: '电话', value: profile.phone },
        { label: '邮箱', value: profile.email },
        { label: '性别', value: profile.gender },
        { label: '年龄', value: profile.age },
        { label: '经验', value: profile.yearsOfExperience },
        { label: '主页', value: profile.site },
    ].filter((item) => item.value);
});
const templateVariant = computed(() => resolveTemplateVariant(props.document));
const visibleSections = computed(() => props.document.sections.filter((section) => section.visible));
const skillsSection = computed(() => visibleSections.value.find((section) => section.type === 'skills'));
const summarySection = computed(() => visibleSections.value.find((section) => section.type === 'summary'));
const mainSections = computed(() => visibleSections.value.filter((section) => section.type !== 'skills'));
const featuredSections = computed(() => visibleSections.value.filter((section) => ['experience', 'projects', 'internship'].includes(section.type)));
const supportSections = computed(() => visibleSections.value.filter((section) => !['experience', 'projects', 'internship', 'skills', 'summary'].includes(section.type)));
const sheetStyle = computed(() => {
    const theme = props.document.theme;
    return {
        '--resume-primary': theme.primaryColor,
        '--resume-font': theme.fontFamily,
        '--resume-heading-font': theme.headingFontFamily,
        '--resume-section-spacing': `${theme.sectionSpacing}px`,
        '--resume-item-spacing': `${theme.itemSpacing}px`,
        '--resume-font-size': `${theme.fontSize}px`,
        '--resume-line-height': String(theme.lineHeight),
    };
});
function getPrimaryText(type, item) {
    switch (type) {
        case 'intention':
            return String(item.intention || '求职意向');
        case 'education':
            return String(item.school || '学校名称');
        case 'experience':
        case 'internship':
            return String(item.company || '公司名称');
        case 'projects':
            return String(item.name || '项目名称');
        case 'campus':
            return String(item.org || '校园组织');
        case 'skills':
            return String(item.name || '');
        case 'awards':
            return String(item.name || '奖项名称');
        case 'summary':
            return '个人简介';
        case 'hobbies':
            return String(item.text || '兴趣爱好');
        case 'custom':
            return String(item.name || '自定义模块');
        default:
            return '';
    }
}
function getSecondaryText(type, item) {
    switch (type) {
        case 'education':
            return String(item.degree || item.major || '');
        case 'experience':
        case 'internship':
        case 'projects':
        case 'campus':
            return String(item.role || '');
        case 'awards':
            return String(item.org || '');
        default:
            return '';
    }
}
function getDescription(item) {
    return String(item.desc || item.text || '');
}
function formatDuration(value) {
    if (!value || typeof value !== 'object') {
        return '';
    }
    const duration = value;
    return [duration.start, duration.end].filter(Boolean).join(' - ');
}
const __VLS_exposed = {
    sheetRef,
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['resume-sheet']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-sheet']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-sheet']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-sheet']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-sheet']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-timeline']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-sheet']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-spotlight']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-column']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-role']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-block']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-block']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-contact-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-contact-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-contact-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-section']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-section']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-section']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-section']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-marker']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-card-top']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-card-top']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-section']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-card-head']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-card-head']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['section-item']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-block']} */ ;
/** @type {__VLS_StyleScopedClasses['item-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['item-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-block']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-ats']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-header']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-ats']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-name']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-ats']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-role']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-ats']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-ats']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-ats']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-ats']} */ ;
/** @type {__VLS_StyleScopedClasses['section-item']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-ats']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-block']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-executive']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-header']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-executive']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-name']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-executive']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-executive']} */ ;
/** @type {__VLS_StyleScopedClasses['section-item']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-executive']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-block']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-compact']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-header']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-compact']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-name']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-compact']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-section']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-section']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-compact']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-compact']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-compact']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-compact']} */ ;
/** @type {__VLS_StyleScopedClasses['section-items']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-compact']} */ ;
/** @type {__VLS_StyleScopedClasses['section-item']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-compact']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-block']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-editorial']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-header']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-editorial']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-role']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-editorial']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-editorial']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-section']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-editorial']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-section']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-editorial']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-section']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-editorial']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-editorial']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-editorial']} */ ;
/** @type {__VLS_StyleScopedClasses['section-item']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-editorial']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-block']} */ ;
/** @type {__VLS_StyleScopedClasses['core-preview-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-sheet']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-header']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-card-top']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-card-head']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-contact-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-body']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-sheet']} */ ;
/** @type {__VLS_StyleScopedClasses['variant-sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-column']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-main']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-side']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-main']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "core-preview-shell" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ref: "sheetRef",
    ...{ class: "resume-sheet" },
    ...{ class: (`variant-${__VLS_ctx.templateVariant}`) },
    ...{ style: (__VLS_ctx.sheetStyle) },
});
/** @type {typeof __VLS_ctx.sheetRef} */ ;
if (__VLS_ctx.templateVariant === 'sidebar') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sidebar-layout" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
        ...{ class: "sidebar-column" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sidebar-identity" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
        ...{ class: "resume-name" },
    });
    (__VLS_ctx.document.profile.name || '张三');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "resume-role" },
    });
    (__VLS_ctx.document.profile.title || '前端工程师');
    if (__VLS_ctx.contactItems.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
            ...{ class: "sidebar-block" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "sidebar-meta-list" },
        });
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.contactItems))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                key: (item.label),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            (item.label);
            (item.value);
        }
    }
    if (__VLS_ctx.skillsSection) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
            ...{ class: "sidebar-block" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
        (__VLS_ctx.skillsSection.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "skills-list" },
        });
        for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.skillsSection.items))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                key: (`${__VLS_ctx.skillsSection.id}-${index}`),
                ...{ class: "skill-pill" },
            });
            (item.name || item.text);
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
        ...{ class: "sidebar-main" },
    });
    for (const [section] of __VLS_getVForSourceType((__VLS_ctx.mainSections))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
            key: (section.id),
            ...{ class: "resume-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "section-heading" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "section-heading-bar" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
        (section.title);
        if (section.type === 'summary') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "section-items" },
            });
            for (const [item, index] of __VLS_getVForSourceType((section.items))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                    key: (`${section.id}-${index}`),
                    ...{ class: "item-description summary-block" },
                });
                (__VLS_ctx.getDescription(item));
            }
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "section-items" },
            });
            for (const [item, index] of __VLS_getVForSourceType((section.items))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
                    key: (`${section.id}-${index}`),
                    ...{ class: "section-item" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "item-heading" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
                (__VLS_ctx.getPrimaryText(section.type, item));
                if (__VLS_ctx.getSecondaryText(section.type, item)) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                    (__VLS_ctx.getSecondaryText(section.type, item));
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "item-subheading" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (__VLS_ctx.formatDuration(item.duration) || item.date);
                if (__VLS_ctx.getDescription(item)) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                        ...{ class: "item-description" },
                    });
                    (__VLS_ctx.getDescription(item));
                }
            }
        }
    }
}
else if (__VLS_ctx.templateVariant === 'timeline') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
        ...{ class: "timeline-hero" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "timeline-hero-copy" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "eyebrow" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
        ...{ class: "resume-name" },
    });
    (__VLS_ctx.document.profile.name || '张三');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "resume-role" },
    });
    (__VLS_ctx.document.profile.title || '前端工程师');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "timeline-contact-grid" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.contactItems))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            key: (item.label),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (item.label);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.em, __VLS_intrinsicElements.em)({});
        (item.value);
    }
    for (const [section] of __VLS_getVForSourceType((__VLS_ctx.visibleSections))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
            key: (section.id),
            ...{ class: "timeline-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "timeline-marker" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "timeline-dot" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
        (section.title);
        if (section.type === 'skills') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "timeline-skills" },
            });
            for (const [item, index] of __VLS_getVForSourceType((section.items))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    key: (`${section.id}-${index}`),
                    ...{ class: "timeline-skill" },
                });
                (item.name || item.text);
            }
        }
        else if (section.type === 'summary') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "section-items" },
            });
            for (const [item, index] of __VLS_getVForSourceType((section.items))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                    key: (`${section.id}-${index}`),
                    ...{ class: "item-description summary-block timeline-summary" },
                });
                (__VLS_ctx.getDescription(item));
            }
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "timeline-list" },
            });
            for (const [item, index] of __VLS_getVForSourceType((section.items))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
                    key: (`${section.id}-${index}`),
                    ...{ class: "timeline-card" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "timeline-card-top" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
                (__VLS_ctx.getPrimaryText(section.type, item));
                if (__VLS_ctx.getSecondaryText(section.type, item)) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
                    (__VLS_ctx.getSecondaryText(section.type, item));
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "timeline-date" },
                });
                (__VLS_ctx.formatDuration(item.duration) || item.date);
                if (__VLS_ctx.getDescription(item)) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                        ...{ class: "item-description" },
                    });
                    (__VLS_ctx.getDescription(item));
                }
            }
        }
    }
}
else if (__VLS_ctx.templateVariant === 'spotlight') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
        ...{ class: "spotlight-hero" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "spotlight-copy" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "spotlight-kicker" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
        ...{ class: "resume-name" },
    });
    (__VLS_ctx.document.profile.name || '张三');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "resume-role" },
    });
    (__VLS_ctx.document.profile.title || '前端工程师');
    if (__VLS_ctx.summarySection?.items?.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "spotlight-summary" },
        });
        (__VLS_ctx.getDescription(__VLS_ctx.summarySection.items[0]));
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "spotlight-meta-card" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.contactItems))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (item.label),
            ...{ class: "spotlight-meta-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (item.label);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (item.value);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "spotlight-body" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
        ...{ class: "spotlight-side" },
    });
    if (__VLS_ctx.skillsSection) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
            ...{ class: "spotlight-panel" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "section-heading" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "section-heading-bar" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
        (__VLS_ctx.skillsSection.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "spotlight-skill-grid" },
        });
        for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.skillsSection.items))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                key: (`${__VLS_ctx.skillsSection.id}-${index}`),
                ...{ class: "spotlight-skill" },
            });
            (item.name || item.text);
        }
    }
    for (const [section] of __VLS_getVForSourceType((__VLS_ctx.supportSections))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
            key: (section.id),
            ...{ class: "spotlight-panel" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "section-heading" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "section-heading-bar" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
        (section.title);
        if (section.type === 'summary') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "section-items" },
            });
            for (const [item, index] of __VLS_getVForSourceType((section.items))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                    key: (`${section.id}-${index}`),
                    ...{ class: "item-description summary-block" },
                });
                (__VLS_ctx.getDescription(item));
            }
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "section-items" },
            });
            for (const [item, index] of __VLS_getVForSourceType((section.items))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
                    key: (`${section.id}-${index}`),
                    ...{ class: "section-item compact-item" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "item-heading" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
                (__VLS_ctx.getPrimaryText(section.type, item));
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "item-subheading" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (__VLS_ctx.getSecondaryText(section.type, item));
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (__VLS_ctx.formatDuration(item.duration) || item.date);
                if (__VLS_ctx.getDescription(item)) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                        ...{ class: "item-description" },
                    });
                    (__VLS_ctx.getDescription(item));
                }
            }
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
        ...{ class: "spotlight-main" },
    });
    for (const [section] of __VLS_getVForSourceType((__VLS_ctx.featuredSections))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
            key: (section.id),
            ...{ class: "resume-section spotlight-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "section-heading" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "section-heading-bar" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
        (section.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "section-items" },
        });
        for (const [item, index] of __VLS_getVForSourceType((section.items))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
                key: (`${section.id}-${index}`),
                ...{ class: "spotlight-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "spotlight-card-head" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
            (__VLS_ctx.getPrimaryText(section.type, item));
            if (__VLS_ctx.getSecondaryText(section.type, item)) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
                (__VLS_ctx.getSecondaryText(section.type, item));
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "spotlight-date" },
            });
            (__VLS_ctx.formatDuration(item.duration) || item.date);
            if (__VLS_ctx.getDescription(item)) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                    ...{ class: "item-description" },
                });
                (__VLS_ctx.getDescription(item));
            }
        }
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
        ...{ class: "resume-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
        ...{ class: "resume-name" },
    });
    (__VLS_ctx.document.profile.name || '张三');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "resume-role" },
    });
    (__VLS_ctx.document.profile.title || '前端工程师');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "resume-meta" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.contactItems))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            key: (item.label),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
        (item.label);
        (item.value);
    }
    for (const [section] of __VLS_getVForSourceType((__VLS_ctx.visibleSections))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
            key: (section.id),
            ...{ class: "resume-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "section-heading" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "section-heading-bar" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
        (section.title);
        if (section.type === 'skills') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "skills-list" },
            });
            for (const [item, index] of __VLS_getVForSourceType((section.items))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    key: (`${section.id}-${index}`),
                    ...{ class: "skill-pill" },
                });
                (item.name || item.text);
            }
        }
        else if (section.type === 'summary') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "section-items" },
            });
            for (const [item, index] of __VLS_getVForSourceType((section.items))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                    key: (`${section.id}-${index}`),
                    ...{ class: "item-description summary-block" },
                });
                (__VLS_ctx.getDescription(item));
            }
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "section-items" },
            });
            for (const [item, index] of __VLS_getVForSourceType((section.items))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
                    key: (`${section.id}-${index}`),
                    ...{ class: "section-item" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "item-heading" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
                (__VLS_ctx.getPrimaryText(section.type, item));
                if (__VLS_ctx.getSecondaryText(section.type, item)) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                    (__VLS_ctx.getSecondaryText(section.type, item));
                }
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "item-subheading" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                (__VLS_ctx.formatDuration(item.duration) || item.date);
                if (__VLS_ctx.getDescription(item)) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                        ...{ class: "item-description" },
                    });
                    (__VLS_ctx.getDescription(item));
                }
            }
        }
    }
}
/** @type {__VLS_StyleScopedClasses['core-preview-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-sheet']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-column']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-identity']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-name']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-role']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-block']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-meta-list']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-block']} */ ;
/** @type {__VLS_StyleScopedClasses['skills-list']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-main']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['section-items']} */ ;
/** @type {__VLS_StyleScopedClasses['item-description']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-block']} */ ;
/** @type {__VLS_StyleScopedClasses['section-items']} */ ;
/** @type {__VLS_StyleScopedClasses['section-item']} */ ;
/** @type {__VLS_StyleScopedClasses['item-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['item-subheading']} */ ;
/** @type {__VLS_StyleScopedClasses['item-description']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-hero-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-name']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-role']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-contact-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-section']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-marker']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-skills']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-skill']} */ ;
/** @type {__VLS_StyleScopedClasses['section-items']} */ ;
/** @type {__VLS_StyleScopedClasses['item-description']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-block']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-list']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-card']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-card-top']} */ ;
/** @type {__VLS_StyleScopedClasses['timeline-date']} */ ;
/** @type {__VLS_StyleScopedClasses['item-description']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-name']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-role']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-body']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-side']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-skill-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-skill']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['section-items']} */ ;
/** @type {__VLS_StyleScopedClasses['item-description']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-block']} */ ;
/** @type {__VLS_StyleScopedClasses['section-items']} */ ;
/** @type {__VLS_StyleScopedClasses['section-item']} */ ;
/** @type {__VLS_StyleScopedClasses['compact-item']} */ ;
/** @type {__VLS_StyleScopedClasses['item-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['item-subheading']} */ ;
/** @type {__VLS_StyleScopedClasses['item-description']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-main']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-section']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['section-items']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-card']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-card-head']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-date']} */ ;
/** @type {__VLS_StyleScopedClasses['item-description']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-header']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-name']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-role']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['resume-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['section-heading-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['skills-list']} */ ;
/** @type {__VLS_StyleScopedClasses['skill-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['section-items']} */ ;
/** @type {__VLS_StyleScopedClasses['item-description']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-block']} */ ;
/** @type {__VLS_StyleScopedClasses['section-items']} */ ;
/** @type {__VLS_StyleScopedClasses['section-item']} */ ;
/** @type {__VLS_StyleScopedClasses['item-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['item-subheading']} */ ;
/** @type {__VLS_StyleScopedClasses['item-description']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            sheetRef: sheetRef,
            contactItems: contactItems,
            templateVariant: templateVariant,
            visibleSections: visibleSections,
            skillsSection: skillsSection,
            summarySection: summarySection,
            mainSections: mainSections,
            featuredSections: featuredSections,
            supportSections: supportSections,
            sheetStyle: sheetStyle,
            getPrimaryText: getPrimaryText,
            getSecondaryText: getSecondaryText,
            getDescription: getDescription,
            formatDuration: formatDuration,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
