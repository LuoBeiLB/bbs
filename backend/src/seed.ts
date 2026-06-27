import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Article } from './entities/article.entity';
import { Comment } from './entities/comment.entity';
import { Tag } from './entities/tag.entity';
import { Like } from './entities/like.entity';
import * as bcrypt from 'bcryptjs';

// 测试数据配置
const CONFIG = {
  usersCount: 10,
  articlesPerUser: 3,
  commentsPerArticle: 5,
  defaultPassword: 'Password123!',
};

// 样本数据
const SAMPLE_DATA = {
  nicknames: [
    '技术达人', '代码狂魔', '架构师', '前端小白', '后端老司机',
    '全栈开发者', '算法专家', 'DevOps工程师', '产品经理', '测试达人'
  ],
  titles: [
    'Vue 3 最佳实践指南',
    'NestJS 微服务架构详解',
    'TypeScript 高级类型技巧',
    'React Hooks 深入理解',
    'Docker 容器化部署实战',
    'MySQL 索引优化策略',
    'Redis 缓存设计模式',
    'Kubernetes 集群管理',
    'GraphQL API 设计',
    'RESTful API 最佳实践',
    'Node.js 性能优化',
    'Python 机器学习入门',
    'Go 语言并发编程',
    'Rust 所有权系统',
    'Kotlin Android 开发'
  ],
  tags: [
    ['Vue', 'JavaScript', '前端'],
    ['NestJS', 'Node.js', '后端'],
    ['TypeScript', 'JavaScript'],
    ['React', 'JavaScript', '前端'],
    ['Docker', 'DevOps', '容器'],
    ['MySQL', '数据库', 'SQL'],
    ['Redis', '缓存', '数据库'],
    ['Kubernetes', 'DevOps', '容器'],
    ['GraphQL', 'API'],
    ['REST', 'API', '后端'],
    ['Node.js', 'JavaScript', '后端'],
    ['Python', '机器学习', 'AI'],
    ['Go', '后端', '并发'],
    ['Rust', '系统编程'],
    ['Kotlin', 'Android', '移动开发']
  ],
  tagDefinitions: [
    { name: 'Vue', description: 'Vue.js前端框架' },
    { name: 'JavaScript', description: 'JavaScript编程语言' },
    { name: '前端', description: '前端开发技术' },
    { name: 'NestJS', description: 'NestJS后端框架' },
    { name: 'Node.js', description: 'Node.js运行环境' },
    { name: '后端', description: '后端开发技术' },
    { name: 'TypeScript', description: 'TypeScript编程语言' },
    { name: 'React', description: 'React前端框架' },
    { name: 'Docker', description: 'Docker容器技术' },
    { name: 'DevOps', description: 'DevOps开发运维' },
    { name: '容器', description: '容器化技术' },
    { name: 'MySQL', description: 'MySQL数据库' },
    { name: '数据库', description: '数据库技术' },
    { name: 'SQL', description: 'SQL查询语言' },
    { name: 'Redis', description: 'Redis缓存数据库' },
    { name: '缓存', description: '缓存技术' },
    { name: 'Kubernetes', description: 'Kubernetes容器编排' },
    { name: 'GraphQL', description: 'GraphQL查询语言' },
    { name: 'API', description: 'API设计' },
    { name: 'REST', description: 'RESTful架构' },
    { name: 'Python', description: 'Python编程语言' },
    { name: '机器学习', description: '机器学习技术' },
    { name: 'AI', description: '人工智能' },
    { name: 'Go', description: 'Go编程语言' },
    { name: '并发', description: '并发编程' },
    { name: 'Rust', description: 'Rust编程语言' },
    { name: '系统编程', description: '系统级编程' },
    { name: 'Kotlin', description: 'Kotlin编程语言' },
    { name: 'Android', description: 'Android移动开发' },
    { name: '移动开发', description: '移动应用开发' }
  ],
  contents: [
    '这是一篇关于前端开发的技术文章，详细介绍了现代前端框架的使用方法和最佳实践。文章涵盖了组件设计、状态管理、性能优化等多个方面，适合有一定基础的开发者阅读。',
    '本文深入探讨了后端服务架构设计，包括微服务、分布式系统、数据库优化等核心概念。通过实际案例分析，帮助读者理解如何构建高性能、可扩展的后端系统。',
    '这篇教程详细讲解了容器化部署的完整流程，从Docker基础到Kubernetes集群管理，涵盖了CI/CD流水线、监控告警等 DevOps 最佳实践。',
    '机器学习入门指南，从基础概念到实际项目实战，帮助读者快速上手人工智能领域。文章包含了大量代码示例和实践项目。',
    '系统设计深度解析，涵盖了高并发、分布式、缓存、消息队列等核心技术点，适合准备面试和提升系统设计能力的开发者。'
  ],
  summaries: [
    '前端开发最佳实践指南',
    '后端架构设计深度解析',
    '容器化部署完整教程',
    '机器学习入门实战',
    '系统设计面试指南'
  ],
  comments: [
    '写得太好了，学到很多！',
    '感谢分享，非常实用的文章。',
    '有个地方不太理解，能详细解释一下吗？',
    '这正是我需要的内容！',
    '期待更多这样的技术文章。',
    '收藏了，以后慢慢看。',
    '实践了一下，效果不错！',
    '补充一点个人见解...',
    '这个问题我也遇到过，谢谢解决方案。',
    '大佬，带带我！'
  ]
};

