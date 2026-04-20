import { defineStore } from 'pinia';
export const useAppStore = defineStore('app', {
    state: () => ({
        loading: false,
        loadingText: '加载中...',
        loadingCount: 0
    }),
    actions: {
        /** 显示全局 loading（支持多次调用计数，全部关闭后才隐藏） */
        showLoading(text) {
            if (text)
                this.loadingText = text;
            this.loadingCount++;
            this.loading = true;
        },
        /** 隐藏全局 loading */
        hideLoading() {
            this.loadingCount = Math.max(0, this.loadingCount - 1);
            if (this.loadingCount === 0) {
                this.loading = false;
            }
        },
        /** 强制关闭所有 loading */
        forceHideLoading() {
            this.loadingCount = 0;
            this.loading = false;
        }
    }
});
