// 简单的自定义CSS测试
// 在浏览器控制台中运行

console.log('🔍 开始测试自定义CSS功能...');

// 方法1：直接检查当前页面状态
const customStyles = document.querySelectorAll('style[data-resume-custom="true"]');
console.log('当前自定义样式元素数量:', customStyles.length);

if (customStyles.length > 0) {
  customStyles.forEach((style, i) => {
    console.log(`样式 ${i+1} 内容长度:`, style.textContent.length);
  });
}

// 方法2：手动添加测试CSS
const testCSS = `
.dynamic-resume-preview {
  border: 5px solid red !important;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4) !important;
}
.resume-content {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%) !important;
  border: 3px solid blue !important;
  border-radius: 20px !important;
}
`;

// 创建并注入测试CSS
const testStyleElement = document.createElement('style');
testStyleElement.type = 'text/css';
testStyleElement.textContent = testCSS;
testStyleElement.setAttribute('data-resume-custom', 'true');
testStyleElement.setAttribute('data-test', 'true');
document.head.appendChild(testStyleElement);

console.log('✅ 已注入测试CSS，长度:', testCSS.length);

// 检查是否生效
setTimeout(() => {
  const previewElement = document.querySelector('.dynamic-resume-preview');
  if (previewElement) {
    const computedStyle = getComputedStyle(previewElement);
    console.log('预览元素样式:');
    console.log('- border:', computedStyle.border);
    console.log('- background:', computedStyle.background);
    
    if (computedStyle.border.includes('red') || computedStyle.background.includes('gradient')) {
      console.log('🎉 自定义CSS功能正常工作！');
    } else {
      console.log('⚠️ 自定义CSS可能没有生效');
    }
  } else {
    console.log('❌ 未找到预览元素');
  }
}, 100);

console.log('🎉 测试完成！');
