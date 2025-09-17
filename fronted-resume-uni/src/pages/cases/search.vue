<template>
  <view class="search-page">
    <view class="search-bar">
      <input v-model="keyword" class="search-input" placeholder="请输入关键字" />
      <button class="search-btn" @tap="doSearch">搜索</button>
    </view>
    <!-- 可扩展：搜索历史、热搜、结果等 -->
  </view>
</template>
<script setup>
import { ref } from 'vue';
const keyword = ref('');
function doSearch() { uni.showToast({ title: `搜索：${keyword.value}`, icon: 'none' }); }
</script>
<style scoped>
.search-page { min-height: 100vh; background: #f8f8f8; }
.search-bar { display: flex; align-items: center; padding: 32rpx; }
.search-input { flex: 1; border: 1rpx solid #eee; border-radius: 32rpx; font-size: 28rpx; padding: 16rpx 24rpx; background: #fff; margin-right: 16rpx; }
.search-btn { background: #00c6b1; color: #fff; border: none; border-radius: 32rpx; font-size: 28rpx; padding: 16rpx 40rpx; }
</style> 