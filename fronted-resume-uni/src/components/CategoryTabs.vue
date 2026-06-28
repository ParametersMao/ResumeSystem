<template>
  <scroll-view class="cat-tabs" scroll-x>
    <view v-for="(tab, idx) in tabs" :key="tab" :class="['cat-tab', idx===active?'active':'']" @tap="$emit('change', idx)">
      {{ tab }}
    </view>
  </scroll-view>
</template>
<script setup>
const props = defineProps({ tabs: Array, active: Number });
</script>
<style scoped>
.cat-tabs {
  display: flex;
  white-space: nowrap;
  margin-bottom: 16rpx;
  padding-left: 8rpx;
}
.cat-tab {
  display: inline-block;
  padding: 8rpx 24rpx;
  margin-right: 12rpx;
  border-radius: 32rpx;
  background: #f6f6f6;
  color: #00c6b1;
  font-size: 22rpx;
}
.cat-tab.active {
  background: #00c6b1;
  color: #fff;
}
</style> 