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
      
      <!-- 成功消息 -->
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
          <label for="avatar" class="form-label">头像（可选）</label>
          <el-upload
            class="avatar-uploader"
            name="avatar"
            action="/api/upload/avatar"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleAvatarUploadSuccess"
            :on-error="handleAvatarUploadError"
            :before-upload="beforeAvatarUpload"
          >
            <el-avatar
              v-if="formData.avatar || profile?.avatar"
              :size="100"
              :src="`http://localhost:3001`+formData.avatar || profile?.avatar"
              :alt="formData.nickname || profile?.nickname"
            />
            
            <div v-else class="avatar-uploader-icon">
              <el-icon><Plus /></el-icon>
            </div>
            
          </el-upload>
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
    
    <!-- 我的文章 -->
    <div v-if="!loading && !error" class="articles-card">
      <h2>我的文章</h2>
      
      <!-- 文章列表 -->
      <div v-if="userArticles.length > 0" class="articles-list">
        <div v-for="article in userArticles" :key="article.id" class="article-item">
          <div class="article-info">
            <h3 class="article-title">
              <router-link :to="`/articles/${article.id}`">{{ article.title }}</router-link>
            </h3>
            <div class="article-meta">
              <span class="article-date">{{ formatDate(article.createdAt) }}</span>
              <span class="article-views">{{ article.views || 0 }} 阅读</span>
              <span class="article-likes">{{ article.likes || 0 }} 点赞</span>
              <span class="article-comments">{{ article.comments || 0 }} 评论</span>
            </div>
          </div>
          <div class="article-actions">
            <button 
              class="btn btn-danger" 
              @click="handleDeleteArticle(article.id)"
              :disabled="deleteLoading"
            >
              {{ deleteLoading ? '删除中...' : '删除' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- 无文章提示 -->
      <div v-else-if="!articlesLoading" class="no-articles">
        您还没有发表过文章
      </div>
      
      <!-- 文章加载状态 -->
      <div v-if="articlesLoading" class="loading">
        加载文章中...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { apiService } from '@/services/api';
import { storeToRefs } from 'pinia';
import type { UpdateUserDto } from '@/../shared/User';
import { Plus } from '@element-plus/icons-vue';

const router = useRouter();
const userStore = useUserStore();

// 成功消息
const successMessage = ref('');

// 从 store 中获取响应式状态
const { loading, error, profile } = storeToRefs(userStore);
const updateLoading = ref(false);

// 文章相关状态
const userArticles = ref<Article[]>([]);
const articlesLoading = ref(false);
const deleteLoading = ref(false);

// 上传头信息
const uploadHeaders = computed(() => {
  const token = window.localStorage.getItem('accessToken');
  return {
    'Authorization': `Bearer ${token}`
  };
});

// 处理头像上传成功
const handleAvatarUploadSuccess = (response: any) => {
  formData.avatar = response.url;
  console.log(response.url);
  successMessage.value = '头像上传成功';
  setTimeout(() => {
    successMessage.value = '';
  }, 3000);
};

// 处理头像上传失败
const handleAvatarUploadError = () => {
  successMessage.value = '头像上传失败，请重试';
  setTimeout(() => {
    successMessage.value = '';
  }, 3000);
};

// 上传前验证
const beforeAvatarUpload = (file: File) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif';
  if (!isJpgOrPng) {
    successMessage.value = '只支持 JPEG、PNG 和 GIF 格式的图片';
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
    return false;
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    successMessage.value = '图片大小不能超过 2MB';
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
    return false;
  }
  return true;
};

// 表单数据
const formData = reactive<UpdateUserDto>({
  nickname: '',
  avatar: '',
  phone: '',
  bio: '',
});

// 加载用户资料和文章
onMounted(async () => {
  await userStore.getProfile();
  // 初始化表单数据
  if (profile.value) {
    formData.nickname = profile.value.nickname;
    formData.avatar = profile.value.avatar;
    formData.phone = profile.value.phone;
    formData.bio = profile.value.bio;
  }
  // 加载用户文章
  await loadUserArticles();
});

// 加载用户文章
const loadUserArticles = async () => {
  articlesLoading.value = true;
  try {
    const response = await apiService.user.getArticles();
    userArticles.value = response.data;
  } catch (err) {
    console.error('获取用户文章失败:', err);
  } finally {
    articlesLoading.value = false;
  }
};

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

// 处理删除文章
const handleDeleteArticle = async (articleId: string) => {
  if (confirm('确定要删除这篇文章吗？')) {
    deleteLoading.value = true;
    try {
      await apiService.article.delete(articleId);
      // 从列表中移除文章
      userArticles.value = userArticles.value.filter(article => article.id !== articleId);
      successMessage.value = '文章删除成功';
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    } catch (err) {
      console.error('删除文章失败:', err);
      successMessage.value = '删除文章失败，请重试';
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    } finally {
      deleteLoading.value = false;
    }
  }
};

// 处理退出登录
const handleLogout = () => {
  userStore.logout();
  // 退出登录后跳转到登录页
  router.push('/login');
};

// 格式化日期
const formatDate = (dateString: Date) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
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
  margin-bottom: 30px;
}

.articles-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 40px;
  margin-bottom: 30px;
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

.loading, .error, .no-articles {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
}

.error {
  color: #f56c6c;
}

.no-articles {
  color: #909399;
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

.btn-danger {
  background-color: #f56c6c;
  color: white;
}

.btn-danger:hover {
  background-color: #f78989;
}

.btn:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.avatar-uploader {
  margin-top: 10px;
}

.avatar-uploader-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 1px dashed #d9d9d9;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  cursor: pointer;
  transition: border-color 0.3s;
}

.avatar-uploader-icon:hover {
  border-color: #409eff;
}

.avatar-uploader-icon .el-icon {
  font-size: 24px;
  color: #8c939d;
}

/* 文章列表样式 */
.articles-list {
  margin-top: 20px;
}

.article-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s;
}

.article-item:hover {
  background-color: #f9f9f9;
}

.article-info {
  flex: 1;
}

.article-title {
  font-size: 1.2rem;
  margin-bottom: 10px;
  font-weight: 600;
}

.article-title a {
  color: #333;
  text-decoration: none;
  transition: color 0.3s;
}

.article-title a:hover {
  color: #409eff;
}

.article-meta {
  display: flex;
  gap: 15px;
  font-size: 0.9rem;
  color: #909399;
}

.article-actions {
  margin-left: 20px;
}

@media (max-width: 768px) {
  .article-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .article-actions {
    margin-left: 0;
    align-self: flex-start;
  }
  
  .article-meta {
    flex-wrap: wrap;
    gap: 10px;
  }
}
</style>