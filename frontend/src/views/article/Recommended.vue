<template>
  <div class="recommended-container">
    <h1>推荐文章</h1>

    <!-- 推荐文章列表 -->
    <section class="section">
      <div class="articles-grid">
        <div v-for="article in recommendedArticles" :key="article.id" class="article-card"
          @click="navigateToArticle(article.id)">
          <h3>{{ article.title }}</h3>
          <el-descriptions>
            <el-descriptions-item v-for="tag in article.tags" :key="tag">
              <el-tag size="small">{{ tag.name }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>
          <p class="article-summary">{{ article.summary }}</p>
          <div class="article-meta">
            <span class="author">{{ article.author.nickname }}</span>
            <span class="views">{{ article.views }} 阅读</span>
            <span class="likes">{{ article.likes }} 点赞</span>
            <span class="comments">{{ article.comments }} 评论</span>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading">
        加载中...
      </div>

      <!-- 错误提示 -->
      <div v-else-if="error" class="error">
        {{ error }}
      </div>

      <!-- 无数据提示 -->
      <div v-else-if="recommendedArticles.length === 0" class="no-data">
        暂无推荐文章
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useArticleStore } from '@/stores/article';
import { storeToRefs } from 'pinia';

const router = useRouter();
const articleStore = useArticleStore();

// 导航到文章详情页
const navigateToArticle = (id: string) => {
  router.push(`/articles/${id}`);
};

// 加载推荐文章
onMounted(async () => {
  try {
    await articleStore.getRecommendedArticles(12);
  } catch (err) {
    console.error('Failed to load recommended articles:', err);
  }
});

// 从 store 中获取响应式数据
const { recommendedArticles, loading, error } = storeToRefs(articleStore);
</script>

<style scoped>
.recommended-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
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

.loading,
.error,
.no-data {
  text-align: center;
  padding: 20px;
  font-size: 1.2rem;
  color: #666;
}

.error {
  color: #f56c6c;
}
</style>
