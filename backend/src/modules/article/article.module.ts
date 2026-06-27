import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../../entities/article.entity';
import { Comment } from '../../entities/comment.entity';
import { UserReadHistory } from '../../entities/user-read-history.entity';
import { Like } from '../../entities/like.entity';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { UserModule } from '../user/user.module';
import { TagService } from '../tag/tag.service';
import { TagModule } from '../tag/tag.module';

@Module({
  imports: [TypeOrmModule.forFeature([Article, Comment, UserReadHistory, Like]), TagModule, UserModule],
  controllers: [ArticleController],
  providers: [ArticleService],
  exports: [ArticleService],
})
export class ArticleModule {}
