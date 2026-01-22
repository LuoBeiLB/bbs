"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
let AiService = class AiService {
    async chat(aiChatRequest) {
        const { message, conversationId } = aiChatRequest;
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockResponses = [
            "这是一个技术社区平台，你可以在这里分享技术文章，与其他开发者交流学习。",
            "你可以通过首页查看热门文章和最新动态，也可以使用 AI 助手获取技术帮助。",
            "要创建文章，你需要先登录，然后点击右上角的发布按钮。",
            "我们的平台支持 Markdown 语法，你可以使用它来格式化你的文章。",
            "如果你遇到了技术问题，可以随时向我提问，我会尽力为你解答。",
            "平台的推荐系统会根据你的浏览历史和互动记录，为你推荐感兴趣的文章。",
            "你可以在个人中心管理你的资料和查看你的发布记录。",
            "我们的目标是打造一个活跃、互助、高质量的开发者社区。",
            "谢谢你的提问，希望我的回答对你有所帮助！",
            "如果你有任何建议或反馈，欢迎随时联系我们的管理员。",
        ];
        const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
        return {
            id: `chat-${Date.now()}`,
            message: randomResponse,
            conversationId: conversationId || `conv-${Date.now()}`,
            createdAt: new Date(),
        };
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)()
], AiService);
//# sourceMappingURL=ai.service.js.map