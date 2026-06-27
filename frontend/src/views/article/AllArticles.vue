<template>
  <div class="all-articles-container">
    <h1>所有文章</h1>

    <div class="content-wrapper">
      <!-- 左侧标签栏 -->
      <div class="tags-sidebar">
        <div class="tags-header">
          <h2>文章分类</h2>
        </div>

        <div v-if="tagsLoading" class="tags-loading">
          <el-icon class="is-loading"><loading /></el-icon>
          加载中...
        </div>

        <div v-else-if="tagsError" class="tags-error">
          {{ tagsError }}
        </div>

        <div v-else class="tags-list">
          <div
            :class="['tag-item', { active: !selectedTag }]"
            @click="handleSelectTag(null)"
          >
            <span class="tag-name">全部文章</span>
            <span class="tag-count">{{ totalArticles }}</span>
          </div>

          <div
            v-for="tag in tags"
            :key="tag.id"
            :class="['tag-item', { active: selectedTag?.id === tag.id }]"
            @click="handleSelectTag(tag)"
          >
            <span class="tag-name">{{ tag.name }}</span>
            <span class="tag-count">{{ tag.articleCount }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧文章列表 -->
      <div class="articles-main">
        <div class="articles-header">
          <h2>
            {{ selectedTag ? selectedTag.name : '全部文章' }}
            <span v-if="articleList" class="article-count">({{ articleList.total }} 篇)</span>
          </h2>
        </div>

        <div v-if="loading" class="articles-loading">
          <el-icon class="is-loading"><loading /></el-icon>
          加载文章中...
        </div>

        <div v-else-if="error" class="articles-error">
          {{ error }}
        </div>

        <div v-else-if="articles.length > 0" class="articles-list">
          <div
            v-for="article in articles"
            :key="article.id"
            class="article-card"
            @click="navigateToArticle(article.id)"
          >
            <h3>{{ article.title }}</h3>
            <div class="article-tags">
              <el-tag
                v-for="tag in article.tags"
                :key="tag.id"
                size="small"
                type="info"
                class="article-tag"
                @click.stop
              >
                {{ tag.name }}
              </el-tag>
            </div>
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
              <span class="created-at">{{ formatDate(article.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div v-else class="no-articles">
          <el-empty description="暂无文章"></el-empty>
        </div>

        <!-- 分页 -->
        <div v-if="articleList && articleList.total > articleList.limit" class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="articleList.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useArticleStore } from '@/stores/article';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';

const router = useRouter();
const articleStore = useArticleStore();
const userStore = useUserStore();

// 从 store 中获取响应式数据
const {
  tags,
  tagsLoading,
  tagsError,
  selectedTag,
  articles,
  articleList,
  loading,
  error,
  currentPage,
  totalPages,
  likedArticles,
} = storeToRefs(articleStore);

// 本地状态
const pageSize = ref(10);

// 计算总文章数（所有标签的文章总数）
const totalArticles = computed(() => {
  return tags.value.reduce((sum, tag) => sum + tag.articleCount, 0);
});

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

// 选择标签
const handleSelectTag = async (tag: any) => {
  articleStore.selectTag(tag);
  await loadArticles(1, pageSize.value);
};

// 加载文章
const loadArticles = async (page: number = 1, limit: number = 10) => {
  try {
    const params: any = {
      page,
      limit,
    };

    if (selectedTag.value) {
      params.tag = selectedTag.value.name;
    }

    await articleStore.getArticles(params);
  } catch (err) {
    console.error('Failed to load articles:', err);
    ElMessage.error('加载文章失败');
  }
};

// 页码变化
const handlePageChange = (page: number) => {
  loadArticles(page, pageSize.value);
};

// 每页数量变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  loadArticles(1, size);
};

// 格式化日期
const formatDate = (date: Date | string) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 页面加载时获取数据
onMounted(async () => {
  try {
    const promises:Promise<unknown>[] = [
      articleStore.getTags(),
      loadArticles(1, pageSize.value),
    ];
    
    // 如果用户已登录，加载点赞列表
    if (userStore.isLoggedIn) {
      promises.push(articleStore.getLikedArticles());
    }
    
    await Promise.all(promises);
  } catch (err) {
    console.error('Failed to load initial data:', err);
  }
});
</script>

<style scoped>
.all-articles-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.all-articles-container h1 {
  font-size: 2.5rem;
  margin-bottom: 30px;
  color: #333;
  text-align: center;
}

.content-wrapper {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

/* 左侧标签栏 */
.tags-sidebar {
  width: 280px;
  flex-shrink: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  position: sticky;
  top: 20px;
}

.tags-header h2 {
  font-size: 1.4rem;
  margin-bottom: 20px;
  color: #409eff;
  border-bottom: 2px solid #409eff;
  padding-bottom: 10px;
}

.tags-loading,
.tags-error {
  text-align: center;
  padding: 20px;
  color: #999;
}

.tags-error {
  color: #f56c6c;
}

.tags-list {
  max-height: 70vh;
  overflow-y: auto;
}

.tag-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 8px;
}

.tag-item:hover {
  background-color: #f5f7fa;
}

.tag-item.active {
  background-color: #409eff;
  color: white;
}

.tag-name {
  font-weight: 500;
  font-size: 0.95rem;
}

.tag-count {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
}

.tag-item.active .tag-count {
  background-color: rgba(255, 255, 255, 0.2);
}

/* 右侧文章列表 */
.articles-main {
  flex: 1;
  min-width: 0;
}

.articles-header {
  margin-bottom: 20px;
}

.articles-header h2 {
  font-size: 1.6rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.article-count {
  font-size: 1rem;
  color: #999;
  font-weight: normal;
}

.articles-loading,
.articles-error {
  text-align: center;
  padding: 60px 20px;
  font-size: 1.1rem;
}

.articles-loading {
  color: #409eff;
}

.articles-error {
  color: #f56c6c;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;
}

.article-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px 0 rgba(0, 0, 0, 0.15);
}

.article-card h3 {
  font-size: 1.4rem;
  margin-bottom: 12px;
  color: #333;
  line-height: 1.4;
}

.article-tags {
  margin-bottom: 12px;
}

.article-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.article-summary {
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 16px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  font-size: 0.85rem;
  color: #999;
}

.article-meta .author {
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
  font-size: 0.85rem;
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

.no-articles {
  padding: 60px 20px;
}

.pagination-wrapper {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 900px) {
  .content-wrapper {
    flex-direction: column;
  }

  .tags-sidebar {
    width: 100%;
    position: static;
  }

  .tags-list {
    max-height: 300px;
  }
}
</style>
