import { AiChatRequest, AiChatResponse } from '@tech-community/shared';
export declare class AiService {
    chat(aiChatRequest: AiChatRequest): Promise<AiChatResponse>;
}
