<template>
  <div class="ai-chat-container" :class="{ expanded: isExpanded }">
    <!-- 聊天按钮 -->
    <div class="chat-button" @click="toggleChat"  v-if="!isExpanded">
      <span>💬 AI 助手</span>
    </div>
    
    <!-- 聊天窗口 -->
    <div class="chat-window" v-else>
      <div class="chat-header">
        <h3>AI 助手</h3>
        <span v-if="isExpanded" @click="toggleChat" style="cursor: pointer;">___</span>
      </div>
      
      <!-- 聊天消息列表 -->
      <div class="chat-messages" ref="messagesContainer">
        <div 
          v-for="message in messages" 
          :key="message.id" 
          class="chat-message" 
          :class="message.sender === 'user' ? 'user-message' : 'ai-message'"
        >
          <div class="message-content">
            <div v-if="message.sender === 'ai' && typeof message.content === 'string'" v-html="renderMarkdown(message.content)"></div>
            <div v-else>{{ message.content }}</div>
          </div>
          <div class="message-time">
            {{ formatTime(message.createdAt) }}
          </div>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-message">
          AI 正在思考...
        </div>
      </div>
      
      <!-- 聊天输入框 -->
      <div class="chat-input">
        <input
          type="text"
          v-model="inputMessage"
          placeholder="请输入您的问题..."
          @keyup.enter="sendMessage"
          :disabled="loading"
        />
        <button @click="sendMessage" :disabled="loading || !inputMessage">
          发送
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { apiService } from '@/services/api';
import type {  AiChatResponse } from '@tech-community/shared';
import { Marked  } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

const marked = new Marked({
  gfm: true,
  breaks: true,
});

marked.use({
  renderer: {
    code(this: any, token: { lang?: string; text: string }) {
      const lang = token.lang || 'plaintext';
      const code = token.text;

      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      const highlighted = hljs.highlight(code, { language }).value;

      return `<pre><code class="hljs ${language}">${highlighted}</code></pre>`;
    },
  },
});
// 聊天消息类型
interface ChatMessage {
  id: string;
  content: AiChatResponse | string;
  sender: 'user' | 'ai';
  createdAt: Date;
}

// 聊天状态
const isExpanded = ref(false);
const messages = ref<ChatMessage[]>([]);
const inputMessage = ref('');
const loading = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

// 切换聊天窗口显示/隐藏
const toggleChat = () => {
  isExpanded.value = !isExpanded.value;
  // 展开时滚动到底部
  setTimeout(() => {
    scrollToBottom();
  }, 100);
};

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// 渲染 Markdown
const renderMarkdown = (content: string) => {
  return marked.parse(content);
};

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || loading.value) return;
  
  const message = inputMessage.value.trim();
  inputMessage.value = '';
  
  // 添加用户消息到列表
  const userMessage: ChatMessage = {
    id: `user-${Date.now()}`,
    content: message,
    sender: 'user',
    createdAt: new Date(),
  };
  messages.value.push(userMessage);
  scrollToBottom();
  
  loading.value = true;
  
  try {
    // 调用 AI API
    const response = await apiService.ai.chat({
      model: (import.meta.env.VITE_AI_MODEL) || 'doubao-pro-1.5',
      message: [{ role: 'user', content: message }] // 按照接口定义格式发送
    });
    // console.log(response)
    // 添加 AI 回复到列表
    const aiMessage: ChatMessage = {
      id: `ai-${Date.now()}`,
      content: response.data || '抱歉，AI 未返回有效回复',
      sender: 'ai',
      createdAt: new Date(),
    };
    messages.value.push(aiMessage);
    scrollToBottom();
  } catch (error) {
    console.error('AI chat error:', error);
    
    // 添加错误消息到列表
    const errorMessage: ChatMessage = {
      id: `error-${Date.now()}`,
      content: '抱歉，AI 服务暂时不可用',
      sender: 'ai',
      createdAt: new Date(),
    };
    messages.value.push(errorMessage);
    scrollToBottom();
  } finally {
    loading.value = false;
  }
};

// 格式化时间
const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 监听消息变化，自动滚动到底部
watch(messages, () => {
  scrollToBottom();
}, { deep: true });

// 初始化时添加欢迎消息
onMounted(() => {
  const welcomeMessage: ChatMessage = {
    id: `welcome-${Date.now()}`,
    content: '您好！我是 AI 助手，有什么可以帮助您的吗？',
    sender: 'ai',
    createdAt: new Date(),
  };
  messages.value.push(welcomeMessage);
  scrollToBottom();
});
</script>

<style scoped>
.ai-chat-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  width: 600px;
  max-height: 500px;
}

.chat-button {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 20px;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.15);
  transition: all 1s;
}

.chat-button:hover {
  background-color: #66b1ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.2);
}

.chat-window {
  display: none;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
  height: 400px;
  width: 100%;
}
.expanded .chat-window {
  display: flex;
}

.chat-header {
  background-color: #409eff;
  color: white;
  padding: 12px 16px;
  border-radius: 8px 8px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-message {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
}

.user-message {
  align-self: flex-end;
  background-color: #409eff;
  color: white;
  border-bottom-right-radius: 4px;
}

.ai-message {
  align-self: flex-start;
  background-color: #f5f7fa;
  color: #333;
  border-bottom-left-radius: 4px;
}

.message-content {
  margin-bottom: 4px;
}

.message-content :deep(h1),
.message-content :deep(h2),
.message-content :deep(h3),
.message-content :deep(h4),
.message-content :deep(h5),
.message-content :deep(h6) {
  margin: 10px 0 5px 0;
  font-weight: 600;
  line-height: 1.2;
}

.message-content :deep(h1) {
  font-size: 18px;
}

.message-content :deep(h2) {
  font-size: 16px;
}

.message-content :deep(h3) {
  font-size: 14px;
}

.message-content :deep(p) {
  margin: 5px 0;
}

.message-content :deep(ul),
.message-content :deep(ol) {
  margin: 5px 0;
  padding-left: 20px;
}

.message-content :deep(li) {
  margin: 3px 0;
}

.message-content :deep(code) {
  background-color: #f0f0f0;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 12px;
  font-family: 'Courier New', Courier, monospace;
}

.message-content :deep(pre) {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 10px 0;
}

.message-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
  font-size: 12px;
  line-height: 1.4;
}

.message-content :deep(blockquote) {
  border-left: 4px solid #409eff;
  padding-left: 10px;
  margin: 10px 0;
  color: #666;
  font-style: italic;
}

.message-content :deep(strong) {
  font-weight: 600;
}

.message-content :deep(em) {
  font-style: italic;
}

.message-time {
  font-size: 12px;
  opacity: 0.7;
  text-align: right;
}

.loading-message {
  align-self: flex-start;
  background-color: #f5f7fa;
  color: #333;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  border-bottom-left-radius: 4px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

.chat-input {
  display: flex;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
}

.chat-input input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #dcdfe6;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
}

.chat-input input:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.chat-input button {
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.chat-input button:hover:not(:disabled) {
  background-color: #66b1ff;
}

.chat-input button:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}
</style>
