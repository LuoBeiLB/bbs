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
          <button 
            class="like-button" 
            :class="{ liked: isLiked }"
            @click.stop="handleLike"
            :disabled="!userStore.isLoggedIn"
          >
            <span class="like-icon">{{ isLiked ? '❤️' : '🤍' }}</span>
            <span class="likes">{{ article.likes }} 点赞</span>
          </button>
          <span class="comments">{{ article.comments }} 评论</span>
        </div>
      </div>
      
      <!-- 文章标签 -->
      <div class="article-tags">
        <span v-for="tag in article.tags" :key="tag.id" class="tag">{{ tag.name }}</span>
      </div>
      
      <!-- 文章内容 -->
      <div class="article-content markdown-content" v-html="renderMarkdown(article.content)">
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
                  <div class="author-avatar">
                    <img 
                      :src="comment.author.avatar ? `http://localhost:3001${comment.author.avatar}` : '/src/pic/default.png'" 
                      :alt="comment.author.nickname"
                      class="avatar-image"
                    />
                    
                  </div>
                  <div class="author-info">
                    <span class="author-name">{{ comment.author.nickname }}</span>
                    <span class="author-bio">{{ comment.author.bio }}</span>
                    <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
                    
                  </div>
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
import { Marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

// 配置 marked
const marked = new Marked({
  gfm: true,
  breaks: true,
});

marked.use({
  renderer: {
    code(this: any, token: { lang?: string; text: string }) {
      const lang = token.lang || 'plaintext';
      const code = token.text;

      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      const highlighted = hljs.highlight(code, { language }).value;

      return `<pre><code class="hljs ${language}">${highlighted}</code></pre>`;
    },
  },
});

// 渲染 Markdown
const renderMarkdown = (content: string) => {
  return marked.parse(content);
};

const route = useRoute();
const router = useRouter();
const articleStore = useArticleStore();
const userStore = useUserStore();

// 评论内容
const commentContent = ref('');

// 从 store 中获取响应式状态
const { currentArticle, loading, error, comments, commentLoading, commentError, likedArticles } = storeToRefs(articleStore);

// 使用 computed 映射 article
const article = computed(() => currentArticle.value);

// 计算当前文章是否已点赞
const isLiked = computed(() => {
  return article.value ? likedArticles.value.includes(article.value.id) : false;
});

// 获取文章 ID
const articleId = computed(() => route.params.id as string);

// 加载文章详情和评论
onMounted(async () => {
  try {
    // 并行加载文章详情、评论和点赞列表
    const promises:Promise<unknown>[] = [
      articleStore.getArticleById(articleId.value),
      articleStore.getComments(articleId.value)
    ];
    
    // 如果用户已登录，加载点赞列表
    if (userStore.isLoggedIn) {
      promises.push(articleStore.getLikedArticles());
    }
    
    await Promise.all(promises);
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

// 处理点赞
const handleLike = async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }
  
  try {
    await articleStore.toggleLike(articleId.value);
  } catch (err) {
    console.error('点赞失败:', err);
  }
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
.author-bio{
  font-size: 0.9rem;
  color: #909399;
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
  align-items: center;
  gap: 20px;
  color: #909399;
  font-size: 0.9rem;
}

.like-button {
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  color: #909399;
  font-size: 0.9rem;
  padding: 5px 10px;
  border-radius: 20px;
  transition: all 0.3s;
}

.like-button:hover:not(:disabled) {
  background-color: #f5f7fa;
}

.like-button.liked {
  color: #f56c6c;
}

.like-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.like-icon {
  font-size: 1.2rem;
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

/* Markdown 内容样式 */
.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin: 25px 0 15px 0;
  font-weight: 600;
  line-height: 1.3;
}

.markdown-content h1 {
  font-size: 2rem;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 10px;
}

.markdown-content h2 {
  font-size: 1.75rem;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

.markdown-content h3 {
  font-size: 1.5rem;
}

.markdown-content h4 {
  font-size: 1.25rem;
}

.markdown-content p {
  margin: 15px 0;
  line-height: 1.8;
}

.markdown-content ul,
.markdown-content ol {
  margin: 15px 0;
  padding-left: 30px;
}

.markdown-content li {
  margin: 8px 0;
  line-height: 1.6;
}

.markdown-content code {
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.9em;
  font-family: 'Courier New', Courier, monospace;
  color: #e83e8c;
}

.markdown-content pre {
  background-color: #f6f8fa;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 20px 0;
  border: 1px solid #e1e4e8;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #24292e;
}

.markdown-content blockquote {
  border-left: 4px solid #409eff;
  padding-left: 16px;
  margin: 20px 0;
  color: #666;
  font-style: italic;
  background-color: #f9f9f9;
  padding: 12px 16px;
  border-radius: 0 4px 4px 0;
}

.markdown-content strong {
  font-weight: 600;
  color: #333;
}

.markdown-content em {
  font-style: italic;
  color: #555;
}

.markdown-content a {
  color: #409eff;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-bottom-color 0.2s;
}

.markdown-content a:hover {
  border-bottom-color: #409eff;
  text-decoration: none;
}

.markdown-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 0.95em;
}

.markdown-content table th,
.markdown-content table td {
  border: 1px solid #e1e4e8;
  padding: 8px 12px;
  text-align: left;
}

.markdown-content table th {
  background-color: #f6f8fa;
  font-weight: 600;
}

.markdown-content table tr:nth-child(even) {
  background-color: #fafafa;
}

.markdown-content img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 20px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.markdown-content hr {
  border: none;
  border-top: 2px solid #e0e0e0;
  margin: 30px 0;
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
  gap: 12px;
}

.author-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f0f0f0;
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
}

.comment-author .author-name {
  font-weight: 500;
  color: #409eff;
  font-size: 1rem;
}

.comment-time {
  color: #909399;
  font-size: 0.8rem;
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
