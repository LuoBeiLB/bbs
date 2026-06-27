export interface BaseChatMessage {
    content: string;
    role: 'user' | 'assistant' | 'system';
}
export interface UserChatMessage extends BaseChatMessage {
    id: string;
}
export interface AiChatRequest {
    model: string;
    message: BaseChatMessage[];
}
export interface AiChatResponse {
    id: string;
    module: string;
    choices: {
        finish_reason: string;
        index: number;
        logprobs: null;
        message: BaseChatMessage;
    }[];
    created: number;
    service_tier: string;
    object: string;
    usage: {
        completion_tokens: number;
        prompt_tokens: number;
        total_tokens: number;
        prompt_tokens_details: {
            cached_tokens: number;
        };
        completion_tokens_details: {
            reasoning_tokens: number;
        };
    };
}
