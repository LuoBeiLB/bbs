import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AiChatRequest, AiChatResponse } from '../../shared/ai';
import axios from 'axios';
import { AiConversation } from '../../entities/ai-conversation.entity';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  
  constructor(
    @InjectRepository(AiConversation)
    private aiConversationRepository: Repository<AiConversation>,
    private configService: ConfigService,
  ) {}
  
  // 调用外部 AI API 的服务
  async chat(aiChatRequest: AiChatRequest, userId: string): Promise<AiChatResponse> {
    let messages = aiChatRequest.message;
    let lastUserMessage = '';
    
    // 检查 message 是否为字符串，如果是则转换为数组格式
    if (typeof messages === 'string') {
      lastUserMessage = messages;
      messages = [{
        role: 'user',
        content: messages
      }];
    } else {
      // 如果是数组，则获取最后一条用户消息
      lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    }
    
    const API_URL = this.configService.get<string>('AI_API_URL');
    const ACCESS_TOKEN = this.configService.get<string>('AI_ACCESS_TOKEN');
    const MODEL = this.configService.get<string>('AI_MODEL');

    const requestBody = {
      model: MODEL,
      messages: messages,
      thinking: {
        enable: "disabled"
      }
    };
    try {
      const response = await axios.post(API_URL, requestBody, {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: this.configService.get<number>('AI_API_TIMEOUT') || 30000 // 超时时间 30 秒
      });
      const reply = response.data.choices[0]?.message?.content;
      if (!reply) {
        const errorMsg = '豆包 AI 未返回有效回复';
        this.logger.error(errorMsg, { responseData: response.data });
        throw new Error(errorMsg);
      }
      
      // 保存对话到数据库
      const conversation = this.aiConversationRepository.create({
        userId,
        userMessage: lastUserMessage,
        aiResponse: reply,
      });
      await this.aiConversationRepository.save(conversation);
      this.logger.log('AI对话已保存到数据库');
      
      return reply;
    } catch (error) {
      this.logger.error('调用豆包 AI API 失败', error);
      throw error;
    }
  }
}
