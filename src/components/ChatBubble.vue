<template>
    <div :class="['chat-item', role]">
        <div class="content-row">
            <a-avatar class="chat-avatar" :src="avatarUrl" size="small" />
            <div class="chat-bubble" v-html="renderedContent"></div>
        </div>
        <div class="button-group">
            <a-button class="sound-button" @click="handleSound">
                <SoundOutlined />
            </a-button>
            <a-button class="copy-button" @click="handleCopy">
                <CopyOutlined />
            </a-button>
            <a-button class="reset-button" @click="handleReset">
                <RedoOutlined />
            </a-button>
        </div>
    </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue';
import MarkdownIt from 'markdown-it';
import markdownItKatex from 'markdown-it-katex';
import hljs from 'highlight.js'; // 引入highlight.js核心库
import 'highlight.js/styles/github.css'; // 选择代码高亮样式

import userAvatar from '@/assets/images/furina.jpeg';
import aiAvatar from '@/assets/images/ein.jpeg';
import { CopyOutlined, RedoOutlined, SoundOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

const props = defineProps({
    role: { type: String, required: true, validator: v => ['user', 'ai'].includes(v) },
    content: { type: String, required: true }
});

const emit = defineEmits(['reset-user', 'reset-ai']);

const avatarUrl = computed(() => (props.role === 'user' ? userAvatar : aiAvatar));
const md = new MarkdownIt({
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
                    }</code></pre>`;
            } catch (__) { return }
        }

        return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
    }
}).use(markdownItKatex, {
    // 核心配置：仅生成 MathML
    output: 'mathml',
    // 禁用错误抛出（避免渲染失败阻塞流程）
    throwOnError: false,
    // 允许信任输入（防止字符转义）
    trust: true,
});
const renderedContent = computed(() => {
    const raw = md.render(props.content);

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = raw;

    // 更彻底的递归删除函数
    function removeKatexElements(node) {
        // 检查当前节点是否是我们要删除的 span
        if (node.nodeType === Node.ELEMENT_NODE &&
            node.tagName.toLowerCase() === 'span' &&
            node.classList.contains('katex-html')) {
            node.parentNode.removeChild(node);
            return; // 已经删除，不需要继续处理
        }

        // 递归处理子节点
        if (node.childNodes) {
            // 使用 Array.from 创建静态副本，因为 childNodes 是动态的
            Array.from(node.childNodes).forEach(child => {
                removeKatexElements(child);
            });
        }
    }

    removeKatexElements(tempDiv);
    return tempDiv.innerHTML;
});

let isSounding = false;
async function handleSound() {
    isSounding = !isSounding
    if (isSounding) { // 这里是第一次点击时，是启动播放
        console.log('DEBUG: 启动音频中……')
        const payload = { 'content': props.content }
        console.log(`DEBUG:${props.content}`)
        try {
            const response = await fetch('http://127.0.0.1:5000/api/read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            message.success('朗读启动', 1)
        } catch (error) {
            message.error('朗读时出现未知错误')
            console.error('朗读时错误:', error);
            return;
        }
    }
    else {
        try {
            console.log('DEBUG: 中止音频流……')
            const response = await fetch('http://127.0.0.1:5000/api/read')
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            message.success('成功中止朗读', 1)
        } catch (error) {
            message.error('朗读时出现未知错误')
            console.error('朗读时错误:', error);
            return;
        }
    }

}
// 复制文本到剪贴板
async function handleCopy() {
    const text = props.content;
    try {
        // 优先使用异步 Clipboard API
        await navigator.clipboard.writeText(text);
        // 可根据业务接入全局提示，如 antd 的 message
        message.success('复制成功', 1); // 停留显示一秒
        console.log('复制成功:', text);
    } catch (err) {
        console.warn('Clipboard API 写入失败，尝试回退方案', err);
        fallbackCopy(text);
    }
}
// 回退方案：使用 textarea + execCommand
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        console.log('execCommand 复制成功');
    } catch (err) {
        console.error('execCommand 复制失败', err);
    }
    document.body.removeChild(textarea);
}

// 重置逻辑
function handleReset() {
    if (props.role === 'user') {
        console.log('[Debug] user reset')
        emit('reset-user');
    } else {
        console.log('[DEBUG] ai reset')
        emit('reset-ai');
    }
}
</script>

<style scoped>
/* 代码块样式 */
.code-block-wrapper {
    position: relative;
    margin: 1em 0;
    border-radius: 8px;
    background: #f6f8fa;
    overflow: hidden;
}

.code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #e1e4e8;
    font-size: 0.9em;
}

.copy-btn {
    background: none;
    border: 1px solid #0366d6;
    color: #0366d6;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
}

.copy-btn:hover {
    background: #0366d6;
    color: white;
}

/* 保持原有样式 */
.chat-bubble>>>.hljs {
    padding: 1em !important;
    background: transparent !important;
}

.content-row {
    display: inline-flex;
    /* 使容器根据内容宽度自适应 */
    align-items: flex-start;
    /* 子元素顶部对齐，避免拉伸 */
}

/*这里还是没有优化成功（哭）*/
.chat-bubble {
    max-width: 70%;
    display: inline-block;
    /* 使气泡根据内容高度自适应 */
    padding: 8px 8px 0px 8px;
    /* 根据需要调整内边距 */
    margin: 0px;
    /* 去除默认外边距 */
    font-size: 16px;
    line-height: 1.5;
    background-color: var(--bubble-bg, rgb(219, 233, 254));
    border-radius: 12px;
    word-break: break-word;
    /* 支持保留文本中的换行符 */
    white-space: pre-wrap;
    word-wrap: break-word;
}

.chat-bubble p {
    margin-bottom: 0px;
    /* 去除段落默认外边距 */
    padding: 0px;
    /* 去除段落默认内边距 */
}

/* 公式容器基础样式 */
.katex {
    font: normal 1em KaTeX_Main, Times New Roman, serif;
    line-height: 1.2;
    white-space: nowrap;
}

/* 块级公式对齐 */
.katex-display {
    display: flex;
    justify-content: center;
    margin: 1em 0;
}

/* 符号间距修正 */
.katex .mspace {
    display: inline-block;
}

.chat-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 30px;
}

.chat-item.user .content-row {
    flex-direction: row-reverse;
}

.chat-avatar {
    flex-shrink: 0;
}

.chat-item.user .chat-bubble {
    background-color: rgb(219, 233, 254);
    max-width: 50%;
}

.chat-item.ai .chat-bubble {
    background-color: transparent;
}


.button-group {
    display: flex;
    gap: 4px;
}

.chat-item.ai .button-group {
    display: flex;
    gap: 4px;
    justify-content: flex-start;
    margin-left: 48px;
}

.chat-item.user .button-group {
    justify-content: flex-end;
    margin-right: 48px;
}

.sound-button,
.copy-button,
.reset-button {
    width: 20px;
    height: 20px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
