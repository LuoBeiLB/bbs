<template>
  <div class="add-article-container">
    <h1>发布文章</h1>
    
    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <!-- 成功提示 -->
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
    
    <!-- 文章表单 -->
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="title" class="form-label">文章标题</label>
        <input
          type="text"
          id="title"
          v-model="formData.title"
          class="form-control"
          placeholder="请输入文章标题"
          required
          maxlength="100"
        />
        <small class="form-text">最多100个字符</small>
      </div>
      
      <div class="form-group">
        <label for="summary" class="form-label">文章摘要</label>
        <textarea
          id="summary"
          v-model="formData.summary"
          class="form-control"
          placeholder="请输入文章摘要"
          rows="3"
          required
          maxlength="200"
        ></textarea>
        <small class="form-text">最多200个字符</small>
      </div>
      
      <div class="form-group">
        <label for="content" class="form-label">文章内容</label>
        <div class="markdown-editor">
          <div class="editor-tabs">
            <button 
              type="button" 
              class="tab-button" 
              :class="{ active: activeTab === 'edit' }"
              @click="activeTab = 'edit'"
            >
              编辑
            </button>
            <button 
              type="button" 
              class="tab-button" 
              :class="{ active: activeTab === 'preview' }"
              @click="activeTab = 'preview'"
            >
              预览
            </button>
          </div>
          <div class="editor-content">
            <textarea
              v-show="activeTab === 'edit'"
              id="content"
              v-model="formData.content"
              class="form-control markdown-textarea"
              placeholder="请输入文章内容，支持 Markdown 格式"
              rows="20"
              required
            ></textarea>
            <div 
              v-show="activeTab === 'preview'"
              class="markdown-preview"
              v-html="renderMarkdown(formData.content)"
            ></div>
          </div>
        </div>
        <small class="form-text">支持 Markdown 格式，例如：**加粗**、*斜体*、`代码`、[链接](https://example.com) 等</small>
      </div>
      
      <div class="form-group">
        <label for="tags" class="form-label">文章标签</label>
        <input
          type="text"
          id="tags"
          v-model="tagsInput"
          class="form-control"
          placeholder="请输入标签，用逗号分隔"
        />
        <small class="form-text">例如：前端, Vue, JavaScript</small>
      </div>
      
      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? '发布中...' : '发布文章' }}
        </button>
        <router-link to="/" class="btn btn-secondary">
          取消
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useArticleStore } from '@/stores/article';
import { storeToRefs } from 'pinia';
import type { CreateArticleDto } from '@/../shared/Article';
import { Marked } from 'marked';
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
const router = useRouter();
const articleStore = useArticleStore();

// 成功消息
const successMessage = ref('');

// 标签输入
const tagsInput = ref('');

// 编辑器标签
const activeTab = ref('edit');

// 表单数据
const formData = reactive<CreateArticleDto>({
  title: '',
  summary: '',
  content: '',
  tags: [],
});

// 渲染 Markdown
const renderMarkdown = (content: string) => {
  return marked.parse(content);
};

// 监听标签输入变化
watch(tagsInput, (newValue) => {
  // 将逗号分隔的标签转换为数组
  formData.tags = newValue
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag !== '');
});

// 从 store 中获取响应式状态
const { loading, error } = storeToRefs(articleStore);

// 处理表单提交
const handleSubmit = async () => {
  try {
    await articleStore.createArticle(formData);
    successMessage.value = '文章发布成功！';
    
    // 跳转到首页
    setTimeout(() => {
      router.push('/');
    }, 1500);
  } catch (err) {
    console.error('发布文章失败:', err);
  }
};
</script>

<style scoped>
.add-article-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.form-text {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background-color: #409eff;
  color: white;
}

.btn-primary:hover {
  background-color: #66b1ff;
}

.btn-primary:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #868e96;
}

.success-message {
  background-color: #f0f9eb;
  color: #67c23a;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.error-message {
  background-color: #fef0f0;
  color: #f56c6c;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}

/* Markdown 编辑器样式 */
.markdown-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.editor-tabs {
  display: flex;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
}

.tab-button {
  flex: 1;
  padding: 10px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  transition: all 0.3s;
}

.tab-button:hover {
  background-color: #ecf5ff;
  color: #409eff;
}

.tab-button.active {
  background-color: white;
  color: #409eff;
  border-bottom: 2px solid #409eff;
}

.editor-content {
  position: relative;
  min-height: 400px;
}

.markdown-textarea {
  width: 100%;
  min-height: 400px;
  border: none;
  resize: vertical;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
}

.markdown-textarea:focus {
  box-shadow: none;
}

.markdown-preview {
  padding: 20px;
  min-height: 400px;
  background-color: #fafafa;
  border: none;
  overflow-y: auto;
}

.markdown-preview h1,
.markdown-preview h2,
.markdown-preview h3,
.markdown-preview h4,
.markdown-preview h5,
.markdown-preview h6 {
  margin: 20px 0 10px 0;
  font-weight: 600;
  line-height: 1.2;
}

.markdown-preview h1 {
  font-size: 24px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
}

.markdown-preview h2 {
  font-size: 20px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

.markdown-preview h3 {
  font-size: 18px;
}

.markdown-preview p {
  margin: 10px 0;
  line-height: 1.6;
}

.markdown-preview ul,
.markdown-preview ol {
  margin: 10px 0;
  padding-left: 25px;
}

.markdown-preview li {
  margin: 5px 0;
  line-height: 1.5;
}

.markdown-preview code {
  background-color: #f0f0f0;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 12px;
  font-family: 'Courier New', Courier, monospace;
}

.markdown-preview pre {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 15px 0;
}

.markdown-preview pre code {
  background-color: transparent;
  padding: 0;
  font-size: 13px;
  line-height: 1.4;
}

.markdown-preview blockquote {
  border-left: 4px solid #409eff;
  padding-left: 15px;
  margin: 15px 0;
  color: #666;
  font-style: italic;
}

.markdown-preview strong {
  font-weight: 600;
}

.markdown-preview em {
  font-style: italic;
}

.markdown-preview a {
  color: #409eff;
  text-decoration: none;
}

.markdown-preview a:hover {
  text-decoration: underline;
}
</style>