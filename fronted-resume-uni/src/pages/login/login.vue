<template>
  <view class="login-page">
    <view class="login-card">
      <image class="logo" src="/src/static/logo.png" mode="aspectFit" />
      <view class="title">欢迎回来</view>
      <view class="subtitle">请登录您的账户</view>
      <view class="form-group">
        <input class="input-field" type="text" v-model="username" placeholder="请输入用户名/手机号" />
      </view>
      <view class="form-group">
        <input
          class="input-field"
          :type="showPwd ? 'text' : 'password'"
          v-model="password"
          placeholder="请输入密码"
        />
        <text class="password-toggle" @tap="togglePwd">{{ showPwd ? '🙈' : '👁️' }}</text>
      </view>
      <view class="forgot-row">
        <text class="forgot-link" @tap="onForgot">忘记密码？</text>
      </view>
      <button class="login-btn" @tap="onLogin">登录</button>
      <view class="divider">
        <view class="line"></view>
        <text>或使用以下方式登录</text>
        <view class="line"></view>
      </view>
      <view class="social-login">
        <button class="social-btn" @tap="onSocial('wechat')">💬</button>
        <button class="social-btn" @tap="onSocial('qq')">🐧</button>
        <button class="social-btn" @tap="onSocial('weibo')">📱</button>
      </view>
      <view class="register-link">
        还没有账户？<text class="register" @tap="onRegister">立即注册</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const username = ref('');
const password = ref('');
const showPwd = ref(false);

function togglePwd() {
  showPwd.value = !showPwd.value;
}
function onLogin() {
  if (!username.value || !password.value) {
    uni.showToast({ title: '请填写完整的登录信息', icon: 'none' });
    return;
  }
  uni.showLoading({ title: '登录中...' });
  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({ title: '登录成功', icon: 'success' });
  }, 1500);
}
function onForgot() {
  uni.showToast({ title: '跳转到找回密码', icon: 'none' });
}
function onRegister() {
  uni.showToast({ title: '跳转到注册页面', icon: 'none' });
}
function onSocial(type) {
  uni.showToast({ title: `正在跳转到${type}登录...`, icon: 'none' });
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0 80rpx 0;
}
.login-card {
  width: 90vw;
  max-width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(102,126,234,0.08);
  padding: 56rpx 32rpx 32rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.logo {
  width: 100rpx;
  height: 100rpx;
  margin-bottom: 24rpx;
  border-radius: 20rpx;
}
.title {
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
  margin-bottom: 8rpx;
}
.subtitle {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 40rpx;
}
.form-group {
  width: 100%;
  margin-bottom: 24rpx;
  position: relative;
}
.input-field {
  width: 100%;
  padding: 24rpx 28rpx;
  border: 2rpx solid #e1e5e9;
  border-radius: 12rpx;
  font-size: 28rpx;
  background: #f8f9fa;
  outline: none;
}
.password-toggle {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 32rpx;
}
.forgot-row {
  width: 100%;
  text-align: right;
  margin-bottom: 24rpx;
}
.forgot-link {
  color: #667eea;
  font-size: 24rpx;
}
.login-btn {
  width: 100%;
  padding: 24rpx;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border: none;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 32rpx;
}
.divider {
  display: flex;
  align-items: center;
  color: #999;
  font-size: 24rpx;
  margin: 24rpx 0 24rpx 0;
  width: 100%;
  .line {
    flex: 1;
    height: 2rpx;
    background: #e1e5e9;
    margin: 0 16rpx;
  }
}
.social-login {
  display: flex;
  gap: 24rpx;
  justify-content: center;
  margin-bottom: 24rpx;
  .social-btn {
    width: 64rpx;
    height: 64rpx;
    border: 2rpx solid #e1e5e9;
    border-radius: 12rpx;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36rpx;
  }
}
.register-link {
  text-align: center;
  color: #666;
  font-size: 24rpx;
  .register {
    color: #667eea;
    font-weight: 600;
    margin-left: 8rpx;
  }
}
</style> 