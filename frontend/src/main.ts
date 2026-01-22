import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useUserStore } from './stores/user';

// 创建 Vue 应用实例
const app = createApp(App);

// 使用 Pinia 状态管理
const pinia = createPinia();
app.use(pinia);

// 使用路由
app.use(router);

// 初始化用户状态 - 恢复登录状态
const userStore = useUserStore();
userStore.init();

// 挂载应用
app.mount('#app');
