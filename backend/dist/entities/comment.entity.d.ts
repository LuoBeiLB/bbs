import { User } from './user.entity';
import { Article } from './article.entity';
export declare class Comment {
    id: string;
    content: string;
    articleId: string;
    article: Article;
    authorId: string;
    author: User;
    createdAt: Date;
    updatedAt: Date;
}
