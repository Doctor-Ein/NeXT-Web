<template>
    <a-layout style="height: 100vh">
        <!-- 左侧栏 -->
        <a-layout-sider width="260" class="left-layout-sider">
            <!-- 模型设置按钮 -->
            <model_settings v-model:propName="value" />
            <!-- 顶部功能按钮 -->
            <a-space direction="vertical" style="width: 50%;">
                <a-button id="New-Chat-Button" type="primary" block @click="NewChat">新建对话</a-button>
            </a-space>

            <!-- 滚动区域 -->
            <div style="margin-top: 16px; overflow-y: auto; height: calc(100vh - 120px);">
                <a-list :data-source="conversations">
                    <template #renderItem="{ item }">
                        <a-list-item style="padding: 8px 12px; cursor: pointer">
                            {{ item.title }}
                        </a-list-item>
                    </template>
                </a-list>
            </div>
        </a-layout-sider>

    </a-layout>
</template>

<script>
import model_settings from '@/components/model_settings.vue';


export default {
    components: {
        model_settings
    },
    data() {
        return {
        };
    },
    computed: {
    },
    methods: {
    },
};
</script>

<style scoped>
#New-Chat-Button {
    font-family: 'MapleMono';
}

.left-layout-sider {
    background: rgb(250, 255, 255);
    padding: 16px 8px;
    border: 1px solid azure;
}
</style>
