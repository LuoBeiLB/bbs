import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TagService } from './tag.service';
import { Tag } from '../../entities/tag.entity';

@ApiTags('Tag')
@Controller('tags')
export class TagController {
  constructor(private tagService: TagService) {}

  // 获取所有标签
  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({ status: 200, description: 'Tags retrieved successfully' })
  async getAllTags(): Promise<Tag[]> {
    return this.tagService.getAllTags();
  }

  // 根据ID获取标签
  @Get(':id')
  @ApiOperation({ summary: 'Get tag by id' })
  @ApiResponse({ status: 200, description: 'Tag retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async getTagById(@Param('id') id: string): Promise<Tag | null> {
    return this.tagService.getTagById(id);
  }
}
