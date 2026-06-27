import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Article } from './article.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: 0 })
  articleCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => Article, (article) => article.tags)
  @JoinTable({
    name: 'article_tags',
    joinColumn: { name: 'tagId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'articleId', referencedColumnName: 'id' },
  })
  articles: Article[];
}
