<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>注册</h2>
      
      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <!-- 注册表单 -->
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="email" class="form-label">邮箱</label>
          <input
            type="email"
            id="email"
            v-model="email"
            class="form-control"
            placeholder="请输入邮箱"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password" class="form-label">密码</label>
          <input
            type="password"
            id="password"
            v-model="password"
            class="form-control"
            placeholder="请输入密码（至少6位）"
            required
            minlength="6"
          />
        </div>
        
        <div class="form-group">
          <label for="nickname" class="form-label">昵称</label>
          <input
            type="text"
            id="nickname"
            v-model="nickname"
            class="form-control"
            placeholder="请输入昵称"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="phone" class="form-label">手机号（可选）</label>
          <input
            type="tel"
            id="phone"
            v-model="phone"
            class="form-control"
            placeholder="请输入手机号"
          />
        </div>
        
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>
      
      <!-- 登录链接 -->
      <div class="login-link">
        已有账号？ <a href="/login">立即登录</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';

const router = useRouter();
const userStore = useUserStore();

// 表单数据
const email = ref('');
const password = ref('');
const nickname = ref('');
const phone = ref('');

// 从 store 中获取响应式状态
const { loading, error } = storeToRefs(userStore);

// 处理注册
const handleRegister = async () => {
  try {
    await userStore.register(email.value, password.value, nickname.value, phone.value || undefined);
    // 注册成功后跳转到首页
    router.push('/');
  } catch (err) {
    console.error('Register failed:', err);
    // 错误信息已经在 store 中处理
  }
};
</script>

<style scoped>
/* 样式与登录页面基本相同，复用样式 */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 40px 0;
}

.auth-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 30px;
  color: #333;
  text-align: center;
}

.error-message {
  background-color: #fef0f0;
  color: #f56c6c;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 12px;
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

.btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #409eff;
  color: white;
}

.btn-primary:hover {
  background-color: #66b1ff;
}

.btn:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.login-link {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.login-link a {
  color: #409eff;
  text-decoration: none;
}

.login-link a:hover {
  color: #66b1ff;
}
</style>
