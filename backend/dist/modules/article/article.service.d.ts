import { Repository } from 'typeorm';
import { Article } from '../../entities/article.entity';
import { Comment } from '../../entities/comment.entity';
import { CreateArticleDto, UpdateArticleDto, ArticleListQuery, ArticleListResponse, CreateCommentDto, CommentListResponse } from '@tech-community/shared';
export declare class ArticleService {
    private articleRepository;
    private commentRepository;
    constructor(articleRepository: Repository<Article>, commentRepository: Repository<Comment>);
    createArticle(authorId: string, createArticleDto: CreateArticleDto): Promise<Article>;
    getArticleById(id: string): Promise<Article>;
    updateArticle(id: string, authorId: string, updateArticleDto: UpdateArticleDto): Promise<Article>;
    deleteArticle(id: string, authorId: string): Promise<void>;
    getArticleList(query: ArticleListQuery): Promise<ArticleListResponse>;
    getHotArticles(limit?: number): Promise<Article[]>;
    getLatestArticles(limit?: number): Promise<Article[]>;
    getRecommendedArticles(userId: string, limit?: number): Promise<Article[]>;
    getArticleComments(articleId: string, page?: number, limit?: number): Promise<CommentListResponse>;
    createComment(authorId: string, createCommentDto: CreateCommentDto): Promise<Comment>;
    deleteComment(commentId: string, userId: string): Promise<void>;
}
