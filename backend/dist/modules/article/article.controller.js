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
exports.ArticleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const article_service_1 = require("./article.service");
let ArticleController = class ArticleController {
    constructor(articleService) {
        this.articleService = articleService;
    }
    async getArticleList(query) {
        return this.articleService.getArticleList(query);
    }
    async getHotArticles(limit) {
        return this.articleService.getHotArticles(limit ? parseInt(limit) : undefined);
    }
    async getLatestArticles(limit) {
        return this.articleService.getLatestArticles(limit ? parseInt(limit) : undefined);
    }
    async getRecommendedArticles(req, limit) {
        const userId = req.user?.id || '';
        return this.articleService.getRecommendedArticles(userId, limit ? parseInt(limit) : undefined);
    }
    async getArticleById(id) {
        return this.articleService.getArticleById(id);
    }
    async createArticle(req, createArticleDto) {
        return this.articleService.createArticle(req.user.id, createArticleDto);
    }
    async updateArticle(id, req, updateArticleDto) {
        return this.articleService.updateArticle(id, req.user.id, updateArticleDto);
    }
    async deleteArticle(id, req) {
        return this.articleService.deleteArticle(id, req.user.id);
    }
    async getArticleComments(id, page = '1', limit = '10') {
        return this.articleService.getArticleComments(id, parseInt(page), parseInt(limit));
    }
    async createComment(req, createCommentDto) {
        return this.articleService.createComment(req.user.id, createCommentDto);
    }
    async deleteComment(id, req) {
        return this.articleService.deleteComment(id, req.user.id);
    }
};
exports.ArticleController = ArticleController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get article list' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Article list retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'order', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'tag', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "getArticleList", null);
__decorate([
    (0, common_1.Get)('hot'),
    (0, swagger_1.ApiOperation)({ summary: 'Get hot articles' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Hot articles retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "getHotArticles", null);
__decorate([
    (0, common_1.Get)('latest'),
    (0, swagger_1.ApiOperation)({ summary: 'Get latest articles' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Latest articles retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "getLatestArticles", null);
__decorate([
    (0, common_1.Get)('recommended'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recommended articles' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recommended articles retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "getRecommendedArticles", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get article by id' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Article retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Article not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "getArticleById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new article' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Article created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "createArticle", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update article' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Article updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Article not found' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "updateArticle", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete article' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Article deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Article not found' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "deleteArticle", null);
__decorate([
    (0, common_1.Get)(':id/comments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get article comments' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Comment list retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Article not found' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "getArticleComments", null);
__decorate([
    (0, common_1.Post)('comments'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new comment' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Comment created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "createComment", null);
__decorate([
    (0, common_1.Delete)('comments/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete comment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Comment deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Comment not found' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "deleteComment", null);
exports.ArticleController = ArticleController = __decorate([
    (0, swagger_1.ApiTags)('Article'),
    (0, common_1.Controller)('articles'),
    __metadata("design:paramtypes", [article_service_1.ArticleService])
], ArticleController);
//# sourceMappingURL=article.controller.js.map