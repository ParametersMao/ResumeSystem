<template>
  <view class="case-card" @tap="$emit('click')">
    <image class="case-img" :src="img" mode="widthFix" />
    <view class="case-title">{{ title }}</view>
    <view class="case-footer">
      <UniIcons type="download" size="18" color="#999" />
      <text class="downloads">{{ downloads }}</text>
    </view>
  </view>
</template>

<script setup>
import UniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';
const props = defineProps({
  title: String,
  img: String,
  downloads: [String, Number],
  desc: String
});
</script>

<style scoped>
.case-card {
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
  margin-bottom: 24rpx;
  padding: 24rpx 16rpx 16rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.case-img {
  width: 100%;
  border-radius: 8rpx;
  margin-bottom: 12rpx;
}
.case-title {
  font-size: 28rpx;
  color: #222;
  font-weight: 600;
  margin-bottom: 8rpx;
  text-align: center;
}
.case-footer {
  display: flex;
  align-items: center;
  color: #999;
  font-size: 22rpx;
  justify-content: center;
}
.downloads {
  margin-left: 8rpx;
}
</style> 