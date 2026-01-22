import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { AiChatRequest } from '@tech-community/shared';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'AI chat interface' })
  @ApiResponse({ status: 200, description: 'AI response generated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async chat(@Body() aiChatRequest: AiChatRequest) {
    return this.aiService.chat(aiChatRequest);
  }
}
