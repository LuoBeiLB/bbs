import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../../entities/article.entity';
import { Comment } from '../../entities/comment.entity';
import { CreateArticleDto, UpdateArticleDto, ArticleListQuery, ArticleListResponse, CreateCommentDto, CommentListResponse } from '@tech-community/shared';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article) private articleRepository: Repository<Article>,
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
  ) {}

  // 创建文章
  async createArticle(authorId: string, createArticleDto: CreateArticleDto): Promise<Article> {
    const article = await this.articleRepository.create({
      ...createArticleDto,
      authorId,
    });

    return this.articleRepository.save(article);
  }

  // 获取文章详情
  async getArticleById(id: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // 增加阅读量
    article.views += 1;
    await this.articleRepository.save(article);

    return article;
  }

  // 更新文章
  async updateArticle(id: string, authorId: string, updateArticleDto: UpdateArticleDto): Promise<Article> {
    const article = await this.articleRepository.findOneBy({ id });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // 检查是否是文章作者
    if (article.authorId !== authorId) {
      throw new NotFoundException('You are not the author of this article');
    }

    // 更新文章
    const updatedArticle = await this.articleRepository.save({
      ...article,
      ...updateArticleDto,
    });

    return updatedArticle;
  }

  // 删除文章
  async deleteArticle(id: string, authorId: string): Promise<void> {
    const article = await this.articleRepository.findOneBy({ id });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // 检查是否是文章作者
    if (article.authorId !== authorId) {
      throw new NotFoundException('You are not the author of this article');
    }

    await this.articleRepository.delete(id);
  }

  // 获取文章列表
  async getArticleList(query: ArticleListQuery): Promise<ArticleListResponse> {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', tag, search } = query;
    
    const skip = (page - 1) * limit;
    
    const queryBuilder = this.articleRepository.createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author');
    
    // 标签过滤
    if (tag) {
      queryBuilder.andWhere(':tag = ANY(article.tags)', { tag });
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
      relations: ['author'],
      order: {
        views: 'DESC',
      },
      take: limit,
    });
  }

  // 获取最新文章
  async getLatestArticles(limit: number = 10): Promise<Article[]> {
    return this.articleRepository.find({
      relations: ['author'],
      order: {
        createdAt: 'DESC',
      },
      take: limit,
    });
  }

  // 获取推荐文章（简化版，基于热门和最新文章）
  async getRecommendedArticles(userId: string, limit: number = 10): Promise<Article[]> {
    // 这里可以实现更复杂的推荐算法，目前简化为返回热门文章
    return this.getHotArticles(limit);
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
}
