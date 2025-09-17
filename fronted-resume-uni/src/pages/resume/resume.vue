<template>
  <view class="resume-page">
    <!-- 用户简历卡片（登录后显示） -->
    <ResumeUserCard v-if="userResume" :resume="userResume" @allClick="onAllResume" @manage="onManage" @share="onShare" />

    <!-- 案例库标题栏 -->
    <view class="section-header">
      <view class="section-title">案例库</view>
      <view class="section-subtitle">无需填写 一键导入</view>
      <view class="section-more" @tap="onMore">更多案例 ></view>
    </view>

    <!-- 案例库轮播组件 -->
    <ResumeCarousel :templates="caseList" @templateClick="onTemplateClick" />
  </view>
</template>

<script setup>
import { ref } from 'vue';
import ResumeUserCard from '@/components/ResumeUserCard.vue';
import ResumeCarousel from '@/components/ResumeCarousel.vue';

// 模拟用户简历数据（实际可从缓存或接口获取）
const userResume = ref({
  avatar: '/static/avatar.png',
  title: '零经验三元实习模板',
  progress: 75,
  updateTime: '2024-10-14 20:15:00'
});

// 案例库模板数据
const caseList = ref([
  {
    id: 1,
    img: '/static/template1.png',
    title: '经典求职简历模板'
  },
  // 可继续添加更多模板
]);

function onAllResume() {
  uni.showToast({ title: '全部简历', icon: 'none' });
}
function onManage(resume) {
  uni.showToast({ title: '管理简历', icon: 'none' });
}
function onShare(resume) {
  uni.showToast({ title: '分享简历', icon: 'none' });
}
function onTemplateClick(item) {
  uni.navigateTo({ url: `/pages/template-edit/template-edit?templateId=${item.id}` });
}
function onMore() {
  uni.showToast({ title: '更多案例', icon: 'none' });
}
</script>

<style scoped>
.resume-page {
  min-height: 100vh;
  background: #f8f8f8;
  padding-bottom: 120rpx;
}
.section-header {
  display: flex;
  align-items: flex-end;
  padding: 32rpx 32rpx 0 32rpx;
  position: relative;
}
.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #222;
  margin-right: 16rpx;
}
.section-subtitle {
  font-size: 22rpx;
  color: #999;
  margin-bottom: 2rpx;
}
.section-more {
  position: absolute;
  right: 32rpx;
  color: #00c6b1;
  font-size: 26rpx;
}
</style> 