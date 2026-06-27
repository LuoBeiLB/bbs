import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { AiChatRequest } from '../../shared/ai';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('chat')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI chat interface' })
  @ApiResponse({ status: 200, description: 'AI response generated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'The message to send to the AI',
          },
        },
      },
    })
  async chat(@Body() aiChatRequest: AiChatRequest, @Request() req) {
    return this.aiService.chat(aiChatRequest, req.user.id);
  }
}
