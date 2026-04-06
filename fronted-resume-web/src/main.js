import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './styles/index.css';
// 导入Element Plus
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
// 创建应用实例
const app = createApp(App);
// 注册全局组件
import FallbackRenderer from './components/resume/sections/FallbackRenderer.vue';
// 首先注册FallbackRenderer - 这是基础组件
app.component('fallback-renderer', FallbackRenderer);
// 注册实现各种模块类型的渲染组件
import BasicRenderer from './components/resume/renderers/BasicRenderer.vue';
import EducationRenderer from './components/resume/renderers/EducationRenderer.vue';
import ExperienceRenderer from './components/resume/renderers/ExperienceRenderer.vue';
import SkillsRenderer from './components/resume/renderers/SkillsRenderer.vue';
import ProjectsRenderer from './components/resume/renderers/ProjectsRenderer.vue';
import AwardsRenderer from './components/resume/renderers/AwardsRenderer.vue';
import IntentionRenderer from './components/resume/renderers/IntentionRenderer.vue';
import InternshipRenderer from './components/resume/renderers/InternshipRenderer.vue';
import CampusRenderer from './components/resume/renderers/CampusRenderer.vue';
import SummaryRenderer from './components/resume/renderers/SummaryRenderer.vue';
import GenericRenderer from './components/resume/renderers/GenericRenderer.vue';
// 注册个人信息模块（用于兼容性）
import PersonalInfoSection from './components/resume/sections/PersonalInfoSection.vue';
// 注册模块渲染器
app.component('basic-renderer', BasicRenderer);
app.component('personal-renderer', BasicRenderer); // personal 类型使用 basic-renderer
app.component('education-renderer', EducationRenderer);
app.component('experience-renderer', ExperienceRenderer);
app.component('skills-renderer', SkillsRenderer);
app.component('projects-renderer', ProjectsRenderer);
app.component('awards-renderer', AwardsRenderer);
app.component('intention-renderer', IntentionRenderer);
app.component('internship-renderer', InternshipRenderer);
app.component('campus-renderer', CampusRenderer);
app.component('summary-renderer', SummaryRenderer);
app.component('generic-renderer', GenericRenderer);
// 注册个人信息组件（备用）
app.component('personal-info-section', PersonalInfoSection);
// 最后，注册通用内容渲染器和模块组件
import GenericSection from './components/resume/sections/GenericSection.vue';
app.component('generic-section', GenericSection);
// 使用插件
app.use(createPinia());
app.use(router);
app.use(ElementPlus);
// 挂载应用
app.mount('#app');
