import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type {
  CreateUserDto,
  UserLoginDto,
  LoginResponse,
  UserProfileDto,
  UpdateUserDto,
  Article,
  ArticleListQuery,
  ArticleListResponse,
  CreateArticleDto,
  UpdateArticleDto,
  Comment,
  CreateCommentDto,
  CommentListResponse,
  AiChatRequest,
  AiChatResponse,
  RefreshTokenDto,
  JwtToken,
  Tag,
  LikeResponse,
} from '../shared';


// 创建 Axios 实例
const api = axios.create({
  baseURL: '/api',
  timeout: import.meta.env.AI_API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 存储刷新token的Promise，用于处理并发请求
let refreshTokenPromise: Promise<AxiosResponse<JwtToken>> | AxiosResponse<JwtToken, any, {}> | null = null;

// 全局回调函数，用于通知清除用户状态
let onClearUser: (() => void) | null = null;

// 设置清除用户状态的回调函数
export const setOnClearUserCallback = (callback: () => void) => {
  onClearUser = callback;
};

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    console.log(error);
    // 检查是否是登录请求失败
    const isLoginRequest = originalRequest.url?.includes('/auth/login');
    const isRegisterRequest = originalRequest.url?.includes('/auth/register');
    const isAiChatRequest = originalRequest.url?.includes('/ai/chat');
    const isRefreshTokenRequest = originalRequest.url?.includes('/auth/refresh');
    // 处理401错误（token过期），但排除登录请求和刷新token请求
    if (error.response?.status === 401 && !originalRequest._retry && !isLoginRequest && !isRegisterRequest && !isAiChatRequest && !isRefreshTokenRequest) {
      originalRequest._retry = true;

      try {
        // 获取refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // 没有refresh token，清除登录状态
          console.log('No refresh token found, clearing user state');
          // 调用回调清除用户状态
          if (onClearUser) {
            onClearUser();
          }
          // 延迟跳转，给用户一些反应时间
          if(!isAiChatRequest)
          {
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          }
          return Promise.reject(error);
        }

        // 确保只有一个刷新请求
        if (!refreshTokenPromise) {
          // 直接使用axios实例发起请求，避免触发拦截器
          refreshTokenPromise = axios.post<JwtToken>(`${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/refresh`, { refreshToken }, {
            headers: {
              'Content-Type': 'application/json'
            }
          }).catch(err => {
            console.error('Refresh token request failed:', err);
            throw err; // 抛出错误，让外层catch捕获
          });
        }
        // 刷新token
        const newTokens = await refreshTokenPromise;
        refreshTokenPromise = null;

        // 存储新token
        localStorage.setItem('accessToken', newTokens.data.accessToken);
        localStorage.setItem('refreshToken', newTokens.data.refreshToken!);

        // 更新请求头并重新发送
        originalRequest.headers.Authorization = `Bearer ${newTokens.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // 刷新失败，清除登录状态
        console.log('Refresh token failed, clearing user state');
        refreshTokenPromise = null;
        // 调用回调清除用户状态
        if (onClearUser) {
          onClearUser();
        }
        // 延迟跳转，给用户一些反应时间
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
        return Promise.reject(refreshError);
      }
    }

    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// API 服务对象
export const apiService = {
  // 认证相关 API
  auth: {
    // 注册
    register: (data: CreateUserDto) => api.post<LoginResponse>('/auth/register', data),
    // 登录
    login: (data: UserLoginDto) => api.post<LoginResponse>('/auth/login', data),
    // 刷新 token
    refreshToken: (data: RefreshTokenDto) => api.post<JwtToken>('/auth/refresh', data),
  },

  // 用户相关 API
  user: {
    // 获取个人资料
    getProfile: () => api.get<UserProfileDto>('/user/profile'),
    // 更新个人资料
    updateProfile: (data: UpdateUserDto) => api.put<UserProfileDto>('/user/profile', data),
    // 获取用户文章
    getArticles: () => api.get<Article[]>('/user/articles'),
  },

  // 文章相关 API
  article: {
    // 获取文章列表
    getList: (params?: ArticleListQuery) => api.get<ArticleListResponse>('/articles', { params }),
    // 获取热门文章
    getHot: (limit?: number) => api.get<Article[]>(`/articles/hot?limit=${limit}`),
    // 获取最新文章
    getLatest: (limit?: number) => api.get<Article[]>(`/articles/latest?limit=${limit}`),
    // 获取推荐文章
    getRecommended: (limit?: number) => api.get<Article[]>(`/articles/recommended?limit=${limit}`),
    // 获取文章详情
    getById: (id: string) => api.get<Article>(`/articles/${id}`),
    // 创建文章
    create: (data: CreateArticleDto) => api.post<Article>('/articles', data),
    // 更新文章
    update: (id: string, data: UpdateArticleDto) => api.put<Article>(`/articles/${id}`, data),
    // 删除文章
    delete: (id: string) => api.delete(`/articles/${id}`),
    // 获取文章评论列表
    getComments: (articleId: string, params?: { page?: number; limit?: number }) => api.get<CommentListResponse>(`/articles/${articleId}/comments`, { params }),
    // 创建评论
    createComment: (data: CreateCommentDto) => api.post<Comment>('/articles/comments', data),
    // 删除评论
    deleteComment: (commentId: string) => api.delete(`/articles/comments/${commentId}`),
    // 检查用户是否已点赞文章
    checkLike: (articleId: string) => api.get<boolean>(`/articles/${articleId}/like/check`),
    // 点赞文章
    like: (articleId: string) => api.post<LikeResponse>(`/articles/${articleId}/like`),
    // 取消点赞文章
    unlike: (articleId: string) => api.delete<LikeResponse>(`/articles/${articleId}/like`),
    // 获取用户点赞的文章ID列表
    getLikedArticles: () => api.get<string[]>('/articles/user/liked'),
  },

  // 标签相关 API
  tag: {
    // 获取所有标签
    getAll: () => api.get<Tag[]>('/tags'),
    // 根据ID获取标签
    getById: (id: string) => api.get<Tag>(`/tags/${id}`),
  },

  // AI 相关 API
  ai: {
    // 聊天
    chat: (data: AiChatRequest) => api.post<AiChatResponse>('/ai/chat', data),
  },
};

export default api;
