import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../../entities/tag.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
  ) {}

  // 获取所有标签
  async getAllTags(): Promise<Tag[]> {
    return this.tagRepository.find({
      order: {
        articleCount: 'DESC',
        name: 'ASC',
      },
    });
  }

  // 根据ID获取标签
  async getTagById(id: string): Promise<Tag | null> {
    return this.tagRepository.findOne({
      where: { id },
    });
  }

  // 根据名称获取标签
  async getTagByName(name: string): Promise<Tag | null> {
    return this.tagRepository.findOne({
      where: { name },
    });
  }

  // 创建标签
  async createTag(name: string, description?: string): Promise<Tag> {
    const existingTag = await this.getTagByName(name);
    if (existingTag) {
      return existingTag;
    }

    const tag = this.tagRepository.create({
      name,
      description,
    });

    return this.tagRepository.save(tag);
  }

  // 更新标签文章数量
  async updateTagArticleCount(tagId: string): Promise<void> {
    const tag = await this.getTagById(tagId);
    if (!tag) {
      return;
    }

    // 计算该标签下的文章数量
    const result = await this.tagRepository
      .createQueryBuilder('tag')
      .leftJoin('tag.articles', 'article')
      .where('tag.id = :tagId', { tagId })
      .select('COUNT(article.id)', 'count')
      .getRawOne();

    tag.articleCount = parseInt(result.count) || 0;
    await this.tagRepository.save(tag);
  }
}
