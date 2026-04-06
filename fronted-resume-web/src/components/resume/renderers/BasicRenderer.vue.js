import { computed, inject } from 'vue';
import { normalizeRichTextValue } from '@/utils/richText';
const props = defineProps();
const injectedResumeData = inject('resumeData', {});
const sectionData = computed(() => props.section?.data ?? {});
const basic = computed(() => sectionData.value.basic ?? (injectedResumeData?.profile?.basic ?? {}));
const contactsMap = computed(() => basic.value.contacts ?? (injectedResumeData?.profile?.basic?.contacts ?? {}));
const name = computed(() => basic.value.name ?? '');
const title = computed(() => basic.value.title ?? '');
const avatar = computed(() => basic.value.avatar ?? '');
const avatarUrl = computed(() => {
    const raw = String(avatar.value || '');
    const cleaned = raw.replace(/[`"']/g, '').trim();
    return cleaned;
});
const contacts = computed(() => contactsMap.value || {});
const bannerConfig = computed(() => sectionData.value.banner ?? {});
const bannerTag = computed(() => bannerConfig.value.tag ?? sectionData.value.tag ?? '');
const bannerSubtitle = computed(() => bannerConfig.value.subtitle ?? bannerConfig.value.description ?? '');
function resolvePath(path) {
    if (!path)
        return undefined;
    const sources = {
        basic: basic.value,
        contacts: contactsMap.value,
        data: sectionData.value
    };
    const segments = path.split('.').filter(Boolean);
    if (!segments.length)
        return undefined;
    let current;
    if (segments[0] in sources) {
        current = sources[segments[0]];
        segments.shift();
    }
    else {
        current = basic.value;
    }
    for (const segment of segments) {
        if (current == null)
            return undefined;
        current = current[segment];
    }
    return current;
}
const fallbackMeta = computed(() => {
    const items = [];
    if (basic.value.gender) {
        items.push({ label: '性别', value: basic.value.gender });
    }
    if (basic.value.age) {
        items.push({ label: '年龄', value: basic.value.age });
    }
    if (basic.value.yearsOfExperience) {
        items.push({ label: '工作经验', value: basic.value.yearsOfExperience });
    }
    const location = resolvePath('contacts.site') ?? basic.value.location;
    if (location) {
        items.push({ label: '所在地', value: location });
    }
    return items;
});
const metaItems = computed(() => {
    const raw = sectionData.value.meta;
    if (Array.isArray(raw) && raw.length) {
        return raw
            .map((item) => {
            const value = item.value ?? resolvePath(item.field ?? item.key);
            if (!item.label && !value)
                return null;
            return {
                label: item.label ?? '',
                value,
                icon: item.icon ?? '',
                type: item.type ?? ''
            };
        })
            .filter(Boolean);
    }
    return fallbackMeta.value;
});
const contactItems = computed(() => {
    const raw = sectionData.value.contacts;
    if (Array.isArray(raw) && raw.length) {
        return raw
            .map((item) => {
            const value = item.value ?? resolvePath(item.field ?? item.key);
            if (!item.label && !value)
                return null;
            return {
                label: item.label ?? '',
                value,
                icon: item.icon ?? '',
                type: item.type ?? ''
            };
        })
            .filter(Boolean);
    }
    const contacts = contactsMap.value;
    const list = [];
    if (contacts.phone)
        list.push({ label: '电话', value: contacts.phone });
    if (contacts.email)
        list.push({ label: '邮箱', value: contacts.email });
    if (contacts.site)
        list.push({ label: '个人网站', value: contacts.site });
    return list;
});
const actions = computed(() => {
    const source = bannerConfig.value.actions ?? sectionData.value.actions ?? [];
    if (!Array.isArray(source))
        return [];
    return source
        .map((action) => action && action.label
        ? {
            label: action.label,
            href: action.href,
            target: action.target,
            type: action.type
        }
        : null)
        .filter(Boolean);
});
function isIconUrl(icon) {
    const value = getIconValue(icon);
    return (value.startsWith('http') ||
        value.startsWith('data:') ||
        /\.(svg|png|jpe?g|gif|webp)$/i.test(value));
}
function normalizeIconUrl(icon) {
    return getIconValue(icon);
}
function getIconValue(icon) {
    if (!icon)
        return '';
    if (typeof icon === 'string')
        return icon.trim();
    return String(icon.url || icon.value || icon.text || '').trim();
}
const summaryContent = computed(() => {
    let raw = sectionData.value.summary ??
        sectionData.value.description ??
        bannerConfig.value.summary ??
        basic.value.summary;
    if (!raw && typeof sectionData.value.basic?.summary === 'string') {
        raw = sectionData.value.basic.summary;
    }
    if (!raw)
        return null;
    const normalized = normalizeRichTextValue(raw);
    if (normalized.html) {
        return { html: normalized.html, text: normalized.text };
    }
    if (normalized.text) {
        return { text: normalized.text };
    }
    return null;
});
const showBanner = computed(() => {
    return Boolean(avatarUrl.value ||
        name.value ||
        title.value ||
        bannerTag.value ||
        bannerSubtitle.value ||
        metaItems.value.length ||
        contactItems.value.length ||
        actions.value.length);
});
// 根据样式配置判断是否使用卡片布局
const useCardLayout = computed(() => {
    const custom = props.styleConfig?.custom || {};
    return Boolean(custom['.basic-card']);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['basic-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "basic-section basic-renderer" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "basic-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "basic-container" },
});
if (__VLS_ctx.useCardLayout) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "basic-card" },
    });
    if (__VLS_ctx.avatarUrl) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            src: (__VLS_ctx.avatarUrl),
            ...{ class: "basic-avatar" },
            alt: (`${__VLS_ctx.name || '头像'}`),
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "basic-card-main" },
    });
    if (__VLS_ctx.name) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "basic-name" },
        });
        (__VLS_ctx.name);
    }
    if (__VLS_ctx.title) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "basic-intent" },
        });
        (__VLS_ctx.title);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "basic-info-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.basic.gender);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.basic.age);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.basic.yearsOfExperience);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.contacts.site);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.contacts.phone);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.contacts.email);
}
else if (__VLS_ctx.showBanner) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "basic-banner" },
    });
    if (__VLS_ctx.avatarUrl) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "basic-avatar-wrapper" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            src: (__VLS_ctx.avatarUrl),
            ...{ class: "basic-avatar" },
            alt: (`${__VLS_ctx.name || '头像'}`),
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "basic-banner-main" },
    });
    if (__VLS_ctx.bannerTag) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "basic-tag" },
        });
        (__VLS_ctx.bannerTag);
    }
    if (__VLS_ctx.name) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "basic-name" },
        });
        (__VLS_ctx.name);
    }
    if (__VLS_ctx.title) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "basic-title" },
        });
        (__VLS_ctx.title);
    }
    if (__VLS_ctx.bannerSubtitle) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "basic-subtitle" },
        });
        (__VLS_ctx.bannerSubtitle);
    }
    if (__VLS_ctx.metaItems.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "basic-meta-list" },
        });
        for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.metaItems))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (`meta-${index}`),
                ...{ class: "basic-meta-item" },
            });
            if (__VLS_ctx.isIconUrl(item.icon)) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                    ...{ class: "meta-icon-image" },
                    src: (__VLS_ctx.normalizeIconUrl(item.icon)),
                    alt: "",
                });
            }
            else if (item.icon) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "meta-icon" },
                });
                (item.icon);
            }
            if (item.label) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "meta-label" },
                });
                (item.label);
            }
            if (item.value) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "meta-value" },
                });
                (item.value);
            }
        }
    }
    if (__VLS_ctx.contactItems.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "basic-contact-list" },
        });
        for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.contactItems))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (`contact-${index}`),
                ...{ class: "basic-contact-item" },
            });
            if (__VLS_ctx.isIconUrl(item.icon)) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                    ...{ class: "contact-icon-image" },
                    src: (__VLS_ctx.normalizeIconUrl(item.icon)),
                    alt: "",
                });
            }
            else if (item.icon) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "contact-icon" },
                });
                (item.icon);
            }
            if (item.label) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "contact-label" },
                });
                (item.label);
            }
            if (item.value) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "contact-value" },
                });
                (item.value);
            }
        }
    }
    if (__VLS_ctx.actions.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "basic-actions" },
        });
        for (const [action, index] of __VLS_getVForSourceType((__VLS_ctx.actions))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
                key: (`action-${index}`),
                ...{ class: "basic-action" },
                ...{ class: ({
                        'basic-action--primary': action.type === 'primary',
                        'basic-action--secondary': action.type === 'secondary'
                    }) },
                href: (action.href || '#'),
                target: (action.target || '_self'),
            });
            (action.label);
        }
    }
}
if (__VLS_ctx.summaryContent) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "basic-summary" },
    });
    if (__VLS_ctx.summaryContent.html) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.summaryContent.html) }, null, null);
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (__VLS_ctx.summaryContent.text);
    }
}
/** @type {__VLS_StyleScopedClasses['basic-section']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-renderer']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-content']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-container']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-card']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-card-main']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-name']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-intent']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-info-row']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-avatar-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-banner-main']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-name']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-title']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-meta-list']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-meta-item']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-icon-image']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-label']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-value']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-contact-list']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-contact-item']} */ ;
/** @type {__VLS_StyleScopedClasses['contact-icon-image']} */ ;
/** @type {__VLS_StyleScopedClasses['contact-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['contact-label']} */ ;
/** @type {__VLS_StyleScopedClasses['contact-value']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-action']} */ ;
/** @type {__VLS_StyleScopedClasses['basic-summary']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            basic: basic,
            name: name,
            title: title,
            avatarUrl: avatarUrl,
            contacts: contacts,
            bannerTag: bannerTag,
            bannerSubtitle: bannerSubtitle,
            metaItems: metaItems,
            contactItems: contactItems,
            actions: actions,
            isIconUrl: isIconUrl,
            normalizeIconUrl: normalizeIconUrl,
            summaryContent: summaryContent,
            showBanner: showBanner,
            useCardLayout: useCardLayout,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
