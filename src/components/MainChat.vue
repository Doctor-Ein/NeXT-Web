<template>
    <div class="chat-dialog">
        <a-list :data-source="messages" :bordered="false" class="chat-list">
            <template #renderItem="{ item }">
                <ChatBubble :role="item.role" :content="item.content" />
            </template>
        </a-list>
    </div>
</template>

<script setup>
import ChatBubble from './ChatBubble.vue';
import { ref } from 'vue';

const messages = ref([
    { role: 'user', content: '### 你好！ \n$ \frac{1}{2}=0.5 $' },
    { role: 'ai', content: '您好!很高兴为您服务。我是一个AI助手,可以回答问题、提供信息或者进行各种对话。您有什么想聊的话题吗?或者有什么需要帮助的地方?我会尽力为您解答。' },
    { role: 'user', content: '我可太喜欢小夏啦' },
    // 添加更多消息对象
]);

</script>

<style scoped>
.chat-dialog {
    position: absolute;
    top: 5%;
    width: 60%;
    height: 75%;
    padding: 8px;

}

.chat-list {
    border: none;
    display: flex;
    flex-direction: column;
}
</style>