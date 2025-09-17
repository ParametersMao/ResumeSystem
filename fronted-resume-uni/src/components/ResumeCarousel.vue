<template>
  <swiper
    class="carousel"
    :indicator-dots="true"
    :autoplay="false"
    :circular="true"
    :current="current"
    @change="onChange"
  >
    <swiper-item v-for="(item, idx) in templates" :key="item.id">
      <view class="carousel-item" @tap="onClick(item)">
        <image :src="item.img" class="carousel-img" mode="widthFix" />
        <view class="carousel-title">{{ item.title }}</view>
      </view>
    </swiper-item>
  </swiper>
</template>

<script setup>
import { ref } from 'vue';
const props = defineProps({
  templates: Array
});
const emit = defineEmits(['templateClick']);
const current = ref(0);
function onChange(e) {
  current.value = e.detail.current;
}
function onClick(item) {
  emit('templateClick', item);
}
</script>

<style scoped>
.carousel {
  width: 100%;
  height: 500rpx;
}
.carousel-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.carousel-img {
  width: 90%;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.08);
}
.carousel-title {
  text-align: center;
  font-size: 28rpx;
  color: #333;
  margin-top: 16rpx;
}
</style> 