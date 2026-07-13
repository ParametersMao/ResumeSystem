<template>
  <div class="contact-page">
    <div class="contact-container">
      <!-- 页面标题 -->
      <section class="page-header">
        <h1 class="page-title">联系我们</h1>
        <p class="page-subtitle">客服与工单通道尚未开放，本页仅提供产品使用说明</p>
      </section>

      <div class="contact-content">
        <!-- 联系方式卡片 -->
        <div class="contact-cards">
          <div class="contact-card">
            <div class="card-icon">📧</div>
            <h3>邮箱</h3>
            <p>暂未开通</p>
            <span class="small-text">正式邮箱启用后会在此公布</span>
          </div>

          <div class="contact-card">
            <div class="card-icon">📱</div>
            <h3>客服热线</h3>
            <p>暂未开通</p>
            <p class="small-text">当前没有对外客服电话</p>
          </div>

          <div class="contact-card">
            <div class="card-icon">💬</div>
            <h3>在线客服</h3>
            <p>暂未开通</p>
            <button class="contact-link" type="button" disabled>暂不可用</button>
          </div>

          <div class="contact-card">
            <div class="card-icon">📍</div>
            <h3>服务状态</h3>
            <p>内部测试阶段</p>
            <p class="small-text">暂不提供线下接待</p>
          </div>
        </div>

        <!-- 联系表单 -->
        <div class="contact-form-section">
          <h2>发送消息</h2>
          <p class="form-description">表单尚未接入真实工单后端，当前内容不会被提交。</p>
          
          <form class="contact-form" @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="name">姓名 *</label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                placeholder="请输入您的姓名"
                required
              />
            </div>

            <div class="form-group">
              <label for="email">邮箱 *</label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                placeholder="请输入您的邮箱"
                required
              />
            </div>

            <div class="form-group">
              <label for="phone">电话</label>
              <input
                id="phone"
                v-model="formData.phone"
                type="tel"
                placeholder="请输入您的电话"
              />
            </div>

            <div class="form-group">
              <label for="subject">主题 *</label>
              <input
                id="subject"
                v-model="formData.subject"
                type="text"
                placeholder="请输入消息主题"
                required
              />
            </div>

            <div class="form-group">
              <label for="message">消息内容 *</label>
              <textarea
                id="message"
                v-model="formData.message"
                rows="6"
                placeholder="请输入您的消息内容"
                required
              ></textarea>
            </div>

            <button type="submit" class="submit-btn" disabled>
              提交暂未开放
            </button>
          </form>
        </div>
      </div>

      <!-- 常见问题 -->
      <section class="faq-section">
        <h2 class="section-title">常见问题</h2>
        <div class="faq-grid">
          <div class="faq-item">
            <h4>如何创建简历？</h4>
            <p>点击"个人中心"，然后选择"创建新简历"，选择您喜欢的模板开始编辑。</p>
          </div>
          <div class="faq-item">
            <h4>简历可以导出为PDF吗？</h4>
            <p>是的，我们支持将简历导出为PDF格式，方便您打印和分享。</p>
          </div>
          <div class="faq-item">
            <h4>数据安全吗？</h4>
            <p>系统持续完善访问控制、传输加密和备份机制；请勿在测试阶段上传不必要的敏感信息。</p>
          </div>
          <div class="faq-item">
            <h4>如何修改密码？</h4>
            <p>进入"个人中心"-"账户设置"，您可以在那里修改密码和其他信息。</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

const formData = reactive({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

function handleSubmit() {
  ElMessage.info('联系表单尚未开放，消息没有发送')
}
</script>

<style scoped>
.contact-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f7f8fa 0%, #ffffff 100%);
}

.contact-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 60px;
}

.page-title {
  font-size: 42px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.page-subtitle {
  font-size: 18px;
  color: #666;
}

/* 联系内容 */
.contact-content {
  display: grid;
  gap: 60px;
  margin-bottom: 80px;
}

/* 联系方式卡片 */
.contact-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.contact-card {
  background: white;
  padding: 32px 24px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.contact-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.contact-card h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.contact-card p {
  color: #666;
  margin-bottom: 8px;
}

.small-text {
  font-size: 14px;
  color: #999;
}

.contact-link {
  display: inline-block;
  margin-top: 16px;
  padding: 8px 20px;
  background: #2e6cff;
  color: white;
  text-decoration: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.contact-link:hover {
  background: #1a56db;
  transform: translateY(-2px);
}

/* 联系表单 */
.contact-form-section {
  background: white;
  padding: 48px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.contact-form-section h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.form-description {
  color: #666;
  margin-bottom: 32px;
}

.contact-form {
  display: grid;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.form-group input,
.form-group textarea {
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2e6cff;
  box-shadow: 0 0 0 3px rgba(46, 108, 255, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.submit-btn {
  padding: 14px 32px;
  background: #2e6cff;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  justify-self: start;
}

.submit-btn:hover:not(:disabled) {
  background: #1a56db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 108, 255, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 常见问题 */
.faq-section {
  margin-top: 80px;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 48px;
}

.faq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.faq-item {
  background: white;
  padding: 28px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.faq-item h4 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.faq-item p {
  color: #666;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .contact-container {
    padding: 20px;
  }

  .page-title {
    font-size: 32px;
  }

  .contact-cards {
    grid-template-columns: 1fr;
  }

  .contact-form-section {
    padding: 32px 24px;
  }

  .faq-grid {
    grid-template-columns: 1fr;
  }
}
</style>
