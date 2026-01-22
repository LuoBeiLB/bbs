# 技术社区平台

一个功能全面、体验卓越的技术社区平台，为开发者提供内容分享、深度交流与智能学习的一站式服务。

## 项目结构

采用 Monorepo 架构，将项目代码拆分为三个独立的包：

- **frontend**：前端 Vue 3 + TypeScript 应用
- **backend**：后端 NestJS + TypeScript API 服务
- **shared**：前后端共享的 TypeScript 类型定义

## 核心功能

### 用户系统
- 注册：支持邮箱/手机号注册
- 登录：账号密码 + JWT 认证
- 个人中心：管理个人资料、查看发布的文章和互动记录

### 内容展示
- 首页：聚合展示热门文章、最新动态和推荐内容
- 推荐文章页：基于用户行为的个性化推荐

### AI 互动
- AI 问答助手：浮动聊天框，支持随时与 AI 进行对话

## 技术栈

- **前端**：Vue 3 + TypeScript + Vite + Pinia + Vue Router
- **后端**：NestJS + TypeScript + MySQL + TypeORM + Swagger
- **共享类型**：TypeScript 类型定义

## 快速开始

### 前提条件

- Node.js >= 18.0.0
- pnpm >= 8.0.0（推荐）
- MySQL >= 5.7

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

#### 后端服务

```bash
cd backend
pnpm dev
```

后端服务将运行在 `http://localhost:3001`
Swagger 文档可访问 `http://localhost:3001/api`

#### 前端应用

```bash
cd frontend
pnpm dev
```

前端应用将运行在 `http://localhost:3000`

### 构建生产版本

#### 后端服务

```bash
cd backend
pnpm build
pnpm start:prod
```

#### 前端应用

```bash
cd frontend
pnpm build
pnpm preview
```

## 项目配置

### 后端配置

修改 `backend/src/app.module.ts` 中的数据库连接配置：

```typescript
TypeOrmModule.forRoot({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'password',
  database: 'tech_community',
  autoLoadEntities: true,
  synchronize: true,
});
```

### JWT 配置

修改 `backend/src/app.module.ts` 中的 JWT 配置：

```typescript
JwtModule.register({
  secret: 'your-secret-key', // 生产环境应使用环境变量
  signOptions: {
    expiresIn: '1h',
  },
});
```

## API 文档

后端集成了 Swagger（OpenAPI），提供了可交互的 API 文档：

- 开发环境：`http://localhost:3001/api`
- 生产环境：`https://your-domain/api`

## 项目特点

- **类型安全**：前后端共享 TypeScript 类型，确保数据模型一致性
- **模块化设计**：清晰的项目结构，便于维护和扩展
- **高性能**：前端采用路由懒加载、图片懒加载等优化手段
- **安全可靠**：严格的 JWT 认证流程，保护 API 接口
- **良好的开发体验**：集成 Swagger 文档，便于接口调试和联调

## 目录结构

```
├── frontend/           # 前端应用
│   ├── src/
│   │   ├── components/ # Vue 组件
│   │   ├── views/      # 页面视图
│   │   ├── stores/     # Pinia 状态管理
│   │   ├── services/   # API 服务
│   │   ├── router/     # 路由配置
│   │   └── main.ts     # 应用入口
├── backend/            # 后端服务
│   ├── src/
│   │   ├── modules/    # 功能模块
│   │   ├── entities/   # 数据库实体
│   │   ├── app.module.ts # 应用根模块
│   │   └── main.ts     # 服务入口
└── shared/             # 共享类型
    └── src/            # TypeScript 类型定义
```

## 许可证

MIT
