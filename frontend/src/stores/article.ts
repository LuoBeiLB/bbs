import { defineStore } from 'pinia';
import { apiService } from '@/services/api';
import type { Article, ArticleListQuery, ArticleListResponse, CreateArticleDto, Comment, CommentListResponse, CreateCommentDto } from '@tech-community/shared';

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
    loading: false,
    error: null as string | null,
    currentPage: 1,
    totalPages: 1,
  }),

  actions: {
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
  },
});
