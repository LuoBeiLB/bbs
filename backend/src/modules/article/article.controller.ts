import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ArticleService } from './article.service';
import { CreateArticleDto, UpdateArticleDto, ArticleListQuery } from '@tech-community/shared';

@ApiTags('Article')
@Controller('articles')
export class ArticleController {
  constructor(private articleService: ArticleService) {}

  // 获取文章列表
  @Get()
  @ApiOperation({ summary: 'Get article list' })
  @ApiResponse({ status: 200, description: 'Article list retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String })
  @ApiQuery({ name: 'tag', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getArticleList(@Query() query: ArticleListQuery) {
    return this.articleService.getArticleList(query);
  }

  // 获取热门文章
  @Get('hot')
  @ApiOperation({ summary: 'Get hot articles' })
  @ApiResponse({ status: 200, description: 'Hot articles retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getHotArticles(@Query('limit') limit?: string) {
    return this.articleService.getHotArticles(limit ? parseInt(limit) : undefined);
  }
  
  // 获取最新文章
  @Get('latest')
  @ApiOperation({ summary: 'Get latest articles' })
  @ApiResponse({ status: 200, description: 'Latest articles retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getLatestArticles(@Query('limit') limit?: string) {
    return this.articleService.getLatestArticles(limit ? parseInt(limit) : undefined);
  }
  
  // 获取推荐文章
  @Get('recommended')
  @ApiOperation({ summary: 'Get recommended articles' })
  @ApiResponse({ status: 200, description: 'Recommended articles retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecommendedArticles(@Request() req, @Query('limit') limit?: string) {
    const userId = req.user?.id || ''; // 未登录用户也可以获取推荐文章
    return this.articleService.getRecommendedArticles(userId, limit ? parseInt(limit) : undefined);
  }

  // 获取文章详情
  @Get(':id')
  @ApiOperation({ summary: 'Get article by id' })
  @ApiResponse({ status: 200, description: 'Article retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async getArticleById(@Param('id') id: string) {
    return this.articleService.getArticleById(id);
  }

  // 创建文章
  @Post()
  @ApiOperation({ summary: 'Create new article' })
  @ApiResponse({ status: 201, description: 'Article created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async createArticle(@Request() req, @Body() createArticleDto: CreateArticleDto) {
    return this.articleService.createArticle(req.user.id, createArticleDto);
  }

  // 更新文章
  @Put(':id')
  @ApiOperation({ summary: 'Update article' })
  @ApiResponse({ status: 200, description: 'Article updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async updateArticle(@Param('id') id: string, @Request() req, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articleService.updateArticle(id, req.user.id, updateArticleDto);
  }

  // 删除文章
  @Delete(':id')
  @ApiOperation({ summary: 'Delete article' })
  @ApiResponse({ status: 200, description: 'Article deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async deleteArticle(@Param('id') id: string, @Request() req) {
    return this.articleService.deleteArticle(id, req.user.id);
  }
  
  // 获取文章评论列表
  @Get(':id/comments')
  @ApiOperation({ summary: 'Get article comments' })
  @ApiResponse({ status: 200, description: 'Comment list retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getArticleComments(@Param('id') id: string, @Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    return this.articleService.getArticleComments(id, parseInt(page), parseInt(limit));
  }
  
  // 创建评论
  @Post('comments')
  @ApiOperation({ summary: 'Create new comment' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async createComment(@Request() req, @Body() createCommentDto: any) {
    return this.articleService.createComment(req.user.id, createCommentDto);
  }
  
  // 删除评论
  @Delete('comments/:id')
  @ApiOperation({ summary: 'Delete comment' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async deleteComment(@Param('id') id: string, @Request() req) {
    return this.articleService.deleteComment(id, req.user.id);
  }
}
