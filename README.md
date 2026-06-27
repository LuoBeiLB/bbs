# 技术社区平台

一个功能全面的技术社区平台，为开发者提供内容分享、深度交流与智能学习的一站式服务。支持文章发布与管理、评论互动、点赞、AI 智能问答等核心功能。

## ✨ 功能特性

### 用户系统
- **注册 / 登录**：支持邮箱注册与密码登录，基于 JWT 的身份认证
- **Token 刷新**：支持 Access Token + Refresh Token 双 Token 机制
- **个人中心**：查看 / 编辑个人资料、头像上传、浏览历史记录

### 内容系统
- **文章管理**：发布、编辑、删除文章，支持 Markdown 格式
- **文章浏览**：首页聚合展示热门文章和最新文章
- **文章搜索**：支持按标题和内容搜索
- **标签分类**：文章支持多标签分类
- **点赞互动**：登录用户可对文章进行点赞
- **阅读记录**：自动记录用户阅读历史

### 评论系统
- **发表评论**：登录用户可对文章发表评论
- **评论管理**：支持查看、删除自己的评论

### AI 智能助手
- **AI 问答**：内嵌浮动聊天框，支持随时与 AI 进行技术对话
- **多轮对话**：支持上下文理解，保持对话连贯性
- **对话历史**：自动保存用户的 AI 对话记录

## 🛠 技术栈

### 前端
- **Vue 3** — Composition API + `<script setup>` 语法
- **TypeScript** — 类型安全的开发体验
- **Vite** — 极速的开发构建工具
- **Pinia** — 轻量级状态管理
- **Vue Router** — SPA 路由管理
- **Element Plus** — 成熟的 Vue 3 UI 组件库
- **marked + highlight.js** — Markdown 渲染与代码高亮
- **Axios** — HTTP 请求库

### 后端
- **NestJS** — 企业级 Node.js 服务端框架
- **TypeScript** — 类型安全
- **TypeORM** — 对象关系映射（ORM）
- **MySQL** — 关系型数据库
- **JWT + Passport** — 身份认证与授权
- **Swagger** — 交互式 API 文档
- **bcryptjs** — 密码哈希加密
- **Multer** — 文件上传处理

## 📁 项目结构

```
bbs-main/
├── frontend/                # 前端 Vue 3 应用
│   ├── src/
│   │   ├── components/      # 公共组件（Navbar、AiChat 等）
│   │   ├── views/           # 页面视图
│   │   │   ├── Home.vue     # 首页（热门/最新文章）
│   │   │   ├── article/     # 文章相关页面
│   │   │   ├── auth/        # 登录/注册页面
│   │   │   └── user/        # 个人中心页面
│   │   ├── stores/          # Pinia 状态管理
│   │   ├── services/        # API 请求封装
│   │   ├── router/          # 路由配置
│   │   ├── shared/          # 共享类型定义
│   │   └── main.ts          # 应用入口
│   ├── vite.config.ts       # Vite 配置
│   └── package.json
├── backend/                 # 后端 NestJS 应用
│   ├── src/
│   │   ├── entities/        # 数据库实体定义
│   │   ├── modules/         # 功能模块
│   │   │   ├── auth/        # 认证模块
│   │   │   ├── user/        # 用户模块
│   │   │   ├── article/     # 文章模块
│   │   │   ├── ai/          # AI 对话模块
│   │   │   ├── upload/      # 文件上传模块
│   │   │   └── tag/         # 标签模块
│   │   ├── shared/          # 共享类型定义
│   │   ├── app.module.ts    # 根模块
│   │   ├── main.ts          # 服务入口
│   │   └── seed.ts          # 数据库种子数据
│   ├── uploads/             # 上传文件存储目录
│   └── package.json
└── README.md
```

## 🚀 快速开始

### 环境要求

| 依赖 | 版本要求 |
|------|---------|
| Node.js | >= 18.0.0 |
| pnpm | >= 8.0.0（推荐） |
| MySQL | >= 5.7 |

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd bbs-main
```

### 2. 配置数据库

确保 MySQL 服务已启动，然后创建一个数据库：

```sql
CREATE DATABASE bishe DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> 默认数据库名为 `bishe`，你也可以使用其他名称，稍后在 `.env` 中配置即可。

