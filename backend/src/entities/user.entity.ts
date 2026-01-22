import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Article } from './article.entity';
import { Comment } from './comment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false })
  nickname: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true, type: 'text' })
  bio?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @Column({ nullable: true })
  refreshToken?: string;
}
