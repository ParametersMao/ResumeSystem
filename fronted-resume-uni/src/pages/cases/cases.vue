<template>
  <view class="cases-page">
    <!-- 顶部三分布局主tab栏 -->
    <view class="cases-header">
      <view class="header-item search-btn" @tap="goSearch">
        <UniIcons type="search" size="28" color="#00c6b1" />
      </view>
      <view
        class="header-item tab-btn left-tab"
        :class="{active: mainTab === 0}"
        @tap="onMainTabChange(0)"
      >实习简历</view>
      <view
        class="header-item tab-btn right-tab"
        :class="{active: mainTab === 1}"
        @tap="onMainTabChange(1)"
      >校招社招</view>
    </view>
    <view class="tabs-separator"></view>
    <!-- 横向小tab -->
    <CategoryTabs :tabs="catTabs" :active="catTab" @change="onCatTabChange" />
    <!-- 卡片列表 -->
    <view class="cases-list">
      <view class="cases-row" v-for="row in cardRows" :key="row[0]?.title">
        <CaseCard v-for="card in row" :key="card.title" :title="card.title" :img="card.img" :downloads="card.downloads" @click="onCardClick(card)" />
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import UniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';
import CategoryTabs from '@/components/CategoryTabs.vue';
import CaseCard from '@/components/CaseCard.vue';

const mainTab = ref(0);
const catTabs = ref(['人事/财务/行政','教育培训','医疗健康','销售']);
const catTab = ref(0);

function onMainTabChange(idx) { mainTab.value = idx; }
function onCatTabChange(idx) { catTab.value = idx; }
function goSearch() { uni.navigateTo({ url: '/pages/cases/search' }); }

// 模拟卡片数据（占位图）
const cards = ref([
  { title: '财务审计', img: '/static/logo.png', downloads: 492665 },
  { title: '会计', img: '/static/logo.png', downloads: 271941 },
  { title: '人事专员', img: '/static/logo.png', downloads: 123456 },
  { title: '行政助理', img: '/static/logo.png', downloads: 654321 },
]);

// 每行2个卡片
const cardRows = computed(() => {
  const rows = [];
  for(let i=0; i<cards.value.length; i+=2) {
    rows.push(cards.value.slice(i,i+2));
  }
  return rows;
});

function onCardClick(card) {
  uni.showToast({ title: `点击了${card.title}`, icon: 'none' });
}
</script>

<style scoped>
.cases-page {
  min-height: 100vh;
  background: #f8f8f8;
  padding-bottom: 120rpx;
}
.cases-header {
  display: flex;
  align-items: center;
  padding: 24rpx 0 0 0;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}
.header-item {
  text-align: center;
  font-size: 30rpx;
  color: #333;
  padding: 18rpx 0;
  position: relative;
}
.search-btn {
  flex-basis: 20%;
  max-width: 20%;
  min-width: 20%;
  text-align: center;
  padding: 0;
}
.left-tab, .right-tab {
  flex-basis: 40%;
  max-width: 40%;
  min-width: 40%;
}
.tab-btn.active {
  color: #00c6b1;
  font-weight: 700;
}
.tab-btn.active::after {
  content: '';
  display: block;
  width: 60rpx;
  height: 6rpx;
  background: #00c6b1;
  border-radius: 3rpx;
  margin: 8rpx auto 0 auto;
}
.tabs-separator {
  height: 28rpx;
}
.cases-list {
  padding: 0 16rpx;
}
.cases-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 16rpx;
}
</style> 