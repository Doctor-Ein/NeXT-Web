<template>
    <a-layout id="Left-Side-Bar">
        <!-- 左侧栏 -->
        <a-layout-sider :width="260" class="left-layout-sider">
            <!-- 模型设置按钮 -->
            <model_settings v-model:propName="value" />
            <!-- 顶部功能按钮 -->
            <div style="display: flex; justify-content: center;">
                <a-button class="New-Chat-Button" type="primary" block @click="addNewChat">新建对话</a-button>
            </div>


            <!-- 历史对话，滚动区域 -->
            <div id="dialogue-history">
                <a-space direction="vertical">
                    <a-button class="dialogue-btn" v-for="chat in chatList" :key="chat.id" type="default" block
                        @click="selectChat(chat.id)">
                        {{ chat.title }}
                    </a-button>
                </a-space>
            </div>
        </a-layout-sider>
    </a-layout>
</template>

<script>
import { ref } from 'vue';
import model_settings from '@/components/model_settings.vue';

export default {
    components: {
        model_settings,
    },
    setup() {
        // 初始化对话列表
        const chatList = ref([]);

        // 添加新对话
        const addNewChat = async () => {
            const payload = { title: `对话 ${chatList.value.length + 1}` };
            try {
                // 发送 POST 请求到后端
                const response = await fetch('http://127.0.0.1:5000/api/create_dialogue', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('设置已成功发送到后端:', result);

                // 将返回的 id 添加到 chatList 中
                chatList.value.unshift({
                    id: result.id,
                    title: `对话 ${chatList.value.length + 1}`,
                });
            } catch (error) {
                console.error('发送设置到后端时出错:', error);
            }
        };


        // 选择对话
        const selectChat = (id) => {
            console.log('选中对话 ID:', id);
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

#dialogue-history {
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
    width: 260px;
    height: 100%;
    background: rgb(249, 251, 255);
    padding: 16px 8px;
    border: 1px solid azure;
}

#Left-Side-Bar {
    width: 260px;
    height: 100%;
}
</style>
