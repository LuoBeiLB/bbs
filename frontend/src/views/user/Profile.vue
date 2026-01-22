<template>
  <div class="profile-container">
    <h1>个人中心</h1>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      加载中...
    </div>
    
    <!-- 错误提示 -->
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <!-- 个人资料表单 -->
    <div v-else-if="profile" class="profile-card">
      <h2>编辑个人资料</h2>
      
      <!-- 成功提示 -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      
      <form @submit.prevent="handleUpdate">
        <div class="form-group">
          <label for="email" class="form-label">邮箱</label>
          <input
            type="email"
            id="email"
            :value="profile.email"
            class="form-control"
            disabled
          />
          <small class="form-text">邮箱不可修改</small>
        </div>
        
        <div class="form-group">
          <label for="nickname" class="form-label">昵称</label>
          <input
            type="text"
            id="nickname"
            v-model="formData.nickname"
            class="form-control"
            placeholder="请输入昵称"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="avatar" class="form-label">头像 URL（可选）</label>
          <input
            type="url"
            id="avatar"
            v-model="formData.avatar"
            class="form-control"
            placeholder="请输入头像 URL"
          />
        </div>
        
        <div class="form-group">
          <label for="phone" class="form-label">手机号（可选）</label>
          <input
            type="tel"
            id="phone"
            v-model="formData.phone"
            class="form-control"
            placeholder="请输入手机号"
          />
        </div>
        
        <div class="form-group">
          <label for="bio" class="form-label">个人简介（可选）</label>
          <textarea
            id="bio"
            v-model="formData.bio"
            class="form-control"
            placeholder="请输入个人简介"
            rows="4"
          ></textarea>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="updateLoading">
            {{ updateLoading ? '更新中...' : '保存修改' }}
          </button>
          <button type="button" class="btn btn-secondary" @click="handleLogout">
            退出登录
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';
import type { UpdateUserDto } from '@tech-community/shared';

const router = useRouter();
const userStore = useUserStore();

// 成功消息
const successMessage = ref('');

// 从 store 中获取响应式状态
const { loading, error, profile } = storeToRefs(userStore);
const updateLoading = ref(false);

// 表单数据
const formData = reactive<UpdateUserDto>({
  nickname: '',
  avatar: '',
  phone: '',
  bio: '',
});

// 加载用户资料
onMounted(async () => {
  await userStore.getProfile();
  // 初始化表单数据
  if (profile.value) {
    formData.nickname = profile.value.nickname;
    formData.avatar = profile.value.avatar;
    formData.phone = profile.value.phone;
    formData.bio = profile.value.bio;
    formData.bio = profile.bio;
  }
});

// 处理资料更新
const handleUpdate = async () => {
  updateLoading.value = true;
  successMessage.value = '';
  
  try {
    await userStore.updateProfile(formData);
    successMessage.value = '个人资料更新成功';
    // 3秒后清除成功消息
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (err) {
    console.error('Update profile failed:', err);
  } finally {
    updateLoading.value = false;
  }
};

// 处理退出登录
const handleLogout = () => {
  userStore.logout();
  // 退出登录后跳转到登录页
  router.push('/login');
};
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 40px;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 30px;
  color: #333;
  text-align: center;
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 30px;
  color: #409eff;
  border-bottom: 2px solid #409eff;
  padding-bottom: 10px;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
}

.error {
  color: #f56c6c;
}

.success-message {
  background-color: #f0f9eb;
  color: #67c23a;
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

.form-control:disabled {
  background-color: #f5f7fa;
  cursor: not-allowed;
}

.form-text {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

.btn {
  padding: 12px 24px;
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

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #868e96;
}

.btn:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}
</style>
