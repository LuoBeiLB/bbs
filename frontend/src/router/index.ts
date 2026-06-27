import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

// 路由配置
const routes: RouteRecordRaw[] = [
  // 首页
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '首页 - 技术社区平台',
    },
  },
  
  // 推荐文章页
  {
    path: '/recommended',
    name: 'Recommended',
    component: () => import('@/views/article/Recommended.vue'),
    meta: {
      title: '推荐文章 - 技术社区平台',
    },
  },
  
  // 文章详情页
  {
    path: '/articles/:id',
    name: 'ArticleDetail',
    component: () => import('@/views/article/ArticleDetail.vue'),
    meta: {
      title: '文章详情 - 技术社区平台',
    },
  },
  
  // 登录页
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: {
      title: '登录 - 技术社区平台',
    },
  },
  
  // 注册页
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: {
      title: '注册 - 技术社区平台',
    },
  },
  
  // 个人中心
  {
    path: '/user/profile',
    name: 'UserProfile',
    component: () => import('@/views/user/Profile.vue'),
    meta: {
      title: '个人中心 - 技术社区平台',
      requiresAuth: true,
    },
  },
  
  // 发布文章
  {
    path: '/articles/add',
    name: 'AddArticle',
    component: () => import('@/views/article/AddArticle.vue'),
    meta: {
      title: '发布文章 - 技术社区平台',
      requiresAuth: true,
    },
  },
  // 所有文章页
  {
    path: '/allarticles',
    name: 'AllArticles',
    component: () => import('@/views/article/AllArticles.vue'),
    meta: {
      title: '所有文章 - 技术社区平台',
    },
  },
  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '404 - 页面未找到',
    },
  },
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }
  next();
});

export default router;
