import { defineStore } from 'pinia';
import { apiService } from '@/services/api';
import type { Article, ArticleListQuery, ArticleListResponse, CreateArticleDto, Comment, CommentListResponse, CreateCommentDto, Tag, LikeResponse } from '@tech-community/shared';

export const useArticleStore = defineStore('article', {
  state: () => ({
    articles: [] as Article[],
    articleList: null as ArticleListResponse | null,
    hotArticles: [] as Article[],
    latestArticles: [] as Article[],
    recommendedArticles: [] as Article[],
    currentArticle: null as Article | null,
    comments: [] as Comment[],
    commentList: null as CommentListResponse | null,
    commentLoading: false,
    commentError: null as string | null,
    commentPage: 1,
    commentTotalPages: 1,
    tags: [] as Tag[],
    tagsLoading: false,
    tagsError: null as string | null,
    selectedTag: null as Tag | null,
    likedArticles: [] as string[],
    likedArticlesLoading: false,
    likeError: null as string | null,
    loading: false,
    error: null as string | null,
    currentPage: 1,
    totalPages: 1,
  }),

  actions: {
    // 获取所有标签
    async getTags() {
      this.tagsLoading = true;
      this.tagsError = null;
      try {
        const response = await apiService.tag.getAll();
        this.tags = response.data;
        return response;
      } catch (err: any) {
        this.tagsError = err.response?.data?.message || '获取标签列表失败';
        throw err;
      } finally {
        this.tagsLoading = false;
      }
    },

    // 选择标签
    selectTag(tag: Tag | null) {
      this.selectedTag = tag;
    },
    // 获取文章列表
    async getArticles(params?: ArticleListQuery) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiService.article.getList(params);
        console.log('articleList response:', response); 
        this.articleList = response.data;
        this.articles = response.data.articles;
        this.currentPage = response.data.page;
        this.totalPages = Math.ceil(response.data.total / response.data.limit);
        return response;
      } catch (err: any) {
        this.error = err.response?.data?.message || '获取文章列表失败';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // 获取热门文章
    async getHotArticles(limit: number = 10) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiService.article.getHot(limit);
        console.log('hotArticles response:', response);   
        this.hotArticles = response.data;
        return response;
      } catch (err: any) {
        this.error = err.response?.data?.message || '获取热门文章失败';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // 获取最新文章
    async getLatestArticles(limit: number = 10) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiService.article.getLatest(limit);
        this.latestArticles = response.data;
        return response;
      } catch (err: any) {
        this.error = err.response?.data?.message || '获取最新文章失败';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // 获取推荐文章
    async getRecommendedArticles(limit: number = 10) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiService.article.getRecommended(limit);
        this.recommendedArticles = response.data;
        return response;
      } catch (err: any) {
        this.error = err.response?.data?.message || '获取推荐文章失败';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // 获取文章详情
    async getArticleById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiService.article.getById(id);
        this.currentArticle = response.data;
        return response;
      } catch (err: any) {
        this.error = err.response?.data?.message || '获取文章详情失败';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // 清除当前文章
    clearCurrentArticle() {
      this.currentArticle = null;
    },

    // 创建文章
    async createArticle(data: CreateArticleDto) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiService.article.create(data);
        // 更新相关文章列表
        this.latestArticles.unshift(response.data);
        return response;
      } catch (err: any) {
        this.error = err.response?.data?.message || '创建文章失败';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    // 重置状态
    reset() {
      this.articles = [];
      this.articleList = null;
      this.currentArticle = null;
      this.loading = false;
      this.error = null;
      this.currentPage = 1;
      this.totalPages = 1;
      // 重置评论状态
      this.resetCommentState();
    },
    
    // 重置评论状态
    resetCommentState() {
      this.comments = [];
      this.commentList = null;
      this.commentLoading = false;
      this.commentError = null;
      this.commentPage = 1;
      this.commentTotalPages = 1;
    },
    
    // 获取文章评论列表
    async getComments(articleId: string, params?: { page?: number; limit?: number }) {
      this.commentLoading = true;
      this.commentError = null;
      try {
        const response = await apiService.article.getComments(articleId, params);
        this.commentList = response.data;
        this.comments = response.data.comments;
        this.commentPage = response.data.page;
        this.commentTotalPages = Math.ceil(response.data.total / response.data.limit);
        return response;
      } catch (err: any) {
        this.commentError = err.response?.data?.message || '获取评论列表失败';
        throw err;
      } finally {
        this.commentLoading = false;
      }
    },
    
    // 创建评论
    async createComment(data: CreateCommentDto) {
      this.commentLoading = true;
      this.commentError = null;
      try {
        const response = await apiService.article.createComment(data);
        // 添加新评论到列表开头
        this.comments.unshift(response.data);
        // 更新文章的评论数
        if (this.currentArticle) {
          this.currentArticle.comments++;
        }
        return response;
      } catch (err: any) {
        this.commentError = err.response?.data?.message || '创建评论失败';
        throw err;
      } finally {
        this.commentLoading = false;
      }
    },
    
    // 删除评论
    async deleteComment(commentId: string) {
      this.commentLoading = true;
      this.commentError = null;
      try {
        await apiService.article.deleteComment(commentId);
        // 从列表中移除评论
        this.comments = this.comments.filter(comment => comment.id !== commentId);
        // 更新文章的评论数
        if (this.currentArticle) {
          this.currentArticle.comments--;
        }
      } catch (err: any) {
        this.commentError = err.response?.data?.message || '删除评论失败';
        throw err;
      } finally {
        this.commentLoading = false;
      }
    },

    // 获取用户点赞的文章ID列表
    async getLikedArticles() {
      this.likedArticlesLoading = true;
      this.likeError = null;
      try {
        const response = await apiService.article.getLikedArticles();
        this.likedArticles = response.data;
        return response;
      } catch (err: any) {
        this.likeError = err.response?.data?.message || '获取点赞列表失败';
        throw err;
      } finally {
        this.likedArticlesLoading = false;
      }
    },

    // 检查用户是否已点赞文章
    async checkLike(articleId: string): Promise<boolean> {
      try {
        const response = await apiService.article.checkLike(articleId);
        return response.data;
      } catch (err: any) {
        console.error('检查点赞状态失败:', err);
        return false;
      }
    },

    // 点赞文章
    async likeArticle(articleId: string): Promise<LikeResponse> {
      this.likeError = null;
      try {
        const response = await apiService.article.like(articleId);
        // 更新点赞列表
        if (!this.likedArticles.includes(articleId)) {
          this.likedArticles.push(articleId);
        }
        // 更新文章的点赞数
        this.updateArticleLikes(articleId, response.data.likesCount);
        return response.data;
      } catch (err: any) {
        this.likeError = err.response?.data?.message || '点赞失败';
        throw err;
      }
    },

    // 取消点赞文章
    async unlikeArticle(articleId: string): Promise<LikeResponse> {
      this.likeError = null;
      try {
        const response = await apiService.article.unlike(articleId);
        // 更新点赞列表
        this.likedArticles = this.likedArticles.filter(id => id !== articleId);
        // 更新文章的点赞数
        this.updateArticleLikes(articleId, response.data.likesCount);
        return response.data;
      } catch (err: any) {
        this.likeError = err.response?.data?.message || '取消点赞失败';
        throw err;
      }
    },

    // 切换点赞状态
    async toggleLike(articleId: string): Promise<LikeResponse> {
      const isLiked = this.likedArticles.includes(articleId);
      if (isLiked) {
        return this.unlikeArticle(articleId);
      } else {
        return this.likeArticle(articleId);
      }
    },

    // 更新文章的点赞数
    updateArticleLikes(articleId: string, likesCount: number) {
      // 更新当前文章
      if (this.currentArticle && this.currentArticle.id === articleId) {
        this.currentArticle.likes = likesCount;
      }
      // 更新文章列表中的文章
      this.articles = this.articles.map(article => 
        article.id === articleId ? { ...article, likes: likesCount } : article
      );
      // 更新热门文章
      this.hotArticles = this.hotArticles.map(article => 
        article.id === articleId ? { ...article, likes: likesCount } : article
      );
      // 更新最新文章
      this.latestArticles = this.latestArticles.map(article => 
        article.id === articleId ? { ...article, likes: likesCount } : article
      );
      // 更新推荐文章
      this.recommendedArticles = this.recommendedArticles.map(article => 
        article.id === articleId ? { ...article, likes: likesCount } : article
      );
    },
  },
});
