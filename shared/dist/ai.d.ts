export interface ChatMessage {
    id: string;
    content: string;
    sender: 'user' | 'ai';
    createdAt: Date;
}
export interface AiChatRequest {
    message: string;
    conversationId?: string;
}
export interface AiChatResponse {
    id: string;
    message: string;
    conversationId: string;
    createdAt: Date;
}
