<template>
  <div class="article-detail-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      加载中...
    </div>
    
    <!-- 错误提示 -->
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <!-- 文章详情 -->
    <div v-else-if="article" class="article-detail">
      <h1>{{ article.title }}</h1>
      
      <!-- 文章元信息 -->
      <div class="article-meta">
        <div class="author-info">
          <span class="author-name">{{ article.author.nickname }}</span>
          <span class="publish-time">{{ formatDate(article.createdAt) }}</span>
        </div>
        <div class="article-stats">
          <span class="views">{{ article.views }} 阅读</span>
          <span class="likes">{{ article.likes }} 点赞</span>
          <span class="comments">{{ article.comments }} 评论</span>
        </div>
      </div>
      
      <!-- 文章标签 -->
      <div class="article-tags">
        <span v-for="tag in article.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
      
      <!-- 文章内容 -->
      <div class="article-content">
        <!-- 注意：实际项目中需要使用 Markdown 解析器来渲染文章内容 -->
        <p>{{ article.content }}</p>
      </div>
      
      <!-- 返回列表链接 -->
      <div class="back-link">
        <a href="/" @click.prevent="navigateBack">返回首页</a>
      </div>
      
      <!-- 评论区域 -->
      <div class="comments-section">
        <h2 class="comments-title">评论 ({{ article.comments }})</h2>
        
        <!-- 评论表单 -->
        <div class="comment-form-container">
          <h3>发表评论</h3>
          <div v-if="userStore.isLoggedIn" class="comment-form">
            <textarea
              v-model="commentContent"
              class="comment-textarea"
              placeholder="请输入你的评论..."
              rows="4"
              required
            ></textarea>
            <div class="comment-form-actions">
              <button 
                type="button" 
                class="btn btn-primary" 
                :disabled="commentLoading"
                @click="handleCommentSubmit"
              >
                {{ commentLoading ? '发布中...' : '发布评论' }}
              </button>
            </div>
          </div>
          <div v-else class="login-prompt">
            <p>请先 <a href="/login" @click.prevent="navigateToLogin">登录</a> 后再发表评论</p>
          </div>
        </div>
        
        <!-- 评论列表 -->
        <div class="comments-list">
          <!-- 评论加载状态 -->
          <div v-if="commentLoading && comments.length === 0" class="loading">
            加载评论中...
          </div>
          
          <!-- 评论错误信息 -->
          <div v-else-if="commentError" class="error-message">
            {{ commentError }}
          </div>
          
          <!-- 无评论提示 -->
          <div v-else-if="comments.length === 0" class="no-comments">
            暂无评论，快来发表第一条评论吧！
          </div>
          
          <!-- 评论列表 -->
          <div v-else>
            <div 
              v-for="comment in comments" 
              :key="comment.id" 
              class="comment-item"
            >
              <div class="comment-header">
                <div class="comment-author">
                  <span class="author-name">{{ comment.author.nickname }}</span>
                  <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <button 
                  v-if="userStore.isLoggedIn && userStore.user?.id === comment.authorId" 
                  class="btn btn-delete" 
                  @click="handleDeleteComment(comment.id)"
                >
                  删除
                </button>
              </div>
              <div class="comment-content">
                <p>{{ comment.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useArticleStore } from '@/stores/article';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';

const route = useRoute();
const router = useRouter();
const articleStore = useArticleStore();
const userStore = useUserStore();

// 评论内容
const commentContent = ref('');

// 从 store 中获取响应式状态
const { currentArticle, loading, error, comments, commentLoading, commentError } = storeToRefs(articleStore);

// 使用 computed 映射 article
const article = computed(() => currentArticle.value);

// 获取文章 ID
const articleId = computed(() => route.params.id as string);

// 加载文章详情和评论
onMounted(async () => {
  try {
    // 并行加载文章详情和评论
    await Promise.all([
      articleStore.getArticleById(articleId.value),
      articleStore.getComments(articleId.value)
    ]);
  } catch (err) {
    console.error('Failed to load article or comments:', err);
  }
});

// 导航返回
const navigateBack = () => {
  router.push('/');
};

// 导航到登录页面
const navigateToLogin = () => {
  router.push('/login');
};

// 处理评论提交
const handleCommentSubmit = async () => {
  if (!commentContent.value.trim()) return;
  
  try {
    await articleStore.createComment({
      content: commentContent.value.trim(),
      articleId: articleId.value
    });
    // 清空评论输入框
    commentContent.value = '';
  } catch (err) {
    console.error('Failed to submit comment:', err);
  }
};

// 处理删除评论
const handleDeleteComment = async (commentId: string) => {
  try {
    await articleStore.deleteComment(commentId);
  } catch (err) {
    console.error('Failed to delete comment:', err);
  }
};

// 格式化日期
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<style scoped>
.article-detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.article-detail {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 40px;
}

h1 {
  font-size: 2.2rem;
  margin-bottom: 20px;
  color: #333;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.author-name {
  font-weight: 500;
  color: #409eff;
}

.publish-time {
  color: #909399;
  font-size: 0.9rem;
}

.article-stats {
  display: flex;
  gap: 20px;
  color: #909399;
  font-size: 0.9rem;
}

.article-tags {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.tag {
  background-color: #ecf5ff;
  color: #409eff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.article-content {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
  margin-bottom: 40px;
}

.article-content p {
  margin-bottom: 1.5rem;
}

.back-link {
  text-align: center;
  margin-top: 30px;
}

.back-link a {
  color: #409eff;
  text-decoration: none;
  font-size: 1.1rem;
}

.back-link a:hover {
  color: #66b1ff;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
}

.error {
  color: #f56c6c;
}

/* 评论区域样式 */
.comments-section {
  margin-top: 60px;
  padding-top: 40px;
  border-top: 1px solid #e0e0e0;
}

.comments-title {
  font-size: 1.8rem;
  margin-bottom: 30px;
  color: #333;
}

/* 评论表单样式 */
.comment-form-container {
  margin-bottom: 40px;
}

.comment-form-container h3 {
  font-size: 1.4rem;
  margin-bottom: 20px;
  color: #409eff;
}

.comment-form {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}

.comment-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  margin-bottom: 15px;
}

.comment-textarea:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.comment-form-actions {
  text-align: right;
}

.login-prompt {
  background-color: #f0f9eb;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e1f3d8;
}

.login-prompt p {
  margin: 0;
  color: #67c23a;
}

.login-prompt a {
  color: #409eff;
  text-decoration: none;
  font-weight: 500;
}

.login-prompt a:hover {
  text-decoration: underline;
}

/* 评论列表样式 */
.comments-list {
  margin-top: 40px;
}

.no-comments {
  text-align: center;
  padding: 40px;
  color: #909399;
  background-color: #fafafa;
  border-radius: 8px;
}

.comment-item {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.comment-author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.comment-author .author-name {
  font-weight: 500;
  color: #409eff;
}

.comment-time {
  color: #909399;
  font-size: 0.9rem;
}

.comment-content {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #333;
}

.comment-content p {
  margin: 0;
}

.btn-delete {
  background-color: #f56c6c;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-delete:hover {
  background-color: #f78989;
}

/* 错误消息样式 */
.error-message {
  background-color: #fef0f0;
  color: #f56c6c;
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}
</style>
