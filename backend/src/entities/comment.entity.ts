import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Article } from './article.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ nullable: false })
  articleId: string;

  @ManyToOne(() => Article, (article) => article.id)
  @JoinColumn({ name: 'articleId' })
  article: Article;

  @Column({ nullable: false })
  authorId: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
