<template>
  <div class="home-container">
    <h1>技术社区平台</h1>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      加载中...
    </div>

    <!-- 错误信息 -->
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <template v-else>
      <!-- 热门文章 -->
      <section class="section">
        <h2>热门文章</h2>
        <div v-if="hotArticles.length > 0" class="articles-grid">
          <div v-for="article in hotArticles" :key="article.id" class="article-card"
            @click="navigateToArticle(article.id)">
            <h3>{{ article.title }}</h3>
            <el-descriptions>
              <el-descriptions-item v-for="tag in article.tags" :key="tag.id">
                <el-tag size="small">{{ tag.name }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>
            <p class="article-summary">{{ article.summary }}</p>
            <div class="article-meta">
              <span class="author">{{ article.author?.nickname || '未知作者' }}</span>
              <span class="views">{{ article.views || 0 }} 阅读</span>
              <button 
                class="like-button" 
                :class="{ liked: likedArticles.includes(article.id) }"
                @click="handleLike($event, article.id)"
                :disabled="!userStore.isLoggedIn"
              >
                <span class="like-icon">{{ likedArticles.includes(article.id) ? '❤️' : '🤍' }}</span>
                <span>{{ article.likes || 0 }}</span>
              </button>
              <span class="comments">{{ article.comments || 0 }} 评论</span>
            </div>
          </div>
        </div>
        <div v-else class="no-articles">
          暂无热门文章
        </div>
      </section>

      <!-- 最新文章 -->
      <section class="section">
        <h2>最新文章</h2>
        <div v-if="latestArticles.length > 0" class="articles-grid">
          <div v-for="article in latestArticles" :key="article.id" class="article-card"
            @click="navigateToArticle(article.id)">
            <h3>{{ article.title }}</h3>
            <el-descriptions>
              <el-descriptions-item v-for="tag in article.tags" :key="tag.id">
                <el-tag size="small">{{ tag.name }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>
            <p class="article-summary">{{ article.summary }}</p>
            <div class="article-meta">
              <span class="author">{{ article.author?.nickname || '未知作者' }}</span>
              <span class="views">{{ article.views || 0 }} 阅读</span>
              <button 
                class="like-button" 
                :class="{ liked: likedArticles.includes(article.id) }"
                @click="handleLike($event, article.id)"
                :disabled="!userStore.isLoggedIn"
              >
                <span class="like-icon">{{ likedArticles.includes(article.id) ? '❤️' : '🤍' }}</span>
                <span>{{ article.likes || 0 }}</span>
              </button>
              <span class="comments">{{ article.comments || 0 }} 评论</span>
            </div>
          </div>
        </div>
        <div v-else class="no-articles">
          暂无最新文章
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useArticleStore } from '@/stores/article';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';

const router = useRouter();
const articleStore = useArticleStore();
const userStore = useUserStore();

// 导航到文章详情页
const navigateToArticle = (id: string) => {
  router.push(`/articles/${id}`);
};

// 处理点赞
const handleLike = async (event: Event, articleId: string) => {
  event.stopPropagation();
  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }
  
  try {
    await articleStore.toggleLike(articleId);
  } catch (err) {
    console.error('点赞失败:', err);
  }
};

// 加载热门文章和最新文章
onMounted(async () => {
  try {
    const promises:Promise<unknown>[] = [
      articleStore.getHotArticles(6),
      articleStore.getLatestArticles(6),
    ];
    
    // 如果用户已登录，加载点赞列表
    if (userStore.isLoggedIn) {
      promises.push(articleStore.getLikedArticles());
    }
    
    await Promise.all(promises);
  } catch (err) {
    console.error('Failed to load articles:', err);
    // 即使加载失败，也确保页面能显示
    if (articleStore.hotArticles.length === 0 && articleStore.latestArticles.length === 0) {
      articleStore.error = '加载文章失败，请刷新页面重试';
    }
  }
});

// 从 store 中获取响应式数据
const { hotArticles, latestArticles, loading, error, likedArticles } = storeToRefs(articleStore);

</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  font-size: 1.2rem;
  color: #409eff;
}

.error-message {
  background-color: #fef0f0;
  color: #f56c6c;
  padding: 10px 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.no-articles {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.section {
  margin-bottom: 40px;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 30px;
  color: #333;
  text-align: center;
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: #409eff;
  border-bottom: 2px solid #409eff;
  padding-bottom: 10px;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.article-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px 0 rgba(0, 0, 0, 0.15);
}

.article-card h3 {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #333;
  line-height: 1.4;
}

.article-summary {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #999;
}

.author {
  font-weight: 500;
  color: #409eff;
}

.like-button {
  display: flex;
  align-items: center;
  gap: 3px;
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 12px;
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
  font-size: 1rem;
}
</style>
