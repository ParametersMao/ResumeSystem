import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { ElAvatar, ElButton, ElCard, ElConfigProvider, ElDialog, ElDivider, ElDrawer, ElEmpty, ElForm, ElFormItem, ElIcon, ElInput, ElInputNumber, ElLoading, ElOption, ElPagination, ElPopover, ElRadioButton, ElRadioGroup, ElSelect, ElSwitch, ElTooltip, ElUpload, } from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import router from './router';
import './styles/index.css';
const app = createApp(App);
const elementComponents = [
    ElAvatar,
    ElButton,
    ElCard,
    ElConfigProvider,
    ElDialog,
    ElDivider,
    ElDrawer,
    ElEmpty,
    ElForm,
    ElFormItem,
    ElIcon,
    ElInput,
    ElInputNumber,
    ElOption,
    ElPagination,
    ElPopover,
    ElRadioButton,
    ElRadioGroup,
    ElSelect,
    ElSwitch,
    ElTooltip,
    ElUpload,
];
app.use(createPinia());
app.use(router);
elementComponents.forEach((component) => app.use(component));
app.use(ElLoading);
app.mount('#app');
