<template>
  <scroll-view class="h-tabs" scroll-x>
    <view v-for="(tab, idx) in tabs" :key="tab" :class="['h-tab', idx===active?'active':'']" @tap="$emit('change', idx)">
      {{ tab }}
    </view>
  </scroll-view>
</template>
<script setup>
const props = defineProps({ tabs: Array, active: Number });
</script>
<style scoped>
.h-tabs { display: flex; white-space: nowrap; }
.h-tab { display: inline-block; padding: 16rpx 40rpx; margin-right: 16rpx; border-radius: 32rpx; background: #f2f2f2; color: #00c6b1; font-size: 28rpx; }
.h-tab.active { background: #00c6b1; color: #fff; }
</style> 