"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const article_entity_1 = require("../../entities/article.entity");
const comment_entity_1 = require("../../entities/comment.entity");
let ArticleService = class ArticleService {
    constructor(articleRepository, commentRepository) {
        this.articleRepository = articleRepository;
        this.commentRepository = commentRepository;
    }
    async createArticle(authorId, createArticleDto) {
        const article = await this.articleRepository.create({
            ...createArticleDto,
            authorId,
        });
        return this.articleRepository.save(article);
    }
    async getArticleById(id) {
        const article = await this.articleRepository.findOne({
            where: { id },
            relations: ['author'],
        });
        if (!article) {
            throw new common_1.NotFoundException('Article not found');
        }
        article.views += 1;
        await this.articleRepository.save(article);
        return article;
    }
    async updateArticle(id, authorId, updateArticleDto) {
        const article = await this.articleRepository.findOneBy({ id });
        if (!article) {
            throw new common_1.NotFoundException('Article not found');
        }
        if (article.authorId !== authorId) {
            throw new common_1.NotFoundException('You are not the author of this article');
        }
        const updatedArticle = await this.articleRepository.save({
            ...article,
            ...updateArticleDto,
        });
        return updatedArticle;
    }
    async deleteArticle(id, authorId) {
        const article = await this.articleRepository.findOneBy({ id });
        if (!article) {
            throw new common_1.NotFoundException('Article not found');
        }
        if (article.authorId !== authorId) {
            throw new common_1.NotFoundException('You are not the author of this article');
        }
        await this.articleRepository.delete(id);
    }
    async getArticleList(query) {
        const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', tag, search } = query;
        const skip = (page - 1) * limit;
        const queryBuilder = this.articleRepository.createQueryBuilder('article')
            .leftJoinAndSelect('article.author', 'author');
        if (tag) {
            queryBuilder.andWhere(':tag = ANY(article.tags)', { tag });
        }
        if (search) {
            queryBuilder.andWhere('article.title LIKE :search OR article.content LIKE :search OR article.summary LIKE :search', {
                search: `%${search}%`,
            });
        }
        const orderDirection = order.toUpperCase();
        queryBuilder.orderBy(`article.${sortBy}`, orderDirection);
        queryBuilder.skip(skip).take(limit);
        const [articles, total] = await queryBuilder.getManyAndCount();
        return {
            articles,
            total,
            page,
            limit,
        };
    }
    async getHotArticles(limit = 10) {
        return this.articleRepository.find({
            relations: ['author'],
            order: {
                views: 'DESC',
            },
            take: limit,
        });
    }
    async getLatestArticles(limit = 10) {
        return this.articleRepository.find({
            relations: ['author'],
            order: {
                createdAt: 'DESC',
            },
            take: limit,
        });
    }
    async getRecommendedArticles(userId, limit = 10) {
        return this.getHotArticles(limit);
    }
    async getArticleComments(articleId, page = 1, limit = 10) {
        const article = await this.articleRepository.findOneBy({ id: articleId });
        if (!article) {
            throw new common_1.NotFoundException('Article not found');
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
    async createComment(authorId, createCommentDto) {
        const article = await this.articleRepository.findOneBy({ id: createCommentDto.articleId });
        if (!article) {
            throw new common_1.NotFoundException('Article not found');
        }
        const comment = await this.commentRepository.create({
            ...createCommentDto,
            authorId,
        });
        const savedComment = await this.commentRepository.save(comment);
        article.comments += 1;
        await this.articleRepository.save(article);
        return this.commentRepository.findOne({
            where: { id: savedComment.id },
            relations: ['author'],
        });
    }
    async deleteComment(commentId, userId) {
        const comment = await this.commentRepository.findOne({
            where: { id: commentId },
            relations: ['article'],
        });
        if (!comment) {
            throw new common_1.NotFoundException('Comment not found');
        }
        if (comment.authorId !== userId) {
            throw new common_1.NotFoundException('You are not the author of this comment');
        }
        await this.commentRepository.delete(commentId);
        const article = comment.article;
        article.comments = Math.max(0, article.comments - 1);
        await this.articleRepository.save(article);
    }
};
exports.ArticleService = ArticleService;
exports.ArticleService = ArticleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(article_entity_1.Article)),
    __param(1, (0, typeorm_1.InjectRepository)(comment_entity_1.Comment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ArticleService);
//# sourceMappingURL=article.service.js.map