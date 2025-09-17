/**
 * 调试完全自定义样式功能
 * 在浏览器控制台中运行此脚本来检查功能状态
 */

console.log('🔍 开始调试完全自定义样式功能...');

// 1. 检查Vue组件是否正确加载
console.log('1. 检查Vue组件状态...');
const vueApp = document.querySelector('#app');
if (vueApp && vueApp.__vue__) {
    console.log('✅ Vue应用已加载');
} else {
    console.log('❌ Vue应用未找到');
}

// 2. 检查自定义样式元素
console.log('2. 检查自定义样式注入...');
const customStyleElements = document.querySelectorAll('style[data-resume-custom="true"]');
console.log('找到自定义样式元素数量:', customStyleElements.length);

customStyleElements.forEach((element, index) => {
    console.log(`样式元素 ${index + 1}:`, {
        textContent: element.textContent.substring(0, 100) + '...',
        length: element.textContent.length
    });
});

// 3. 检查CSS变量
console.log('3. 检查CSS变量...');
const rootStyles = getComputedStyle(document.documentElement);
const cssVariables = [
    '--colors-primary',
    '--colors-secondary', 
    '--spacing-md',
    '--spacing-lg'
];

cssVariables.forEach(variable => {
    const value = rootStyles.getPropertyValue(variable);
    if (value) {
        console.log(`✅ ${variable}: ${value}`);
    } else {
        console.log(`❌ ${variable}: 未定义`);
    }
});

// 4. 检查Schema渲染器
console.log('4. 检查Schema渲染器...');
const schemaElements = document.querySelectorAll('.schema-renderer, .schema-grid, .schema-flex');
console.log('找到Schema元素数量:', schemaElements.length);

// 5. 检查自定义类名
console.log('5. 检查自定义类名...');
const customClassElements = document.querySelectorAll('[class*="custom-"]');
console.log('找到自定义类名元素数量:', customClassElements.length);

// 6. 检查响应式样式
console.log('6. 检查响应式样式...');
const mediaQueries = [];
for (let i = 0; i < document.styleSheets.length; i++) {
    try {
        const sheet = document.styleSheets[i];
        if (sheet.cssRules) {
            for (let j = 0; j < sheet.cssRules.length; j++) {
                const rule = sheet.cssRules[j];
                if (rule.type === CSSRule.MEDIA_RULE) {
                    mediaQueries.push(rule.media.mediaText);
                }
            }
        }
    } catch (e) {
        // 跨域样式表无法访问
    }
}
console.log('找到媒体查询数量:', mediaQueries.length);
mediaQueries.forEach(mq => console.log('媒体查询:', mq));

// 7. 检查模板数据
console.log('7. 检查模板数据...');
// 尝试从Vue实例中获取数据
const resumePreview = document.querySelector('.dynamic-resume-preview');
if (resumePreview && resumePreview.__vueParentComponent) {
    const component = resumePreview.__vueParentComponent;
    console.log('找到Vue组件实例');
    
    // 检查props
    if (component.props) {
        console.log('模板数据存在:', !!component.props.templateData);
        console.log('简历数据存在:', !!component.props.resumeData);
        
        if (component.props.templateData) {
            console.log('模板数据内容:', component.props.templateData);
        }
    }
} else {
    console.log('❌ 无法访问Vue组件实例');
}

// 8. 检查样式计算
console.log('8. 检查样式计算...');
const previewElement = document.querySelector('.dynamic-resume-preview');
if (previewElement) {
    const computedStyle = getComputedStyle(previewElement);
    console.log('预览元素样式:');
    console.log('- background:', computedStyle.background);
    console.log('- border:', computedStyle.border);
    console.log('- borderRadius:', computedStyle.borderRadius);
} else {
    console.log('❌ 未找到预览元素');
}

console.log('🎉 调试完成！');

// 输出调试结果
const debugResults = {
  customStyleElements: customStyleElements.length,
  cssVariables: cssVariables.filter(v => rootStyles.getPropertyValue(v)).length,
  schemaElements: schemaElements.length,
  customClassElements: customClassElements.length,
  mediaQueries: mediaQueries.length
};

console.log('📊 调试结果汇总:', debugResults);

// 将结果存储到全局变量中，方便后续使用
window.debugResults = debugResults;
