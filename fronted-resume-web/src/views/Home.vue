<template>
  <div class="home-page">
    <!-- 主横幅区域 -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">专业简历制作平台</h1>
        <p class="hero-subtitle">让您的简历脱颖而出，助力职业发展</p>
        <div class="hero-actions">
          <router-link to="/templates" class="btn-primary">浏览模板</router-link>
          <router-link to="/resumes" class="btn-secondary">开始创建</router-link>
        </div>
      </div>
      <div class="hero-image">
        <div class="resume-preview-card">
          <div class="card-header"></div>
          <div class="card-content">
            <div class="line"></div>
            <div class="line short"></div>
            <div class="line"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- 特色功能区域 -->
    <section class="features-section">
      <h2 class="section-title">为什么选择我们</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">📝</div>
          <h3>丰富的模板</h3>
          <p>多种专业设计的简历模板，适合各行各业</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎨</div>
          <h3>自定义样式</h3>
          <p>灵活的编辑器，打造独一无二的个人简历</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">💾</div>
          <h3>云端保存</h3>
          <p>随时随地访问和编辑您的简历数据</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📤</div>
          <h3>一键导出</h3>
          <p>支持PDF等多种格式，方便分享和打印</p>
        </div>
      </div>
    </section>

    <!-- 使用统计区域 -->
    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">10,000+</div>
          <div class="stat-label">注册用户</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">50+</div>
          <div class="stat-label">精美模板</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">99%</div>
          <div class="stat-label">用户满意度</div>
        </div>
      </div>
    </section>

    <!-- 行动号召区域 -->
    <section class="cta-section">
      <h2>立即开始制作您的专业简历</h2>
      <p>加入成千上万的求职者，让简历更出色</p>
      <router-link to="/templates" class="btn-large">免费开始</router-link>
    </section>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.home-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 主横幅区域 */
.hero-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  min-height: 500px;
  padding: 60px 0;
}

.hero-content {
  max-width: 600px;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 20px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 20px;
  color: #666;
  margin-bottom: 40px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 16px;
}

.btn-primary,
.btn-secondary,
.btn-large {
  display: inline-block;
  padding: 14px 32px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #2e6cff;
  color: white;
  box-shadow: 0 4px 16px rgba(46, 108, 255, 0.3);
}

.btn-primary:hover {
  background: #1a56db;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 108, 255, 0.4);
}

.btn-secondary {
  background: white;
  color: #2e6cff;
  border: 2px solid #2e6cff;
}

.btn-secondary:hover {
  background: #f5f7ff;
  transform: translateY(-2px);
}

.btn-large {
  padding: 16px 48px;
  font-size: 18px;
  background: #2e6cff;
  color: white;
  box-shadow: 0 4px 16px rgba(46, 108, 255, 0.3);
}

.btn-large:hover {
  background: #1a56db;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 108, 255, 0.4);
}

/* 简历预览卡片 */
.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.resume-preview-card {
  width: 300px;
  height: 400px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  padding: 30px;
  transform: rotate(-5deg);
  transition: transform 0.3s ease;
}

.resume-preview-card:hover {
  transform: rotate(0deg);
}

.card-header {
  width: 100%;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  margin-bottom: 20px;
}

.card-content .line {
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  margin-bottom: 12px;
}

.card-content .line.short {
  width: 60%;
}

/* 特色功能区域 */
.features-section {
  padding: 80px 0;
}

.section-title {
  text-align: center;
  font-size: 36px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 60px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.feature-card {
  background: white;
  padding: 40px 30px;
  border-radius: 16px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

/* 统计数据区域 */
.stats-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  padding: 60px 40px;
  margin: 40px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
}

.stat-item {
  text-align: center;
  color: white;
}

.stat-number {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 18px;
  opacity: 0.9;
}

/* 行动号召区域 */
.cta-section {
  text-align: center;
  padding: 100px 0;
}

.cta-section h2 {
  font-size: 36px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.cta-section p {
  font-size: 18px;
  color: #666;
  margin-bottom: 40px;
}

/* 响应式设计 */
@media (max-width: 968px) {
  .hero-section {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-content {
    max-width: 100%;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-title {
    font-size: 36px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .hero-title {
    font-size: 28px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .hero-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    text-align: center;
  }
}
</style>
