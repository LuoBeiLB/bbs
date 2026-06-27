import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../../entities/article.entity';
import { Comment } from '../../entities/comment.entity';
import { UserReadHistory } from '../../entities/user-read-history.entity';
import { Tag } from '../../entities/tag.entity';
import { Like } from '../../entities/like.entity';
import { TagService } from '../tag/tag.service';
import { CreateArticleDto, UpdateArticleDto, ArticleListQuery, ArticleListResponse, CreateCommentDto, CommentListResponse } from '../../shared';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article) private articleRepository: Repository<Article>,
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(UserReadHistory) private readHistoryRepository: Repository<UserReadHistory>,
    @InjectRepository(Like) private likeRepository: Repository<Like>,
    private tagService: TagService,
  ) {}

  // 创建文章
  async createArticle(authorId: string, createArticleDto: CreateArticleDto): Promise<Article> {
    // 处理标签
    const tags: Tag[] = [];
    for (const tagName of createArticleDto.tags) {
      const tag = await this.tagService.createTag(tagName);
      tags.push(tag);
    }

    const article = await this.articleRepository.create({
      ...createArticleDto,
      authorId,
      tags,
    });

    const savedArticle = await this.articleRepository.save(article);

    // 更新标签的文章数量
    for (const tag of tags) {
      await this.tagService.updateTagArticleCount(tag.id);
    }

    return savedArticle;
  }

  // 获取文章详情
  async getArticleById(id: string, userId?: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['author', 'tags'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // 增加阅读量
    article.views += 1;
    await this.articleRepository.save(article);

    // 如果用户已登录，记录阅读历史
    if (userId) {
      // 检查是否已经阅读过这篇文章（避免重复记录）
      const existingHistory = await this.readHistoryRepository.findOne({
        where: { userId, articleId: id },
      });

      if (!existingHistory) {
        const readHistory = this.readHistoryRepository.create({
          userId,
          articleId: id,
        });
        await this.readHistoryRepository.save(readHistory);
      } else {
        // 更新阅读时间
        existingHistory.readAt = new Date();
        await this.readHistoryRepository.save(existingHistory);
      }
    }

    return article;
  }

  // 更新文章
  async updateArticle(id: string, authorId: string, updateArticleDto: UpdateArticleDto): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['tags'],
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // 检查是否是文章作者
    if (article.authorId !== authorId) {
      throw new NotFoundException('You are not the author of this article');
    }

    // 保存旧标签用于后续更新计数
    const oldTags = [...(article.tags || [])];

    // 处理新标签
    let newTags: Tag[] | undefined;
    if (updateArticleDto.tags) {
      newTags = [];
      for (const tagName of updateArticleDto.tags) {
        const tag = await this.tagService.createTag(tagName);
        newTags.push(tag);
      }
      article.tags = newTags;
    }

    // 更新其他字段
    if (updateArticleDto.title !== undefined) article.title = updateArticleDto.title;
    if (updateArticleDto.content !== undefined) article.content = updateArticleDto.content;
    if (updateArticleDto.summary !== undefined) article.summary = updateArticleDto.summary;

    const updatedArticle = await this.articleRepository.save(article);

    // 更新标签的文章数量
    const allTagsToUpdate = new Set([...oldTags.map(t => t.id), ...(newTags || []).map(t => t.id)]);
    for (const tagId of allTagsToUpdate) {
      await this.tagService.updateTagArticleCount(tagId);
    }

    return updatedArticle;
  }

  // 删除文章
  async deleteArticle(id: string, authorId: string): Promise<void> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['tags'],
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // 检查是否是文章作者
    if (article.authorId !== authorId) {
      throw new NotFoundException('You are not the author of this article');
    }

    const tagIds = (article.tags || []).map(t => t.id);
    
    // 清除文章与标签的关联
    article.tags = [];
    await this.articleRepository.save(article);
    
    // 删除相关的评论
    await this.commentRepository.delete({ articleId: id });
    
    // 删除相关的点赞
    await this.likeRepository.delete({ articleId: id });
    
    // 删除相关的阅读历史
    await this.readHistoryRepository.delete({ articleId: id });
    
    // 删除文章
    await this.articleRepository.delete(id);

    // 更新标签的文章数量
    for (const tagId of tagIds) {
      await this.tagService.updateTagArticleCount(tagId);
    }
  }

  // 获取文章列表
  async getArticleList(query: ArticleListQuery): Promise<ArticleListResponse> {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', tag, search } = query;
    
    const skip = (page - 1) * limit;
    
    const queryBuilder = this.articleRepository.createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.tags', 'tags');
    
    // 标签过滤
    if (tag) {
      queryBuilder.innerJoin('article.tags', 'filterTag')
        .where('filterTag.name = :tag', { tag });
    }
    
    // 搜索过滤
    if (search) {
      queryBuilder.andWhere('article.title LIKE :search OR article.content LIKE :search OR article.summary LIKE :search', {
        search: `%${search}%`,
      });
    }
    
    // 排序 - 转换为大写
    const orderDirection = order.toUpperCase() as 'ASC' | 'DESC';
    queryBuilder.orderBy(`article.${sortBy}`, orderDirection);
    
    // 分页
    queryBuilder.skip(skip).take(limit);
    
    const [articles, total] = await queryBuilder.getManyAndCount();
    
    return {
      articles,
      total,
      page,
      limit,
    };
  }

  // 获取热门文章
  async getHotArticles(limit: number = 10): Promise<Article[]> {
    return this.articleRepository.find({
      relations: ['author', 'tags'],
      order: {
        views: 'DESC',
      },
      take: limit,
    });
  }

  // 获取最新文章
  async getLatestArticles(limit: number = 10): Promise<Article[]> {
    return this.articleRepository.find({
      relations: ['author', 'tags'],
      order: {
        createdAt: 'DESC',
      },
      take: limit,
    });
  }

  // 获取推荐文章
  async getRecommendedArticles(userId: string, limit: number = 10): Promise<Article[]> {
    // 如果用户未登录，直接返回按浏览量排序的热门文章
    if (!userId) {
      return this.getHotArticles(limit);
    }

    // 获取用户的阅读历史
    const readHistory = await this.readHistoryRepository.find({
      where: { userId },
      relations: ['article', 'article.tags'],
    });

    // 如果没有阅读历史，也返回热门文章
    if (readHistory.length === 0) {
      return this.getHotArticles(limit);
    }

    // 计算标签权重
    const tagCount: Record<string, number> = {};
    let totalReads = 0;

    for (const history of readHistory) {
      if (history.article && history.article.tags) {
        for (const tag of history.article.tags) {
          tagCount[tag.name] = (tagCount[tag.name] || 0) + 1;
        }
        totalReads++;
      }
    }

    // 如果没有标签数据，返回热门文章
    if (totalReads === 0) {
      return this.getHotArticles(limit);
    }

    // 计算标签权重
    const tagWeights: Record<string, number> = {};
    for (const [tag, count] of Object.entries(tagCount)) {
      tagWeights[tag] = count / totalReads;
    }

    // 获取所有文章
    const allArticles = await this.articleRepository.find({
      relations: ['author', 'tags'],
    });

    // 计算每篇文章的得分
    const articlesWithScore = allArticles.map(article => {
      let maxScore = 0;

      // 对文章的每个标签计算得分
      for (const tag of article.tags) {
        const tagWeight = tagWeights[tag.name] || 0;
        
        // 计算时效性分数（越新得分越高）
        const now = new Date();
        const createdAt = new Date(article.createdAt);
        const daysDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        // 时效性衰减：30天内的文章时效性分数较高，之后逐渐降低
        const recencyScore = Math.max(0, 1 - daysDiff / 30);

        

        const viewsScore = article.views;
        const likesScore = article.likes;
        const commentsScore = article.comments;

        // 计算基础得分：0.3*浏览量 + 0.3*点赞数 + 0.2*评论数 + 0.2*时效性
        const baseScore = 
          0.3 * viewsScore + 
          0.3 * likesScore + 
          0.2 * commentsScore + 
          0.2 * recencyScore;

        // 最终得分 = 基础得分 * 标签权重
        const tagScore = baseScore * tagWeight;

        if (tagScore > maxScore) {
          maxScore = tagScore;
        }
      }

      return {
        article,
        score: maxScore,
      };
    });

    // 按得分排序，取前limit篇
    articlesWithScore.sort((a, b) => b.score - a.score);
    
    // 排除用户已经读过的文章
    const readArticleIds = new Set(readHistory.map(h => h.articleId));
    const recommendedArticles = articlesWithScore
      .filter(item => !readArticleIds.has(item.article.id))
      .slice(0, limit)
      .map(item => item.article);

    // 如果推荐文章数量不足，用热门文章补充
    if (recommendedArticles.length < limit) {
      const hotArticles = await this.getHotArticles(limit * 2);
      const recommendedIds = new Set(recommendedArticles.map(a => a.id));
      
      for (const hotArticle of hotArticles) {
        if (!recommendedIds.has(hotArticle.id) && !readArticleIds.has(hotArticle.id)) {
          recommendedArticles.push(hotArticle);
          if (recommendedArticles.length >= limit) {
            break;
          }
        }
      }
    }

    return recommendedArticles.slice(0, limit);
  }
  
  // 获取文章评论列表
  async getArticleComments(articleId: string, page: number = 1, limit: number = 10): Promise<CommentListResponse> {
    // 检查文章是否存在
    const article = await this.articleRepository.findOneBy({ id: articleId });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    
    const skip = (page - 1) * limit;
    
    const [comments, total] = await this.commentRepository.findAndCount({
      where: { articleId },
      relations: ['author'],
      order: {
        createdAt: 'DESC',
      },
      skip,
      take: limit,
    });
    
    return {
      comments,
      total,
      page,
      limit,
    };
  }
  
  // 创建评论
  async createComment(authorId: string, createCommentDto: CreateCommentDto): Promise<Comment> {
    // 检查文章是否存在
    const article = await this.articleRepository.findOneBy({ id: createCommentDto.articleId });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    
    // 创建评论
    const comment = await this.commentRepository.create({
      ...createCommentDto,
      authorId,
    });
    
    const savedComment = await this.commentRepository.save(comment);
    
    // 更新文章的评论数
    article.comments += 1;
    await this.articleRepository.save(article);
    
    // 加载评论作者信息
    return this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['author'],
    });
  }
  
  // 删除评论
  async deleteComment(commentId: string, userId: string): Promise<void> {
    // 检查评论是否存在
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['article'],
    });
    
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    
    // 检查是否是评论作者
    if (comment.authorId !== userId) {
      throw new NotFoundException('You are not the author of this comment');
    }
    
    // 删除评论
    await this.commentRepository.delete(commentId);
    
    // 更新文章的评论数
    const article = comment.article;
    article.comments = Math.max(0, article.comments - 1);
    await this.articleRepository.save(article);
  }

  // 检查用户是否已经点赞了某篇文章
  async checkUserLike(userId: string, articleId: string): Promise<boolean> {
    const like = await this.likeRepository.findOne({
      where: { userId, articleId },
    });
    return !!like;
  }

  // 点赞文章
  async likeArticle(userId: string, articleId: string): Promise<{ liked: boolean; likesCount: number }> {
    // 检查文章是否存在
    const article = await this.articleRepository.findOneBy({ id: articleId });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // 检查是否已经点赞
    const existingLike = await this.likeRepository.findOne({
      where: { userId, articleId },
    });

    if (existingLike) {
      // 已经点赞，返回当前状态
      return { liked: true, likesCount: article.likes };
    }

    // 创建点赞记录
    const like = this.likeRepository.create({
      userId,
      articleId,
    });
    await this.likeRepository.save(like);

    // 更新文章点赞数
    article.likes += 1;
    await this.articleRepository.save(article);

    return { liked: true, likesCount: article.likes };
  }

  // 取消点赞文章
  async unlikeArticle(userId: string, articleId: string): Promise<{ liked: boolean; likesCount: number }> {
    // 检查文章是否存在
    const article = await this.articleRepository.findOneBy({ id: articleId });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // 查找点赞记录
    const like = await this.likeRepository.findOne({
      where: { userId, articleId },
    });

    if (!like) {
      // 没有点赞记录，返回当前状态
      return { liked: false, likesCount: article.likes };
    }

    // 删除点赞记录
    await this.likeRepository.remove(like);

    // 更新文章点赞数
    article.likes = Math.max(0, article.likes - 1);
    await this.articleRepository.save(article);

    return { liked: false, likesCount: article.likes };
  }

  // 获取用户点赞的文章列表
  async getUserLikedArticles(userId: string): Promise<string[]> {
    const likes = await this.likeRepository.find({
      where: { userId },
      select: ['articleId'],
    });
    return likes.map(like => like.articleId);
  }
}
