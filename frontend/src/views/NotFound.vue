<template>
  <div class="not-found-container">
    <h1>404</h1>
    <h2>页面未找到</h2>
    <p>抱歉，您访问的页面不存在或已被删除。</p>
    <div class="back-home">
      <a href="/" @click.prevent="goHome">返回首页</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};
</script>

<style scoped>
.not-found-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  text-align: center;
  padding: 60px 20px;
}

h1 {
  font-size: 6rem;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 20px;
}

h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 15px;
}

p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 30px;
}

.back-home a {
  display: inline-block;
  background-color: #409eff;
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 16px;
  transition: all 0.3s;
}

.back-home a:hover {
  background-color: #66b1ff;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}
</style>