### 3. 配置后端环境变量

在 `backend/` 目录下创建 `.env` 文件：

```bash
cd backend
```

创建 `.env` 文件，内容如下：

```env
# 服务端口
BACKENDPORT=3001
NODE_ENV=development

# 数据库配置
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=bishe

# JWT 配置
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

### 4. 安装依赖

分别安装前端和后端的依赖：

```bash
# 安装后端依赖
cd backend
pnpm install

# 安装前端依赖
cd ../frontend
pnpm install
```

### 5. 初始化数据库（可选）

运行种子脚本，插入初始测试数据：

```bash
cd backend
pnpm seed
```

### 6. 启动项目

需要同时启动后端和前端两个服务（开两个终端窗口）：

**终端 1 — 启动后端：**

```bash
cd backend
pnpm dev
```

后端服务运行在 `http://localhost:3001`，Swagger 文档可访问 `http://localhost:3001/api`。

**终端 2 — 启动前端：**

```bash
cd frontend
pnpm dev
```

前端应用运行在 `http://localhost:3000`。

> 前端开发服务器已配置代理，`/api` 路径的请求会自动转发到后端 `http://localhost:3001`。

### 7. 验证

在浏览器中访问：
- 前端应用：`http://localhost:3000`
- API 文档（Swagger）：`http://localhost:3001/api`

## 📡 API 概览

| 模块 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 认证 | `POST` | `/auth/register` | 用户注册 |
| 认证 | `POST` | `/auth/login` | 用户登录 |
| 认证 | `POST` | `/auth/refresh` | 刷新 Token |
| 用户 | `GET` | `/user/profile` | 获取当前用户资料 |
| 用户 | `PUT` | `/user/profile` | 更新用户资料 |
| 文章 | `GET` | `/articles` | 获取文章列表（分页、搜索） |
| 文章 | `GET` | `/articles/hot` | 获取热门文章 |
| 文章 | `GET` | `/articles/latest` | 获取最新文章 |
| 文章 | `GET` | `/articles/recommended` | 获取推荐文章 |
| 文章 | `GET` | `/articles/:id` | 获取文章详情 |
| 文章 | `POST` | `/articles` | 创建文章（需登录） |
| 文章 | `PUT` | `/articles/:id` | 更新文章（需登录） |
| 文章 | `DELETE` | `/articles/:id` | 删除文章（需登录） |
| 评论 | `GET` | `/articles/:id/comments` | 获取文章评论 |
| 评论 | `POST` | `/articles/comments` | 发表评论（需登录） |
| 评论 | `DELETE` | `/articles/comments/:id` | 删除评论（需登录） |
| AI | `POST` | `/ai/chat` | AI 对话（需登录） |
| 上传 | `POST` | `/upload/avatar` | 上传头像（需登录） |
| 标签 | `GET` | `/tags` | 获取所有标签 |

> 完整的 API 文档和在线调试请访问 Swagger 页面：`http://localhost:3001/api`

## 🔧 生产部署

### 构建后端

```bash
cd backend
pnpm build
```

构建产物在 `backend/dist/` 目录，使用以下命令启动：

```bash
pnpm start:prod
```

### 构建前端

```bash
cd frontend
pnpm build
```

构建产物在 `frontend/dist/` 目录，可部署到 Nginx 或任何静态文件服务器。

### Nginx 部署示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    root /path/to/frontend/dist;
    index index.html;

    # SPA 路由回退
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📝 注意事项

1. **首次使用**：注册账号并登录后才能发布文章、评论、点赞和使用 AI 对话功能。
2. **AI 对话**：需要配置外部 AI API 密钥（在 `backend/.env` 中添加相应配置）。
3. **文件上传**：头像上传存储在 `backend/uploads/` 目录，确保该目录有写入权限。
4. **数据库同步**：开发环境下 TypeORM 的 `synchronize` 默认开启，会自动同步实体到数据库表结构。生产环境请关闭此选项。
5. **安全提醒**：生产环境中务必修改 JWT Secret 为强随机字符串，并妥善保管数据库密码。

## 📄 许可证

MIT
