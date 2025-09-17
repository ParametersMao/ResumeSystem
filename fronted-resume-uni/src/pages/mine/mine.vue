<template>
  <view class="mine-bg">
    <!-- 顶部蓝色背景和头像区 -->
    <view class="mine-header">
      <view class="header-bg">
        <view class="header-dots"></view>
        <view class="header-dots2"></view>
        <view class="header-dots3"></view>
      </view>
      <view class="header-info">
        <view class="avatar-box">
          <image class="avatar" src="/static/logo.png" mode="aspectFill" />
        </view>
        <view class="user-title">职绘简历</view>
      </view>
    </view>

    <!-- 简历统计卡片 -->
    <view class="resume-stat-card">
      <view class="stat-num">1</view>
      <view class="stat-label">我的简历</view>
    </view>

    <!-- 功能列表 -->
    <view class="mine-list">
      <view class="mine-list-item">
        <image class="item-icon" src="/static/logo.png" />
        <text class="item-title">简历辅导</text>
        <uni-icons type="right" size="18" color="#ccc" />
      </view>
      <view class="mine-list-item">
        <image class="item-icon" src="/static/logo.png" />
        <text class="item-title">职绘简历使用手册</text>
        <uni-icons type="right" size="18" color="#ccc" />
      </view>
      <view class="mine-list-item">
        <image class="item-icon" src="/static/logo.png" />
        <text class="item-title">在线客服</text>
        <uni-icons type="right" size="18" color="#ccc" />
      </view>
      <view class="mine-list-item">
        <image class="item-icon" src="/static/logo.png" />
        <text class="item-title">设置</text>
        <uni-icons type="right" size="18" color="#ccc" />
      </view>
      <view class="mine-list-item">
        <image class="item-icon" src="/static/logo.png" />
        <text class="item-title">商务合作</text>
        <uni-icons type="right" size="18" color="#ccc" />
      </view>
    </view>

    <!-- 关注公众号区域 -->
    <view class="mine-bottom-bar">
      <view class="left-tag">职绘简历</view>
      <text class="desc">关注公众号，下次不迷路</text>
      <button class="follow-btn">点击关注</button>
    </view>
  </view>
</template>

<script setup>
// 这里可引入uni-icons组件，或用自定义svg
</script>

<style lang="scss" scoped>
.mine-bg {
  min-height: 100vh;
  background: #f8f8f8;
  padding-bottom: 120rpx;
}
.mine-header {
  position: relative;
  height: 260rpx;
  .header-bg {
    background: linear-gradient(135deg, #00c6b1 0%, #00e6d8 100%);
    height: 180rpx;
    border-bottom-left-radius: 40rpx;
    border-bottom-right-radius: 40rpx;
    position: relative;
    overflow: hidden;
    .header-dots, .header-dots2, .header-dots3 {
      position: absolute;
      border-radius: 50%;
      opacity: 0.2;
    }
    .header-dots {
      width: 120rpx;
      height: 40rpx;
      background: #fff;
      left: 60rpx;
      top: 30rpx;
    }
    .header-dots2 {
      width: 80rpx;
      height: 20rpx;
      background: #fff;
      right: 40rpx;
      top: 60rpx;
    }
    .header-dots3 {
      width: 60rpx;
      height: 16rpx;
      background: #fff;
      left: 180rpx;
      top: 100rpx;
    }
  }
  .header-info {
    position: absolute;
    left: 0;
    right: 0;
    top: 100rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    .avatar-box {
      width: 100rpx;
      height: 100rpx;
      background: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4rpx 16rpx rgba(0,198,177,0.10);
      .avatar {
        width: 88rpx;
        height: 88rpx;
        border-radius: 50%;
      }
    }
    .user-title {
      color: #fff;
      font-size: 32rpx;
      font-weight: 700;
      margin-top: 12rpx;
      text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.10);
    }
  }
}
.resume-stat-card {
  background: #fff;
  border-radius: 20rpx;
  margin: -40rpx 32rpx 24rpx 32rpx;
  padding: 32rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0,198,177,0.06);
  .stat-num {
    color: #00c6b1;
    font-size: 48rpx;
    font-weight: 700;
    margin-bottom: 8rpx;
  }
  .stat-label {
    color: #333;
    font-size: 24rpx;
  }
}
.mine-list {
  background: #fff;
  border-radius: 20rpx;
  margin: 0 32rpx 24rpx 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,198,177,0.04);
  .mine-list-item {
    display: flex;
    align-items: center;
    padding: 0 32rpx;
    height: 96rpx;
    border-bottom: 1rpx solid #f0f0f0;
    .item-icon {
      width: 40rpx;
      height: 40rpx;
      margin-right: 24rpx;
    }
    .item-title {
      flex: 1;
      font-size: 28rpx;
      color: #333;
    }
    &:last-child {
      border-bottom: none;
    }
  }
}
.mine-bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 20rpx;
  margin: 0 32rpx 0 32rpx;
  padding: 24rpx 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,198,177,0.04);
  .left-tag {
    background: #00c6b1;
    color: #fff;
    border-radius: 24rpx;
    padding: 8rpx 20rpx;
    font-size: 22rpx;
    margin-right: 16rpx;
  }
  .desc {
    color: #999;
    font-size: 22rpx;
    flex: 1;
  }
  .follow-btn {
    background: linear-gradient(90deg, #00c6b1 0%, #00e6d8 100%);
    color: #fff;
    border-radius: 24rpx;
    font-size: 24rpx;
    padding: 8rpx 32rpx;
    border: none;
    margin-left: 16rpx;
  }
}
</style> 