// 快速调试完全自定义样式功能
// 在浏览器控制台中运行

console.log('🔍 快速检查完全自定义样式功能...');

// 1. 检查自定义样式元素
const customStyles = document.querySelectorAll('style[data-resume-custom="true"]');
console.log('✅ 自定义样式元素数量:', customStyles.length);

if (customStyles.length > 0) {
  customStyles.forEach((style, i) => {
    console.log(`样式 ${i+1} 内容长度:`, style.textContent.length);
    console.log(`样式 ${i+1} 前100字符:`, style.textContent.substring(0, 100));
  });
} else {
  console.log('❌ 没有找到自定义样式元素');
}

// 2. 检查CSS变量
const root = getComputedStyle(document.documentElement);
const primaryColor = root.getPropertyValue('--colors-primary');
console.log('✅ CSS变量 --colors-primary:', primaryColor || '未定义');

// 3. 检查预览元素
const preview = document.querySelector('.dynamic-resume-preview');
if (preview) {
  console.log('✅ 找到预览元素');
  const style = getComputedStyle(preview);
  console.log('预览元素背景:', style.background);
  console.log('预览元素边框:', style.border);
} else {
  console.log('❌ 未找到预览元素');
}

// 4. 检查Schema元素
const schemaElements = document.querySelectorAll('.schema-renderer, .schema-grid, .schema-flex');
console.log('✅ Schema元素数量:', schemaElements.length);

// 5. 检查自定义类名元素
const customElements = document.querySelectorAll('[class*="custom-"]');
console.log('✅ 自定义类名元素数量:', customElements.length);

console.log('🎉 快速检查完成！');

// 如果所有检查都通过，说明功能正常
const allGood = customStyles.length > 0 && preview && (primaryColor || schemaElements.length > 0);
console.log(allGood ? '🎉 功能正常！' : '⚠️ 功能可能有问题，请检查上述输出');
