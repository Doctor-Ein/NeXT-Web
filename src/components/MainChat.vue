<template>
    <div class="chat-dialog">
        <a-list :data-source="messages" :bordered="false" class="chat-list">
            <template #renderItem="{ item }">
                <ChatBubble :role="item.speaker === 'user' ? 'user' : 'ai'" :content="item.content" />
            </template>
        </a-list>
    </div>
</template>

<script setup>
import ChatBubble from './ChatBubble.vue';
import { defineProps } from 'vue';

defineProps({
    messages: {
        type: Array,
        required: true,
    },
});
</script>


<style scoped>
.chat-dialog {
    position: absolute;
    top: 5%;

    width: 60%;
    height: 75%;
    overflow-y: auto;
    overscroll-behavior: contain;
    /* 防止滚动链 */
    padding: 8px;
}

.chat-list {
    border: none;
    display: flex;
    flex-direction: column;
}
</style>