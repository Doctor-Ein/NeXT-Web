<template>
    <div class="model_settings">
        <!-- 设置按钮 -->
        <a-button class="settings-button" @click.stop="togglePanel">
            <img src="@/assets/images/settings-icon.png" class="settings-icon" alt="设置" />
        </a-button>

        <!-- 展开的设置面板 -->
        <div v-if="panelVisible" ref="panelRef" class="settings-panel">
            <h2 style="font-family: 'MapleMono'; font-size: 18px;">配置项区域</h2>
            <hr />
            <p class="pe">temperature</p>
            <a-input-number v-model:value="temperature" :min="0" :max="1" />
            <p class="pe">top_k</p>
            <a-input-number v-model:value="top_k" :min="50" :max="500" />
            <p class="pe">top_p</p>
            <a-input-number v-model:value="top_p" :min="0.5" :max="1.0" />
            <p class="pe">max_tokens</p>
            <a-input-number v-model:value="max_tokens" :min="32" :max="2048" />
            <hr />
            <p class="pe">prompt</p>
            <a-textarea v-model:value="prompt"
                placeholder="Here, personalize the personality and background of your assistant" :rows="4" />
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';

// 定义响应式变量
const temperature = ref(0.3);
const top_k = ref(250);
const top_p = ref(0.9);
const max_tokens = ref(512);
const prompt = ref('');

// 控制面板显示的变量
const panelVisible = ref(false);
const panelRef = ref(null);

// 切换面板显示状态的函数
function togglePanel() {
    panelVisible.value = !panelVisible.value;
}

// 监听点击事件，点击面板外部时关闭面板
function handleClickOutside(event) {
    if (panelRef.value && !panelRef.value.contains(event.target)) {
        panelVisible.value = false;
    }
}

// 组件挂载时添加事件监听器
onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

// 组件卸载前移除事件监听器
onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
});

// 监听 panelVisible 的变化
watch(panelVisible, async (visible) => {
    if (visible) {
        // 面板打开时，禁止页面滚动
        document.body.style.overflow = 'hidden';
    } else {
        // 面板关闭时，恢复页面滚动
        document.body.style.overflow = '';

        // 构造要发送的数据
        const payload = {
            temperature: temperature.value,
            top_k: top_k.value,
            top_p: top_p.value,
            max_tokens: max_tokens.value,
            prompt: prompt.value,
        };

        try {
            // 发送 POST 请求到后端
            const response = await fetch('http://127.0.0.1:5000/api/settings', {
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
        } catch (error) {
            console.error('发送设置到后端时出错:', error);
        }
    }
});
</script>

<style scoped>
.pe {
    margin: 4px;
    border: 1px solid azure;
    font-family: 'MapleMono';
    font-weight: bold;
}

.model_settings {
    position: relative;
    width: 100%;
    height: 60px;
}

.settings-button {
    width: 40px;
    height: 40px;
    padding: 2px;
    margin: 16px 8px;
    background-color: transparent;
    cursor: pointer;
}

.settings-icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.settings-panel {
    position: absolute;
    top: 60px;
    left: 0;
    background-color: white;
    width: 240px;
    height: 320px;
    overflow-y: auto;
    padding: 16px;
    border: 2px solid #ccc;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    border-radius: 4px;
}

.settings-panel::-webkit-scrollbar {
    width: 6px;
}

.settings-panel::-webkit-scrollbar-track {
    background: #f0f0f0;
}

.settings-panel::-webkit-scrollbar-thumb {
    background-color: #bfbfbf;
    border-radius: 3px;
}
</style>