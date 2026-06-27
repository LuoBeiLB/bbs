<template>
  <div class="app-container">
    <!-- 导航栏 -->
    <Navbar />
    
    <!-- 主内容区域 -->
    <main class="main-content">
      <router-view />
    </main>
    
    <!-- AI聊天组件 -->
    <AiChat />
  </div>
</template>

<script setup lang="ts">
import Navbar from './components/Navbar.vue';
import AiChat from './components/AiChat.vue';
// App 根组件
</script>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

.main-content {
  padding: 20px;
  min-height: calc(100vh - 60px);
}

/* 链接样式 */
a {
  color: #409eff;
  text-decoration: none;
}

a:hover {
  color: #66b1ff;
}

/* 按钮样式 */
button {
  cursor: pointer;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  transition: all 0.3s;
}

button.primary {
  background-color: #409eff;
  color: white;
}

button.primary:hover {
  background-color: #66b1ff;
}

button.secondary {
  background-color: #6c757d;
  color: white;
}

button.secondary:hover {
  background-color: #868e96;
}

/* 卡片样式 */
.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

/* 表单样式 */
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}
</style>