// 随机选择函数
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 随机整数生成
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成随机日期
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedDatabase() {
  console.log('🚀 开始生成测试数据...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    // 清空现有数据
    console.log('🗑️  清空现有数据...');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await dataSource.getRepository(Comment).clear();
    await dataSource.getRepository(Like).clear();
    await dataSource.query('DELETE FROM article_tags');
    await dataSource.getRepository(Article).clear();
    await dataSource.getRepository(Tag).clear();
    await dataSource.getRepository(User).clear();
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    const userRepository = dataSource.getRepository(User);
    const articleRepository = dataSource.getRepository(Article);
    const commentRepository = dataSource.getRepository(Comment);
    const tagRepository = dataSource.getRepository(Tag);
    const likeRepository = dataSource.getRepository(Like);

    // 生成标签
    console.log('🏷️  生成标签数据...');
    const tagMap = new Map<string, Tag>();
    for (const tagDef of SAMPLE_DATA.tagDefinitions) {
      const tag = tagRepository.create(tagDef);
      const savedTag = await tagRepository.save(tag);
      tagMap.set(savedTag.name, savedTag);
    }
    console.log(`✅ 已生成 ${tagMap.size} 个标签`);

    // 生成用户
    console.log('👥 生成用户数据...');
    const users: User[] = [];
    const hashedPassword = await bcrypt.hash(CONFIG.defaultPassword, 10);

    for (let i = 0; i < CONFIG.usersCount; i++) {
      const user = userRepository.create({
        email: `user${i + 1}@example.com`,
        password: hashedPassword,
        nickname: SAMPLE_DATA.nicknames[i % SAMPLE_DATA.nicknames.length],
        avatar: i % 3 === 0 ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}` : undefined,
        bio: `热爱技术，专注于${randomChoice(['前端', '后端', '全栈'])}开发。`,
        createdAt: randomDate(new Date('2023-01-01'), new Date('2024-01-01')),
      });
      users.push(await userRepository.save(user));
    }
    console.log(`✅ 已生成 ${users.length} 个用户`);

    // 生成文章
    console.log('📝 生成文章数据...');
    const articles: Article[] = [];
    
    for (const user of users) {
      for (let i = 0; i < CONFIG.articlesPerUser; i++) {
        const titleIndex = randomInt(0, SAMPLE_DATA.titles.length - 1);
        const tagNames = SAMPLE_DATA.tags[titleIndex % SAMPLE_DATA.tags.length];
        const tags = tagNames.map(name => tagMap.get(name)).filter((tag): tag is Tag => tag !== undefined);
        
        const article = articleRepository.create({
          title: SAMPLE_DATA.titles[titleIndex],
          content: randomChoice(SAMPLE_DATA.contents),
          summary: randomChoice(SAMPLE_DATA.summaries),
          tags: tags,
          authorId: user.id,
          views: randomInt(10, 1000),
          likes: randomInt(0, 100),
          comments: 0,
          createdAt: randomDate(new Date('2024-01-01'), new Date()),
        });
        articles.push(await articleRepository.save(article));
      }
    }
    console.log(`✅ 已生成 ${articles.length} 篇文章`);

    // 更新标签的文章数量
    console.log('🔄 更新标签文章数量...');
    for (const tag of tagMap.values()) {
      const countResult = await dataSource
        .createQueryBuilder()
        .select('COUNT(article.id)', 'count')
        .from('articles', 'article')
        .innerJoin('article_tags', 'at', 'article.id = at.articleId')
        .where('at.tagId = :tagId', { tagId: tag.id })
        .getRawOne();
      
      tag.articleCount = parseInt(countResult.count) || 0;
      await tagRepository.save(tag);
    }
    console.log('✅ 标签文章数量已更新');

    // 生成评论
    console.log('💬 生成评论数据...');
    let totalComments = 0;
    
    for (const article of articles) {
      const commentCount = randomInt(0, CONFIG.commentsPerArticle);
      const commentUsers = users.filter(u => u.id !== article.authorId);
      
      for (let i = 0; i < commentCount; i++) {
        if (commentUsers.length === 0) break;
        
        const commentAuthor = randomChoice(commentUsers);
        const comment = commentRepository.create({
          content: randomChoice(SAMPLE_DATA.comments),
          articleId: article.id,
          authorId: commentAuthor.id,
          createdAt: randomDate(new Date(article.createdAt), new Date()),
        });
        await commentRepository.save(comment);
        totalComments++;
      }
      
      // 更新文章评论数
      article.comments = commentCount;
      await articleRepository.save(article);
    }
    console.log(`✅ 已生成 ${totalComments} 条评论`);

    // 生成点赞数据
    console.log('❤️  生成点赞数据...');
    let totalLikes = 0;
    
    for (const article of articles) {
      const likeCount = randomInt(0, 50);
      const likeUsers = users.filter(u => u.id !== article.authorId);
      
      // 重置文章点赞数为0，我们将通过实际点赞记录来计算
      article.likes = 0;
      
      for (let i = 0; i < likeCount; i++) {
        if (likeUsers.length === 0) break;
        
        const likeUser = randomChoice(likeUsers);
        
        // 检查是否已经给这篇文章点过赞
        const existingLike = await likeRepository.findOne({
          where: { userId: likeUser.id, articleId: article.id },
        });
        
        if (!existingLike) {
          const like = likeRepository.create({
            userId: likeUser.id,
            articleId: article.id,
            createdAt: randomDate(new Date(article.createdAt), new Date()),
          });
          await likeRepository.save(like);
          article.likes++;
          totalLikes++;
          
          // 从可选用户中移除，避免重复点赞
          const userIndex = likeUsers.indexOf(likeUser);
          if (userIndex > -1) {
            likeUsers.splice(userIndex, 1);
          }
        }
      }
      
      // 保存文章的点赞数
      await articleRepository.save(article);
    }
    console.log(`✅ 已生成 ${totalLikes} 条点赞记录`);

    console.log('\n🎉 测试数据生成完成！');
    console.log(`\n📊 数据统计：`);
    console.log(`   - 标签数: ${tagMap.size}`);
    console.log(`   - 用户数: ${users.length}`);
    console.log(`   - 文章数: ${articles.length}`);
    console.log(`   - 评论数: ${totalComments}`);
    console.log(`   - 点赞数: ${totalLikes}`);
    console.log(`\n🔑 测试账号：`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. 邮箱: ${user.email}, 密码: ${CONFIG.defaultPassword}`);
    });

  } catch (error) {
    console.error('❌ 生成测试数据失败:', error);
    throw error;
  } finally {
    await app.close();
  }
}

seedDatabase();
