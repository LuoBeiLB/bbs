<template>
  <div class="ai-chat-container" :class="{ expanded: isExpanded }">
    <!-- 聊天按钮 -->
    <div class="chat-button" @click="toggleChat">
      <span v-if="!isExpanded">💬 AI 助手</span>
      <span v-else>✕</span>
    </div>
    
    <!-- 聊天窗口 -->
    <div class="chat-window" v-if="isExpanded">
      <div class="chat-header">
        <h3>AI 助手</h3>
      </div>
      
      <!-- 聊天消息列表 -->
      <div class="chat-messages">
        <div 
          v-for="message in messages" 
          :key="message.id" 
          class="chat-message" 
          :class="message.sender === 'user' ? 'user-message' : 'ai-message'"
        >
          <div class="message-content">
            {{ message.content }}
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
import { ref, onMounted } from 'vue';
import { apiService } from '@/services/api';
import type { ChatMessage } from '@tech-community/shared';

// 聊天状态
const isExpanded = ref(false);
const messages = ref<ChatMessage[]>([]);
const inputMessage = ref('');
const loading = ref(false);
const conversationId = ref('');

// 切换聊天窗口显示/隐藏
const toggleChat = () => {
  isExpanded.value = !isExpanded.value;
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
  
  loading.value = true;
  
  try {
    // 调用 AI API
    const response = await apiService.ai.chat({
      message,
      conversationId: conversationId.value,
    });
    
    // 更新会话 ID
    conversationId.value = response.conversationId;
    
    // 添加 AI 回复到列表
    const aiMessage: ChatMessage = {
      id: response.id,
      content: response.message,
      sender: 'ai',
      createdAt: response.createdAt,
    };
    messages.value.push(aiMessage);
  } catch (error) {
    console.error('AI chat error:', error);
    
    // 添加错误消息到列表
    const errorMessage: ChatMessage = {
      id: `error-${Date.now()}`,
      content: '抱歉，AI 服务暂时不可用，请稍后重试。',
      sender: 'ai',
      createdAt: new Date(),
    };
    messages.value.push(errorMessage);
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

// 初始化时添加欢迎消息
onMounted(() => {
  const welcomeMessage: ChatMessage = {
    id: `welcome-${Date.now()}`,
    content: '您好！我是 AI 助手，有什么可以帮助您的吗？',
    sender: 'ai',
    createdAt: new Date(),
  };
  messages.value.push(welcomeMessage);
});
</script>

<style scoped>
.ai-chat-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  width: 350px;
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
  transition: all 0.3s;
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
