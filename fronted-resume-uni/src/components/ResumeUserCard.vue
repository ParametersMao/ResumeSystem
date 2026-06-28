<template>
  <view class="user-card">
    <view class="user-card-header">
      <view class="title">我的简历</view>
      <view class="all-btn" @tap="$emit('allClick')">全部简历 ></view>
    </view>
    <view class="user-card-main">
      <image class="avatar" :src="resume.avatar" mode="aspectFill" />
      <view class="info">
        <view class="resume-title">{{ resume.title }}</view>
        <view class="progress">完成：{{ resume.progress }}%</view>
        <view class="update">更新：{{ resume.updateTime }}</view>
        <view class="actions">
          <button class="action-btn" @tap="$emit('manage', resume)">管理</button>
          <button class="action-btn" @tap="$emit('share', resume)">分享</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  resume: Object
});
</script>

<style scoped>
.user-card {
  background: #fff;
  border-radius: 20rpx;
  margin: 32rpx 32rpx 0 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,198,177,0.06);
  padding: 24rpx 0 0 0;
}
.user-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32rpx 16rpx 32rpx;
}
.title {
  font-size: 32rpx;
  font-weight: 700;
  color: #222;
}
.all-btn {
  color: #00c6b1;
  font-size: 26rpx;
}
.user-card-main {
  display: flex;
  align-items: center;
  padding: 0 32rpx 24rpx 32rpx;
}
.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 16rpx;
  margin-right: 24rpx;
}
.info {
  flex: 1;
}
.resume-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #222;
  margin-bottom: 8rpx;
}
.progress {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 4rpx;
}
.update {
  font-size: 22rpx;
  color: #aaa;
  margin-bottom: 8rpx;
}
.actions {
  display: flex;
  gap: 16rpx;
}
.action-btn {
  background: #f8f8f8;
  color: #00c6b1;
  border-radius: 16rpx;
  font-size: 24rpx;
  padding: 8rpx 24rpx;
  border: none;
}
</style> 