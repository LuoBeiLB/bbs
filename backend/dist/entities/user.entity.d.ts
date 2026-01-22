import { Article } from './article.entity';
import { Comment } from './comment.entity';
export declare class User {
    id: string;
    email: string;
    phone?: string;
    password: string;
    nickname: string;
    avatar?: string;
    bio?: string;
    createdAt: Date;
    updatedAt: Date;
    articles: Article[];
    comments: Comment[];
    refreshToken?: string;
}
