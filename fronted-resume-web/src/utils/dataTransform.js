import { DEFAULT_SECTION_TITLES } from '@/config/sectionTypes';
import { createEmptyRichText, normalizeSectionRichText } from '@/utils/richText';
/**
 * 将旧的 profileData 格式转换为新的 sections 格式
 */
export function transformProfileDataToSections(profileData) {
    const sections = [];
    // 转换工作经验
    if (profileData.experience && profileData.experience.length > 0) {
        sections.push(normalizeSectionRichText({
            id: 'experience-' + Date.now(),
            type: 'experience',
            title: DEFAULT_SECTION_TITLES.experience,
            visible: true,
            order: 1,
            items: profileData.experience
        }));
    }
    // 转换技能
    if (profileData.skills && profileData.skills.length > 0) {
        sections.push({
            id: 'skills-' + Date.now(),
            type: 'skills',
            title: DEFAULT_SECTION_TITLES.skills,
            visible: true,
            order: 2,
            items: profileData.skills
        });
    }
    // 转换项目经历
    if (profileData.projects && profileData.projects.length > 0) {
        sections.push(normalizeSectionRichText({
            id: 'projects-' + Date.now(),
            type: 'projects',
            title: DEFAULT_SECTION_TITLES.projects,
            visible: true,
            order: 3,
            items: profileData.projects
        }));
    }
    // 转换教育背景
    if (profileData.education && profileData.education.length > 0) {
        sections.push({
            id: 'education-' + Date.now(),
            type: 'education',
            title: DEFAULT_SECTION_TITLES.education,
            visible: true,
            order: 4,
            items: profileData.education
        });
    }
    return {
        profile: {
            basic: profileData.basic || {
                name: '张三',
                title: '前端工程师',
                contacts: {
                    email: 'zhangsan@example.com',
                    phone: '13800138000',
                    site: 'https://example.com'
                }
            },
            summary: profileData.summary || ''
        },
        sections
    };
}
/**
 * 将新的 sections 格式转换为旧的 profileData 格式（用于保存）
 */
export function transformSectionsToProfileData(resumeData) {
    const profileData = {
        basic: resumeData.profile.basic,
        summary: resumeData.profile.summary,
        experience: [],
        education: [],
        skills: [],
        projects: []
    };
    resumeData.sections.forEach(section => {
        switch (section.type) {
            case 'experience':
                profileData.experience = section.items;
                break;
            case 'education':
                profileData.education = section.items;
                break;
            case 'skills':
                profileData.skills = section.items;
                break;
            case 'projects':
                profileData.projects = section.items;
                break;
            // 自定义模块暂时不转换到旧格式
        }
    });
    return profileData;
}
/**
 * 创建新的模块
 */
export function createNewSection(type, existingSections, customTitle) {
    const maxOrder = Math.max(...existingSections.map(s => s.order), 0);
    const baseSection = {
        id: `${type}-${Date.now()}`,
        type,
        title: customTitle || DEFAULT_SECTION_TITLES[type],
        visible: true,
        order: maxOrder + 1,
        items: []
    };
    // 为不同类型设置默认项目
    switch (type) {
        case 'experience':
            return normalizeSectionRichText({
                ...baseSection,
                items: [{
                        company: '',
                        role: '',
                        start: '',
                        end: '',
                        duration: { start: '', end: '' },
                        desc: createEmptyRichText(),
                        icon: ''
                    }]
            });
        case 'education':
            return {
                ...baseSection,
                items: [{
                        school: '',
                        degree: '',
                        start: '',
                        end: ''
                    }]
            };
        case 'projects':
            return normalizeSectionRichText({
                ...baseSection,
                items: [{
                        name: '',
                        role: '',
                        date: '',
                        duration: { start: '', end: '' },
                        desc: createEmptyRichText(),
                        icon: ''
                    }]
            });
        case 'skills':
            return {
                ...baseSection,
                items: []
            };
        case 'custom':
            return {
                ...baseSection,
                items: [],
                config: {
                    fields: [
                        { name: 'title', label: '标题', type: 'text', required: true },
                        { name: 'content', label: '内容', type: 'textarea', required: false }
                    ]
                }
            };
        default:
            return baseSection;
    }
}
/**
 * 重新排序模块
 */
export function reorderSections(sections, fromIndex, toIndex) {
    const newSections = [...sections];
    const [removed] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, removed);
    // 重新设置 order
    return newSections.map((section, index) => ({
        ...section,
        order: index + 1
    }));
}
