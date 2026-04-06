import { computed, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/user';
import { getCuserProfile, updateCuserProfile, uploadCuserAvatar } from '@/api/profile';
const userStore = useUserStore();
const loading = ref(false);
const saving = ref(false);
const uploading = ref(false);
const formRef = ref();
const form = ref({
    nickname: '',
    bio: '',
    avatarUrl: '',
});
const pickedFile = ref(null);
const pickedPreviewUrl = ref('');
const avatarPreview = computed(() => {
    return pickedPreviewUrl.value || form.value.avatarUrl || '/mock/avatar/default.svg';
});
async function load() {
    loading.value = true;
    try {
        const res = await getCuserProfile();
        if (res.code !== 200)
            throw new Error(res.message || '加载失败');
        form.value.nickname = res.data.nickname || '';
        form.value.bio = res.data.bio || '';
        form.value.avatarUrl = res.data.avatarUrl || '';
    }
    catch (e) {
        ElMessage.error(e?.message || '加载失败');
    }
    finally {
        loading.value = false;
    }
}
async function save() {
    saving.value = true;
    try {
        const res = await updateCuserProfile({
            nickname: form.value.nickname || undefined,
            bio: form.value.bio || undefined,
            avatarUrl: form.value.avatarUrl || undefined,
        });
        if (res.code !== 200)
            throw new Error(res.message || '保存失败');
        ElMessage.success('保存成功');
        await load();
    }
    catch (e) {
        ElMessage.error(e?.message || '保存失败');
    }
    finally {
        saving.value = false;
    }
}
function handlePick(file) {
    const raw = file?.raw;
    if (!raw)
        return;
    pickedFile.value = raw;
    pickedPreviewUrl.value = URL.createObjectURL(raw);
}
async function uploadAvatar() {
    uploading.value = true;
    try {
        const res = await uploadCuserAvatar(pickedFile.value || undefined);
        if (res.code !== 200)
            throw new Error(res.message || '上传失败');
        form.value.avatarUrl = res.data.avatarUrl;
        pickedFile.value = null;
        pickedPreviewUrl.value = '';
        ElMessage.success('头像已应用');
    }
    catch (e) {
        ElMessage.error(e?.message || '上传失败');
    }
    finally {
        uploading.value = false;
    }
}
async function useMockAvatar() {
    uploading.value = true;
    try {
        const res = await uploadCuserAvatar(undefined);
        if (res.code !== 200)
            throw new Error(res.message || '操作失败');
        form.value.avatarUrl = res.data.avatarUrl;
        ElMessage.success('已切换为 Mock 头像');
    }
    catch (e) {
        ElMessage.error(e?.message || '操作失败');
    }
    finally {
        uploading.value = false;
    }
}
onMounted(async () => {
    await userStore.initUserState();
    await load();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['info']} */ ;
/** @type {__VLS_StyleScopedClasses['info']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "profile-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "container" },
});
const __VLS_0 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "profile-card" },
    shadow: "hover",
}));
const __VLS_2 = __VLS_1({
    ...{ class: "profile-card" },
    shadow: "hover",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "h1" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "desc" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "actions" },
    });
    const __VLS_4 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        ...{ 'onClick': {} },
        loading: (__VLS_ctx.loading),
    }));
    const __VLS_6 = __VLS_5({
        ...{ 'onClick': {} },
        loading: (__VLS_ctx.loading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    let __VLS_8;
    let __VLS_9;
    let __VLS_10;
    const __VLS_11 = {
        onClick: (__VLS_ctx.load)
    };
    __VLS_7.slots.default;
    var __VLS_7;
    const __VLS_12 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.saving),
    }));
    const __VLS_14 = __VLS_13({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.saving),
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    let __VLS_16;
    let __VLS_17;
    let __VLS_18;
    const __VLS_19 = {
        onClick: (__VLS_ctx.save)
    };
    __VLS_15.slots.default;
    var __VLS_15;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "avatar-box" },
});
const __VLS_20 = {}.ElAvatar;
/** @type {[typeof __VLS_components.ElAvatar, typeof __VLS_components.elAvatar, typeof __VLS_components.ElAvatar, typeof __VLS_components.elAvatar, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    size: (96),
    src: (__VLS_ctx.avatarPreview),
    ...{ class: "avatar" },
}));
const __VLS_22 = __VLS_21({
    size: (96),
    src: (__VLS_ctx.avatarPreview),
    ...{ class: "avatar" },
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
((__VLS_ctx.userStore.user?.username || 'U').slice(0, 1).toUpperCase());
var __VLS_23;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "avatar-meta" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "avatar-tip" },
});
const __VLS_24 = {}.ElUpload;
/** @type {[typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    autoUpload: (false),
    showFileList: (false),
    accept: "image/*",
    onChange: (__VLS_ctx.handlePick),
}));
const __VLS_26 = __VLS_25({
    autoUpload: (false),
    showFileList: (false),
    accept: "image/*",
    onChange: (__VLS_ctx.handlePick),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    type: "primary",
    loading: (__VLS_ctx.uploading),
}));
const __VLS_30 = __VLS_29({
    type: "primary",
    loading: (__VLS_ctx.uploading),
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
var __VLS_31;
var __VLS_27;
if (__VLS_ctx.pickedFile) {
    const __VLS_32 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ 'onClick': {} },
        loading: (__VLS_ctx.uploading),
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onClick': {} },
        loading: (__VLS_ctx.uploading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_36;
    let __VLS_37;
    let __VLS_38;
    const __VLS_39 = {
        onClick: (__VLS_ctx.uploadAvatar)
    };
    __VLS_35.slots.default;
    var __VLS_35;
}
const __VLS_40 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    ...{ 'onClick': {} },
    text: true,
}));
const __VLS_42 = __VLS_41({
    ...{ 'onClick': {} },
    text: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
let __VLS_44;
let __VLS_45;
let __VLS_46;
const __VLS_47 = {
    onClick: (__VLS_ctx.useMockAvatar)
};
__VLS_43.slots.default;
var __VLS_43;
const __VLS_48 = {}.ElDivider;
/** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({}));
const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.userStore.user?.username || '-');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "value" },
});
(__VLS_ctx.userStore.user?.id ?? '-');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "right" },
});
const __VLS_52 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    ref: "formRef",
    model: (__VLS_ctx.form),
    labelWidth: "90px",
}));
const __VLS_54 = __VLS_53({
    ref: "formRef",
    model: (__VLS_ctx.form),
    labelWidth: "90px",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
/** @type {typeof __VLS_ctx.formRef} */ ;
var __VLS_56 = {};
__VLS_55.slots.default;
const __VLS_58 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
    label: "昵称",
    prop: "nickname",
}));
const __VLS_60 = __VLS_59({
    label: "昵称",
    prop: "nickname",
}, ...__VLS_functionalComponentArgsRest(__VLS_59));
__VLS_61.slots.default;
const __VLS_62 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
    modelValue: (__VLS_ctx.form.nickname),
    maxlength: "64",
    showWordLimit: true,
    placeholder: "例如：MrBean",
}));
const __VLS_64 = __VLS_63({
    modelValue: (__VLS_ctx.form.nickname),
    maxlength: "64",
    showWordLimit: true,
    placeholder: "例如：MrBean",
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
var __VLS_61;
const __VLS_66 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
    label: "简介",
    prop: "bio",
}));
const __VLS_68 = __VLS_67({
    label: "简介",
    prop: "bio",
}, ...__VLS_functionalComponentArgsRest(__VLS_67));
__VLS_69.slots.default;
const __VLS_70 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
    modelValue: (__VLS_ctx.form.bio),
    type: "textarea",
    rows: (6),
    maxlength: "500",
    showWordLimit: true,
    placeholder: "一句话介绍你自己（可选）",
}));
const __VLS_72 = __VLS_71({
    modelValue: (__VLS_ctx.form.bio),
    type: "textarea",
    rows: (6),
    maxlength: "500",
    showWordLimit: true,
    placeholder: "一句话介绍你自己（可选）",
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
var __VLS_69;
const __VLS_74 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({
    label: "头像URL",
    prop: "avatarUrl",
}));
const __VLS_76 = __VLS_75({
    label: "头像URL",
    prop: "avatarUrl",
}, ...__VLS_functionalComponentArgsRest(__VLS_75));
__VLS_77.slots.default;
const __VLS_78 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
    modelValue: (__VLS_ctx.form.avatarUrl),
    maxlength: "512",
    placeholder: "例如：/uploads/avatars/xxx.png 或 /mock/avatar/default.svg",
}));
const __VLS_80 = __VLS_79({
    modelValue: (__VLS_ctx.form.avatarUrl),
    maxlength: "512",
    placeholder: "例如：/uploads/avatars/xxx.png 或 /mock/avatar/default.svg",
}, ...__VLS_functionalComponentArgsRest(__VLS_79));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hint" },
});
var __VLS_77;
var __VLS_55;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['profile-page']} */ ;
/** @type {__VLS_StyleScopedClasses['container']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['h1']} */ ;
/** @type {__VLS_StyleScopedClasses['desc']} */ ;
/** @type {__VLS_StyleScopedClasses['actions']} */ ;
/** @type {__VLS_StyleScopedClasses['content']} */ ;
/** @type {__VLS_StyleScopedClasses['left']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-box']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['info']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['right']} */ ;
/** @type {__VLS_StyleScopedClasses['hint']} */ ;
// @ts-ignore
var __VLS_57 = __VLS_56;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            userStore: userStore,
            loading: loading,
            saving: saving,
            uploading: uploading,
            formRef: formRef,
            form: form,
            pickedFile: pickedFile,
            avatarPreview: avatarPreview,
            load: load,
            save: save,
            handlePick: handlePick,
            uploadAvatar: uploadAvatar,
            useMockAvatar: useMockAvatar,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
