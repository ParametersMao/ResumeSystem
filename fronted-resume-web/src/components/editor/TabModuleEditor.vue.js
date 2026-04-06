import { ref, watch } from 'vue';
import { CircleCheck, MagicStick } from '@element-plus/icons-vue';
// 导入各个模块的编辑器组件
import BasicInfoEditor from './modules/BasicInfoEditor.vue';
import IntentionEditor from './modules/IntentionEditor.vue';
import EducationEditor from './modules/EducationEditor.vue';
import ExperienceEditor from './modules/ExperienceEditor.vue';
import ProjectsEditor from './modules/ProjectsEditor.vue';
import InternshipEditor from './modules/InternshipEditor.vue';
import CampusEditor from './modules/CampusEditor.vue';
import SkillsEditor from './modules/SkillsEditor.vue';
import AwardsEditor from './modules/AwardsEditor.vue';
import SummaryEditor from './modules/SummaryEditor.vue';
import HobbiesEditor from './modules/HobbiesEditor.vue';
import CustomEditor from './modules/CustomEditor.vue';
const props = defineProps();
const emit = defineEmits(['update:resumeData', 'change', 'ai-optimize']);
// 当前激活的模块
const activeModule = ref('basic');
// 本地数据副本
const localData = ref({
    basic: {},
    sections: []
});
// 所有可用模块
const allModules = [
    { type: 'basic', label: '基本信息', required: true },
    { type: 'intention', label: '求职意向', required: false },
    { type: 'education', label: '教育背景', required: false },
    { type: 'experience', label: '工作经验', required: false },
    { type: 'projects', label: '项目经验', required: false },
    { type: 'internship', label: '实习经验', required: false },
    { type: 'campus', label: '校园经历', required: false },
    { type: 'skills', label: '技能特长', required: false },
    { type: 'awards', label: '荣誉证书', required: false },
    { type: 'summary', label: '自我评价', required: false },
    { type: 'hobbies', label: '兴趣爱好', required: false },
    { type: 'custom', label: '自定义', required: false }
];
// 初始化数据
watch(() => props.resumeData, (newData) => {
    if (newData) {
        localData.value = JSON.parse(JSON.stringify(newData));
        // 确保所有模块都有对应的 section
        initializeSections();
    }
}, { immediate: true, deep: true });
// 初始化所有模块的section
function initializeSections() {
    allModules.forEach(module => {
        if (module.type === 'basic')
            return; // 基本信息不需要 section
        const existingSection = localData.value.sections.find((s) => s.type === module.type);
        if (!existingSection) {
            localData.value.sections.push({
                id: `${module.type}-${Date.now()}`,
                type: module.type,
                title: module.label,
                visible: false, // 默认禁用
                order: localData.value.sections.length,
                items: [],
                config: {},
                data: {}
            });
        }
    });
}
// 获取指定类型的 section 数据
function getSectionData(type) {
    let section = localData.value.sections.find((s) => s.type === type);
    if (!section) {
        // 如果不存在，创建一个
        section = {
            id: `${type}-${Date.now()}`,
            type: type,
            title: allModules.find(m => m.type === type)?.label || type,
            visible: false,
            order: localData.value.sections.length,
            items: [],
            config: {},
            data: {}
        };
        localData.value.sections.push(section);
    }
    return section;
}
// 检查模块是否启用
function isModuleEnabled(type) {
    if (type === 'basic')
        return true; // 基本信息始终启用
    const section = localData.value.sections.find((s) => s.type === type);
    return section?.visible || false;
}
// 切换模块
function switchModule(type) {
    activeModule.value = type;
}
// 启用/禁用模块
function toggleModule() {
    const type = activeModule.value;
    if (type === 'basic')
        return; // 基本信息不能禁用
    const section = getSectionData(type);
    section.visible = !section.visible;
    emitChange();
}
// 发送变更事件
function emitChange() {
    emit('update:resumeData', localData.value);
    emit('change', localData.value);
}
// 触发 AI 优化
function emitAiOptimize() {
    emit('ai-optimize', {
        moduleType: activeModule.value,
        data: activeModule.value === 'basic' ? localData.value.basic : getSectionData(activeModule.value)
    });
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tab-module-editor" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-tabs" },
});
for (const [module] of __VLS_getVForSourceType((__VLS_ctx.allModules))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.switchModule(module.type);
            } },
        key: (module.type),
        ...{ class: "tab-item" },
        ...{ class: ({
                'active': __VLS_ctx.activeModule === module.type,
                'enabled': __VLS_ctx.isModuleEnabled(module.type),
                'disabled': !__VLS_ctx.isModuleEnabled(module.type)
            }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "tab-name" },
    });
    (module.label);
    if (__VLS_ctx.isModuleEnabled(module.type)) {
        const __VLS_0 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
            ...{ class: "check-icon" },
        }));
        const __VLS_2 = __VLS_1({
            ...{ class: "check-icon" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        __VLS_3.slots.default;
        const __VLS_4 = {}.CircleCheck;
        /** @type {[typeof __VLS_components.CircleCheck, ]} */ ;
        // @ts-ignore
        const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
        const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
        var __VLS_3;
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-content" },
});
if (__VLS_ctx.activeModule === 'basic') {
    /** @type {[typeof BasicInfoEditor, ]} */ ;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(BasicInfoEditor, new BasicInfoEditor({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.localData.basic),
    }));
    const __VLS_9 = __VLS_8({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.localData.basic),
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    let __VLS_11;
    let __VLS_12;
    let __VLS_13;
    const __VLS_14 = {
        onChange: (__VLS_ctx.emitChange)
    };
    var __VLS_10;
}
if (__VLS_ctx.activeModule === 'intention') {
    /** @type {[typeof IntentionEditor, ]} */ ;
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(IntentionEditor, new IntentionEditor({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.getSectionData('intention')),
    }));
    const __VLS_16 = __VLS_15({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.getSectionData('intention')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    let __VLS_18;
    let __VLS_19;
    let __VLS_20;
    const __VLS_21 = {
        onChange: (__VLS_ctx.emitChange)
    };
    var __VLS_17;
}
if (__VLS_ctx.activeModule === 'education') {
    /** @type {[typeof EducationEditor, ]} */ ;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(EducationEditor, new EducationEditor({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.getSectionData('education')),
    }));
    const __VLS_23 = __VLS_22({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.getSectionData('education')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    let __VLS_25;
    let __VLS_26;
    let __VLS_27;
    const __VLS_28 = {
        onChange: (__VLS_ctx.emitChange)
    };
    var __VLS_24;
}
if (__VLS_ctx.activeModule === 'experience') {
    /** @type {[typeof ExperienceEditor, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(ExperienceEditor, new ExperienceEditor({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.getSectionData('experience')),
    }));
    const __VLS_30 = __VLS_29({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.getSectionData('experience')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    let __VLS_32;
    let __VLS_33;
    let __VLS_34;
    const __VLS_35 = {
        onChange: (__VLS_ctx.emitChange)
    };
    var __VLS_31;
}
if (__VLS_ctx.activeModule === 'projects') {
    /** @type {[typeof ProjectsEditor, ]} */ ;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent(ProjectsEditor, new ProjectsEditor({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.getSectionData('projects')),
    }));
    const __VLS_37 = __VLS_36({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.getSectionData('projects')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    let __VLS_39;
    let __VLS_40;
    let __VLS_41;
    const __VLS_42 = {
        onChange: (__VLS_ctx.emitChange)
    };
    var __VLS_38;
}
if (__VLS_ctx.activeModule === 'internship') {
    /** @type {[typeof InternshipEditor, ]} */ ;
    // @ts-ignore
    const __VLS_43 = __VLS_asFunctionalComponent(InternshipEditor, new InternshipEditor({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.getSectionData('internship')),
    }));
    const __VLS_44 = __VLS_43({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.getSectionData('internship')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_43));
    let __VLS_46;
    let __VLS_47;
    let __VLS_48;
    const __VLS_49 = {
        onChange: (__VLS_ctx.emitChange)
    };
    var __VLS_45;
}
if (__VLS_ctx.activeModule === 'campus') {
    /** @type {[typeof CampusEditor, ]} */ ;
    // @ts-ignore
    const __VLS_50 = __VLS_asFunctionalComponent(CampusEditor, new CampusEditor({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.getSectionData('campus')),
    }));
    const __VLS_51 = __VLS_50({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.getSectionData('campus')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_50));
    let __VLS_53;
    let __VLS_54;
    let __VLS_55;
    const __VLS_56 = {
        onChange: (__VLS_ctx.emitChange)
    };
    var __VLS_52;
}
if (__VLS_ctx.activeModule === 'skills') {
    /** @type {[typeof SkillsEditor, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(SkillsEditor, new SkillsEditor({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.getSectionData('skills')),
    }));
    const __VLS_58 = __VLS_57({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.getSectionData('skills')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    let __VLS_60;
    let __VLS_61;
    let __VLS_62;
    const __VLS_63 = {
        onChange: (__VLS_ctx.emitChange)
    };
    var __VLS_59;
}
if (__VLS_ctx.activeModule === 'awards') {
    /** @type {[typeof AwardsEditor, ]} */ ;
    // @ts-ignore
    const __VLS_64 = __VLS_asFunctionalComponent(AwardsEditor, new AwardsEditor({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.getSectionData('awards')),
    }));
    const __VLS_65 = __VLS_64({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.getSectionData('awards')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_64));
    let __VLS_67;
    let __VLS_68;
    let __VLS_69;
    const __VLS_70 = {
        onChange: (__VLS_ctx.emitChange)
    };
    var __VLS_66;
}
if (__VLS_ctx.activeModule === 'summary') {
    /** @type {[typeof SummaryEditor, ]} */ ;
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent(SummaryEditor, new SummaryEditor({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.getSectionData('summary')),
    }));
    const __VLS_72 = __VLS_71({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.getSectionData('summary')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    let __VLS_74;
    let __VLS_75;
    let __VLS_76;
    const __VLS_77 = {
        onChange: (__VLS_ctx.emitChange)
    };
    var __VLS_73;
}
if (__VLS_ctx.activeModule === 'hobbies') {
    /** @type {[typeof HobbiesEditor, ]} */ ;
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent(HobbiesEditor, new HobbiesEditor({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.getSectionData('hobbies')),
    }));
    const __VLS_79 = __VLS_78({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.getSectionData('hobbies')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_78));
    let __VLS_81;
    let __VLS_82;
    let __VLS_83;
    const __VLS_84 = {
        onChange: (__VLS_ctx.emitChange)
    };
    var __VLS_80;
}
if (__VLS_ctx.activeModule === 'custom') {
    /** @type {[typeof CustomEditor, ]} */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(CustomEditor, new CustomEditor({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.getSectionData('custom')),
    }));
    const __VLS_86 = __VLS_85({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.getSectionData('custom')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    let __VLS_88;
    let __VLS_89;
    let __VLS_90;
    const __VLS_91 = {
        onChange: (__VLS_ctx.emitChange)
    };
    var __VLS_87;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-actions" },
});
const __VLS_92 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    ...{ 'onClick': {} },
    type: (__VLS_ctx.isModuleEnabled(__VLS_ctx.activeModule) ? 'danger' : 'success'),
}));
const __VLS_94 = __VLS_93({
    ...{ 'onClick': {} },
    type: (__VLS_ctx.isModuleEnabled(__VLS_ctx.activeModule) ? 'danger' : 'success'),
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
let __VLS_96;
let __VLS_97;
let __VLS_98;
const __VLS_99 = {
    onClick: (__VLS_ctx.toggleModule)
};
__VLS_95.slots.default;
(__VLS_ctx.isModuleEnabled(__VLS_ctx.activeModule) ? '禁用此模块' : '启用此模块');
var __VLS_95;
const __VLS_100 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_102 = __VLS_101({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
let __VLS_104;
let __VLS_105;
let __VLS_106;
const __VLS_107 = {
    onClick: (__VLS_ctx.emitAiOptimize)
};
__VLS_103.slots.default;
const __VLS_108 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({}));
const __VLS_110 = __VLS_109({}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
const __VLS_112 = {}.MagicStick;
/** @type {[typeof __VLS_components.MagicStick, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({}));
const __VLS_114 = __VLS_113({}, ...__VLS_functionalComponentArgsRest(__VLS_113));
var __VLS_111;
var __VLS_103;
/** @type {__VLS_StyleScopedClasses['tab-module-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['module-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-item']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-name']} */ ;
/** @type {__VLS_StyleScopedClasses['check-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['module-content']} */ ;
/** @type {__VLS_StyleScopedClasses['module-actions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            CircleCheck: CircleCheck,
            MagicStick: MagicStick,
            BasicInfoEditor: BasicInfoEditor,
            IntentionEditor: IntentionEditor,
            EducationEditor: EducationEditor,
            ExperienceEditor: ExperienceEditor,
            ProjectsEditor: ProjectsEditor,
            InternshipEditor: InternshipEditor,
            CampusEditor: CampusEditor,
            SkillsEditor: SkillsEditor,
            AwardsEditor: AwardsEditor,
            SummaryEditor: SummaryEditor,
            HobbiesEditor: HobbiesEditor,
            CustomEditor: CustomEditor,
            activeModule: activeModule,
            localData: localData,
            allModules: allModules,
            getSectionData: getSectionData,
            isModuleEnabled: isModuleEnabled,
            switchModule: switchModule,
            toggleModule: toggleModule,
            emitChange: emitChange,
            emitAiOptimize: emitAiOptimize,
        };
    },
    emits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
