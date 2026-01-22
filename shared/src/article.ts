export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  authorId: string;
  author: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  tags: string[];
  views: number;
  likes: number;
  comments: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateArticleDto {
  title: string;
  content: string;
  summary: string;
  tags: string[];
}

export interface UpdateArticleDto {
  title?: string;
  content?: string;
  summary?: string;
  tags?: string[];
}

export interface ArticleListQuery {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'views' | 'likes' | 'comments';
  order?: 'asc' | 'desc';
  tag?: string;
  search?: string;
}

export interface ArticleListResponse {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
}

// 评论相关类型
export interface Comment {
  id: string;
  content: string;
  articleId: string;
  authorId: string;
  author: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentDto {
  content: string;
  articleId: string;
}

export interface CommentListResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
}
