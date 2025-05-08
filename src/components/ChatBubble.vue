<template>
    <div :class="['chat-item', role]">
        <div class="content-row">
            <a-avatar class="chat-avatar" :src="avatarUrl" size="small" />
            <div class="chat-bubble" v-html="renderedContent"></div>
        </div>
        <div class="button-group">
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
import 'katex/dist/katex.min.css';

import userAvatar from '@/assets/images/furina.jpeg';
import aiAvatar from '@/assets/images/ein.jpeg';
import { CopyOutlined, RedoOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

const props = defineProps({
    role: { type: String, required: true, validator: v => ['user', 'ai'].includes(v) },
    content: { type: String, required: true }
});
const emit = defineEmits(['reset-user', 'reset-ai']);

const avatarUrl = computed(() => (props.role === 'user' ? userAvatar : aiAvatar));
const md = new MarkdownIt({ html: true });
const renderedContent = computed(() => md.render(props.content));

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
        emit('reset-user');
    } else {
        emit('reset-ai');
    }
}
</script>

<style scoped>
.chat-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 30px;
}

.content-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
}

.chat-item.user .content-row {
    flex-direction: row-reverse;
}

.chat-avatar {
    flex-shrink: 0;
}

.chat-bubble {
    max-width: 70%;
    padding: 8px 8px 0px 8px;
    border-radius: 12px;
    font-size: 16px;
    line-height: 1.5;
    word-wrap: break-word;
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
