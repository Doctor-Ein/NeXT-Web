<template>
    <!-- 左侧栏 -->
    <a-layout-sider :width="260" class="left-layout-sider">
        <!-- 模型设置按钮 -->
        <model_settings v-model:propName="value" />
        <!-- 顶部功能按钮 -->
        <div style="display: flex; justify-content: center;">
            <a-button class="New-Chat-Button" type="primary" block @click="addNewChat">新建对话</a-button>
        </div>


        <!-- 历史对话，滚动区域 -->
        <div class="dialogue-history">
            <a-space direction="vertical">
                <a-button class="dialogue-btn" v-for="chat in chatList" :key="chat.id" type="default" block
                    @click="selectChat(chat.id)">
                    {{ chat.title }}
                </a-button>
            </a-space>
        </div>
    </a-layout-sider>
</template>

<script>
import { ref, emit, onMounted } from 'vue';
import model_settings from '@/components/model_settings.vue';

export default {
    components: {
        model_settings,
    },
    setup() {
        // 初始化对话列表
        const chatList = ref([]);
        const currentChatId = ref(null);

        // 页面挂载时拉取历史对话
        onMounted(async () => {
            try {
                const res = await fetch('http://127.0.0.1:5000/api/dialogue_list');
                if (!res.ok) throw new Error(res.statusText);
                const data = await res.json();
                chatList.value = data['dialogues'];
                console.log('Debug', chatList)
            } catch (e) {
                console.error('加载历史对话失败', e);
            }
        });

        // 添加新会话
        const addNewChat = async () => {
            // 如果列表最顶已经是“新对话”，直接选中它
            if (chatList.value.length > 0 && chatList.value[0].title === '新对话') {
                selectChat(chatList.value[0].id);
                return;
            }

            const payload = { title: '新对话' };
            let newChat = null;
            try {
                const response = await fetch('http://127.0.0.1:5000/api/create_dialogue', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const result = await response.json();
                newChat = { id: result.id, title: payload.title };
                console.log('Debug', newChat.id)
            } catch (error) {
                console.error('创建新对话失败：', error);
                return;
            }

            // 把新会话放到最前并选中
            chatList.value.unshift(newChat);
            selectChat(newChat.id);
        };



        // 选择对话
        const selectChat = (id) => {
            currentChatId.value = id;
            // 根据 id 筛选出对应的 chat 对象
            const selectedChat = chatList.value.find(chat => chat.id === id);
            console.log('选中会话 ID:', id, '选中会话对象:', selectedChat);

            // 通知父组件或全局状态
            emit('update:currentChat', id);
        };

        // 返回需要暴露给模板的属性和方法
        return {
            chatList,
            addNewChat,
            selectChat,
        };
    },
};
</script>


<style scoped>
.dialogue-btn {
    margin-top: 4px;
    margin-top: 4px;
    padding: 2px;
    width: 220px;
    height: 36px;
    background-color: rgb(249, 251, 255);
    border: 1px solid transparent;
    border-radius: 12px;
    font-family: 'MapleMono';
    font-size: 14px;
    text-align: left;
}

.dialogue-history {
    width: 240px;
    height: 800px;
    /* 设置固定高度 */
    margin: 5px;
    padding: 5px;
    background-color: transparent;
    display: flex;
    flex-direction: column;
    /* 垂直排列子元素 */
    justify-content: flex-start;
    align-items: flex-start;
    overflow-y: auto;
    /* 超出高度时启用垂直滚动 */
}


.New-Chat-Button {
    width: 90%;
    height: 40;
    margin: 5px;
    padding: 2px;
    font-family: 'MapleMono';
    font-size: 18px;
    border-radius: 10px;
    background-color: rgb(219, 233, 254);
    color: rgb(77, 107, 254);
}

.left-layout-sider {
    height: 100%;
    background: rgb(249, 251, 255);
    padding: 16px 8px;
    border: 1px solid azure;
}
</style>
