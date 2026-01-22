import { ArticleService } from './article.service';
import { CreateArticleDto, UpdateArticleDto, ArticleListQuery } from '@tech-community/shared';
export declare class ArticleController {
    private articleService;
    constructor(articleService: ArticleService);
    getArticleList(query: ArticleListQuery): Promise<import("@tech-community/shared").ArticleListResponse>;
    getHotArticles(limit?: string): Promise<import("../../entities/article.entity").Article[]>;
    getLatestArticles(limit?: string): Promise<import("../../entities/article.entity").Article[]>;
    getRecommendedArticles(req: any, limit?: string): Promise<import("../../entities/article.entity").Article[]>;
    getArticleById(id: string): Promise<import("../../entities/article.entity").Article>;
    createArticle(req: any, createArticleDto: CreateArticleDto): Promise<import("../../entities/article.entity").Article>;
    updateArticle(id: string, req: any, updateArticleDto: UpdateArticleDto): Promise<import("../../entities/article.entity").Article>;
    deleteArticle(id: string, req: any): Promise<void>;
    getArticleComments(id: string, page?: string, limit?: string): Promise<import("@tech-community/shared").CommentListResponse>;
    createComment(req: any, createCommentDto: any): Promise<import("../../entities/comment.entity").Comment>;
    deleteComment(id: string, req: any): Promise<void>;
}
