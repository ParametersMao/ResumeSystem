<template>
  <view class="home-page">
    <!-- 搜索栏 -->
    <view class="search-bar" @tap="goSearch">
      <view class="search-icon">🔍</view>
      <text class="search-placeholder">搜索职位/行业模板</text>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-entries">
      <view class="quick-item" @tap="goCases">
        <image class="quick-icon" src="/static/logo.png" mode="aspectFit" />
        <text class="quick-text">简历库</text>
      </view>
      <view class="quick-item" @tap="goMine">
        <image class="quick-icon" src="/static/logo.png" mode="aspectFit" />
        <text class="quick-text">我的</text>
      </view>
    </view>

    <!-- 推荐模板轮播 -->
    <view class="section">
      <view class="section-header">
        <view class="section-title">精选模板</view>
        <view class="section-more" @tap="goCases">更多 ></view>
      </view>
      <ResumeCarousel :templates="templates" @templateClick="onTemplateClick" />
    </view>
  </view>
  
</template>

<script setup>
import { ref } from 'vue'
import ResumeCarousel from '@/components/ResumeCarousel.vue'

const templates = ref([
  { id: 1, img: '/static/logo.png', title: '通用求职简历' },
  { id: 2, img: '/static/logo.png', title: '校园招聘简历' }
])

function goSearch () { uni.navigateTo({ url: '/pages/cases/search' }) }
function goCases () { uni.switchTab({ url: '/pages/cases/cases' }) }
function goMine () { uni.switchTab({ url: '/pages/mine/mine' }) }
function onTemplateClick (item) {
  uni.showToast({ title: `选择：${item.title}`, icon: 'none' })
}
</script>

<style>
.home-page {
  min-height: 100vh;
  background: #f8f8f8;
  padding-bottom: 120rpx;
}
.search-bar {
  display: flex;
  align-items: center;
  background: #fff;
  margin: 24rpx 24rpx 12rpx 24rpx;
  border-radius: 32rpx;
  padding: 18rpx 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
}
.search-icon {
  margin-right: 12rpx;
  font-size: 28rpx;
}
.search-placeholder {
  color: #999;
  font-size: 26rpx;
}
.quick-entries {
  display: flex;
  gap: 24rpx;
  margin: 0 24rpx 16rpx 24rpx;
}
.quick-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx 0;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
}
.quick-icon {
  width: 64rpx;
  height: 64rpx;
  margin-bottom: 12rpx;
}
.quick-text {
  font-size: 26rpx;
  color: #333;
}
.section {
  margin-top: 8rpx;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 24rpx 8rpx 24rpx;
}
.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #222;
}
.section-more {
  color: #00c6b1;
  font-size: 26rpx;
}
</style>
