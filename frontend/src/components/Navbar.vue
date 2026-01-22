<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- Logo 和网站名称 -->
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">
          <h1 class="brand-name">技术社区平台</h1>
        </router-link>
      </div>
      
      <!-- 主导航菜单 -->
      <div class="navbar-menu">
        <router-link 
          to="/" 
          class="nav-link" 
          :class="{ active: $route.path === '/' }"
        >
          首页
        </router-link>
        <router-link 
          to="/recommended" 
          class="nav-link" 
          :class="{ active: $route.path === '/recommended' }"
        >
          推荐文章
        </router-link>
      </div>
      
      <!-- 用户操作菜单 -->
      <div class="navbar-actions">
        <router-link 
          to="/login" 
          class="nav-button" 
          v-if="!isLoggedIn"
        >
          登录
        </router-link>
        <router-link 
          to="/register" 
          class="nav-button primary" 
          v-if="!isLoggedIn"
        >
          注册
        </router-link>
        <div v-else>
        <router-link 
          to="/articles/add" 
          class="nav-button primary" 
        >
          发布文章
        </router-link>
        <router-link 
          to="/user/profile" 
          class="nav-button" 
        >
          个人中心
        </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';

const userStore = useUserStore();
// 从用户状态获取响应式的登录状态
const { isLoggedIn } = storeToRefs(userStore);
</script>

<style scoped>
.navbar {
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.navbar-brand {
  flex: 1;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.brand-name {
  font-size: 1.5rem;
  color: #409eff;
  margin: 0;
  font-weight: 600;
}

.navbar-menu {
  flex: 2;
  display: flex;
  justify-content: center;
  gap: 30px;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.3s;
  position: relative;
}

.nav-link:hover {
  color: #409eff;
}

.nav-link.active {
  color: #409eff;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -18px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #409eff;
  border-radius: 2px;
}

.navbar-actions {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.nav-button {
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s;
  border: 1px solid #dcdfe6;
  background-color: white;
  color: #333;
}

.nav-button:hover {
  border-color: #409eff;
  color: #409eff;
}

.nav-button.primary {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}

.nav-button.primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
  color: white;
}
</style>