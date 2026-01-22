import { User } from './user.entity';
import { Comment } from './comment.entity';
export declare class Article {
    id: string;
    title: string;
    content: string;
    summary: string;
    authorId: string;
    author: User;
    commentsList: Comment[];
    tags: string[];
    views: number;
    likes: number;
    comments: number;
    createdAt: Date;
    updatedAt: Date;
}
