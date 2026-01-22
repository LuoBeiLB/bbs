import { AiService } from './ai.service';
import { AiChatRequest } from '@tech-community/shared';
export declare class AiController {
    private aiService;
    constructor(aiService: AiService);
    chat(aiChatRequest: AiChatRequest): Promise<import("@tech-community/shared").AiChatResponse>;
}
