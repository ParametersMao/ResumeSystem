// 生成预览 HTML
const generatePreviewHtml = (templateData: any) => {
  // 创建一个默认模板，避免复杂的数据传递
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>简历模板预览</title>
    <script src="https://cdn.jsdelivr.net/npm/vue@3.2.36/dist/vue.global.js"></script>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .container {
            padding: 20px;
        }
        .resume {
            background-color: white;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-radius: 5px;
            max-width: 800px;
            margin: 0 auto;
        }
        .section {
            margin-bottom: 20px;
        }
        .section-title {
            border-bottom: 2px solid;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .item {
            margin-bottom: 15px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .name {
            font-size: 28px;
            font-weight: bold;
        }
        .title {
            font-size: 18px;
            font-style: italic;
            color: #555;
        }
        .contact {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
        }
        .contact-item {
            margin: 0 10px;
        }
        .skill-tag {
            display: inline-block;
            background-color: #f5f5f5;
            padding: 5px 10px;
            margin: 3px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div id="app" class="container">
        <div class="resume">
            <!-- 头部区域 -->
            <div class="header">
                <div class="name" style="color: #2A3B8F;">张三</div>
                <div class="title" style="color: #555555;">高级前端工程师</div>
                <div class="contact">
                    <div class="contact-item">
                        <span>邮箱: zhangsan@example.com</span>
                    </div>
                    <div class="contact-item">
                        <span>电话: 13800138000</span>
                    </div>
                    <div class="contact-item">
                        <span>网站: https://zhangsan.dev</span>
                    </div>
                </div>
            </div>

            <!-- 个人简介 -->
            <div class="section">
                <div class="section-title" style="color: #2A3B8F; border-bottom-color: #2A3B8F;">
                    个人简介
                </div>
                <div>
                    拥有5年前端开发经验，专注于React和Vue框架，擅长构建高性能、可扩展的Web应用。热衷于用户体验设计和前端性能优化。
                </div>
            </div>

            <!-- 工作经历 -->
            <div class="section">
                <div class="section-title" style="color: #2A3B8F; border-bottom-color: #2A3B8F;">
                    工作经历
                </div>
                <div class="item">
                    <div style="font-weight: bold;">ABC科技有限公司</div>
                    <div style="font-style: italic;">高级前端工程师</div>
                    <div style="color: #777;">2020-06 - 至今</div>
                    <div>负责公司核心产品的前端架构设计和开发，优化前端性能使页面加载速度提升40%，带领5人前端团队完成多个关键项目。</div>
                </div>
                <div class="item">
                    <div style="font-weight: bold;">XYZ互联网公司</div>
                    <div style="font-style: italic;">前端工程师</div>
                    <div style="color: #777;">2018-03 - 2020-05</div>
                    <div>参与电商平台的前端开发，实现响应式设计，确保在各种设备上的良好体验，开发了多个可复用的UI组件。</div>
                </div>
            </div>

            <!-- 教育背景 -->
            <div class="section">
                <div class="section-title" style="color: #2A3B8F; border-bottom-color: #2A3B8F;">
                    教育背景
                </div>
                <div class="item">
                    <div style="font-weight: bold;">北京大学</div>
                    <div style="font-style: italic;">计算机科学 硕士</div>
                    <div style="color: #777;">2015-09 - 2018-06</div>
                </div>
                <div class="item">
                    <div style="font-weight: bold;">南京大学</div>
                    <div style="font-style: italic;">软件工程 学士</div>
                    <div style="color: #777;">2011-09 - 2015-06</div>
                </div>
            </div>

            <!-- 技能 -->
            <div class="section">
                <div class="section-title" style="color: #2A3B8F; border-bottom-color: #2A3B8F;">
                    技能
                </div>
                <div>
                    <span class="skill-tag">JavaScript</span>
                    <span class="skill-tag">TypeScript</span>
                    <span class="skill-tag">React</span>
                    <span class="skill-tag">Vue</span>
                    <span class="skill-tag">Node.js</span>
                    <span class="skill-tag">Webpack</span>
                    <span class="skill-tag">CSS3</span>
                    <span class="skill-tag">HTML5</span>
                    <span class="skill-tag">Redux</span>
                    <span class="skill-tag">Git</span>
                </div>
            </div>

            <!-- 项目经历 -->
            <div class="section">
                <div class="section-title" style="color: #2A3B8F; border-bottom-color: #2A3B8F;">
                    项目经历
                </div>
                <div class="item">
                    <div style="font-weight: bold;">企业资源管理系统</div>
                    <div style="font-style: italic;">前端负责人</div>
                    <div style="color: #777;">2021-01 - 2021-06</div>
                    <div>设计并实现了基于React的企业资源管理系统前端，包括数据可视化、实时通知等功能，提高了企业运营效率20%。</div>
                </div>
                <div class="item">
                    <div style="font-weight: bold;">移动端电商平台</div>
                    <div style="font-style: italic;">前端开发</div>
                    <div style="color: #777;">2019-05 - 2019-12</div>
                    <div>使用Vue开发移动端电商平台，实现了购物车、支付流程、商品搜索等核心功能，月活用户超过10万。</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

  generatedHtml.value = html;
}