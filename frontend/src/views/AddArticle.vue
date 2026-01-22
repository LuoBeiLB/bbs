<template>
  <div class="add-article-container">
    <h1>发布文章</h1>
    
    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <!-- 成功提示 -->
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
    
    <!-- 文章表单 -->
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="title" class="form-label">文章标题</label>
        <input
          type="text"
          id="title"
          v-model="formData.title"
          class="form-control"
          placeholder="请输入文章标题"
          required
          maxlength="100"
        />
        <small class="form-text">最多100个字符</small>
      </div>
      
      <div class="form-group">
        <label for="summary" class="form-label">文章摘要</label>
        <textarea
          id="summary"
          v-model="formData.summary"
          class="form-control"
          placeholder="请输入文章摘要"
          rows="3"
          required
          maxlength="200"
        ></textarea>
        <small class="form-text">最多200个字符</small>
      </div>
      
      <div class="form-group">
        <label for="content" class="form-label">文章内容</label>
        <textarea
          id="content"
          v-model="formData.content"
          class="form-control"
          placeholder="请输入文章内容"
          rows="10"
          required
        ></textarea>
      </div>
      
      <div class="form-group">
        <label for="tags" class="form-label">文章标签</label>
        <input
          type="text"
          id="tags"
          v-model="tagsInput"
          class="form-control"
          placeholder="请输入标签，用逗号分隔"
        />
        <small class="form-text">例如：前端, Vue, JavaScript</small>
      </div>
      
      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? '发布中...' : '发布文章' }}
        </button>
        <router-link to="/" class="btn btn-secondary">
          取消
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useArticleStore } from '@/stores/article';
import { storeToRefs } from 'pinia';
import type { CreateArticleDto } from '@tech-community/shared';

const router = useRouter();
const articleStore = useArticleStore();

// 成功消息
const successMessage = ref('');

// 表单数据
const formData = reactive<CreateArticleDto>({
  title: '',
  summary: '',
  content: '',
  tags: [],
});

// 标签输入
const tagsInput = ref('');

// 监听标签输入变化
watch(tagsInput, (newValue) => {
  // 将逗号分隔的标签转换为数组
  formData.tags = newValue
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag !== '');
});

// 从 store 中获取响应式状态
const { loading, error } = storeToRefs(articleStore);

// 处理表单提交
const handleSubmit = async () => {
  try {
    await articleStore.createArticle(formData);
    successMessage.value = '文章发布成功！';
    
    // 3秒后跳转到首页
    setTimeout(() => {
      router.push('/');
    }, 1500);
  } catch (err) {
    console.error('发布文章失败:', err);
  }
};
</script>

<style scoped>
.add-article-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
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
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.form-text {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #999;
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
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background-color: #409eff;
  color: white;
}

.btn-primary:hover {
  background-color: #66b1ff;
}

.btn-primary:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #868e96;
}

.success-message {
  background-color: #f0f9eb;
  color: #67c23a;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.error-message {
  background-color: #fef0f0;
  color: #f56c6c;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}
</style>