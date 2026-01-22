import { defineStore } from 'pinia';
import { apiService } from '@/services/api';
import type { LoginResponse, UserProfileDto, UpdateUserDto } from '@tech-community/shared';

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    user: null as {
      id: string;
      email: string;
      nickname: string;
      avatar?: string;
    } | null,
    profile: null as UserProfileDto | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    // 初始化用户状态 - 从 localStorage 恢复
    init() {
      // 检查 localStorage 中是否有 token
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        // 设置为已登录状态
        this.isLoggedIn = true;
        // 尝试从 localStorage 恢复用户基本信息
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr) {
          try {
            this.user = JSON.parse(userInfoStr);
          } catch (err) {
            console.error('Failed to parse user info from localStorage:', err);
          }
        }
        // 后台获取完整用户信息，更新状态
        this.fetchUserInfo();
      }
    },
    
    // 获取用户信息
    async fetchUserInfo() {
      try {
        await this.getProfile();
      } catch (err) {
        console.error('Failed to fetch user info:', err);
        // 如果获取失败，清除登录状态
        this.clearUser();
      }
    },
    
    // 设置用户登录状态和信息
    setUser(loginResponse: LoginResponse) {
      console.log('loginResponse:', loginResponse);
      this.user = loginResponse.user;
      this.isLoggedIn = true;
      // 保存 token 到 localStorage
      localStorage.setItem('accessToken', loginResponse.token.accessToken);
      if (loginResponse.token.refreshToken) {
        localStorage.setItem('refreshToken', loginResponse.token.refreshToken);
      }
      // 保存用户信息到 localStorage
      localStorage.setItem('userInfo', JSON.stringify(loginResponse.user));
    },

    // 清除用户登录状态
    clearUser() {
      this.user = null;
      this.profile = null;
      this.isLoggedIn = false;
      // 清除 localStorage 中的所有用户相关信息
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');
    },

    // 登录
    async login(email: string, password: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiService.auth.login({ email, password });
        console.log('login response:', response);
        this.setUser(response.data);
        return response;
      } catch (err: any) {
        this.error = err.response?.data?.message || '登录失败，请检查邮箱和密码';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // 注册
    async register(email: string, password: string, nickname: string, phone?: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiService.auth.register({ email, password, nickname, phone });
        this.setUser(response.data);
        return response;
      } catch (err: any) {
        this.error = err.response?.data?.message || '注册失败，请检查输入信息';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // 登出
    logout() {
      this.clearUser();
    },

    // 获取用户个人资料
    async getProfile() {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiService.user.getProfile();
        this.profile = response.data;
        // 更新 user 信息
        if (response.data) {
          this.user = {
            id: response.data.id,
            email: response.data.email,
            nickname: response.data.nickname,
            avatar: response.data.avatar
          };
          // 同步更新 localStorage 中的用户信息
          localStorage.setItem('userInfo', JSON.stringify(this.user));
        }
        return response;
      } catch (err: any) {
        this.error = err.response?.data?.message || '获取个人资料失败';
        // 如果是未授权错误，清除用户登录状态
        if (err.response?.status === 401) {
          this.clearUser();
        }
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // 更新用户个人资料
    async updateProfile(updateData: UpdateUserDto) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiService.user.updateProfile(updateData);
        this.profile = response.data;
        // 更新 user 信息
        if (this.user && response.data) {
          this.user.nickname = response.data.nickname;
          this.user.avatar = response.data.avatar;
          // 同步更新 localStorage 中的用户信息
          localStorage.setItem('userInfo', JSON.stringify(this.user));
        }
        return response;
      } catch (err: any) {
        this.error = err.response?.data?.message || '更新个人资料失败';
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
