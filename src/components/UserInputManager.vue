<template>
    <div class="UserInputArea">
        <div class="InputContainer">
            <a-textarea class="Unique_Input" v-model:value="user_input" placeholder="在此输入内容..." :rows="10"
                :auto-size="false" @keydown.enter.exact.prevent="handleSubmit" />
            <!-- 操作按钮区域 -->
            <div class="ActionButtons">
                <!-- 上传按钮 -->
                <a-upload ref="uploadRef" v-model:file-list="fileList" :show-upload-list="false"
                    :before-upload="beforeUpload" multiple>
                    <!-- 隐藏默认的上传按钮 -->
                    <template #default>
                        <a-button class="UploadButton" @click="triggerUpload">
                            <FileAddTwoTone style="font-size: 28px;" />
                        </a-button>
                    </template>
                </a-upload>

                <a-button type="primary" class="SubmitButton" @click="handleSubmit" :disabled="isSubmitting">
                    提交
                </a-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { FileAddTwoTone } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

const user_input = ref('');
const isSubmitting = ref(false);
const fileList = ref([]);
const uploadRef = ref(null);

// 阻止自动上传
const beforeUpload = () => {
    return false;
};

// 触发文件选择对话框
const triggerUpload = () => {
    const uploadComponent = uploadRef.value;
    if (uploadComponent) {
        const input = uploadComponent.$el.querySelector('input[type="file"]');
        if (input) {
            input.click();
        } else {
            console.error('未找到文件输入元素');
        }
    } else {
        console.error('上传组件未初始化');
    }
};

// 提交处理
const handleSubmit = async () => {
    if (isSubmitting.value) return;
    isSubmitting.value = true;

    try {
        // 创建 FormData 对象
        const formData = new FormData();
        formData.append('text', user_input.value);
        fileList.value.forEach((file) => {
            formData.append('files[]', file.originFileObj);
        });

        // 模拟异步提交操作，例如发送请求到后端
        console.log('提交内容：', user_input.value);
        console.log('上传文件：', fileList.value);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 模拟延迟

        // 提交成功后的处理逻辑
        message.success('提交成功');
        user_input.value = '';
        fileList.value = [];
    } catch (error) {
        console.error('提交失败：', error);
        message.error('提交失败');
    } finally {
        isSubmitting.value = false;
    }
};
</script>


<style scoped>
/* tile uploaded pictures */
.upload-list-inline :deep(.ant-upload-list-item) {
    float: left;
}

.upload-list-inline [class*='-upload-list-rtl'] :deep(.ant-upload-list-item) {
    float: right;
}

.ActionButtons {
    position: absolute;
    bottom: 12px;
    right: 16px;
    z-index: 1;

    display: flex;
    flex-direction: row;
    justify-content: flex-end;
}

.UploadButton {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    margin-right: 8px;

    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'MapleMono';
    background-color: rgb(219, 233, 254);
    color: rgb(77, 107, 254);
}

.SubmitButton {
    width: 60px;
    height: 40px;
    border-radius: 10px;

    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'MapleMono';
    font-size: 15px;
    font-weight: bold;
    background-color: rgb(219, 233, 254);
    color: rgb(77, 107, 254);
}

.UserInputArea {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    width: 720px;
    height: 160px;
    bottom: 5%;
    left: 50%;
    transform: translateX(-50%);
}

.InputContainer {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: transparent;
}

.Unique_Input {
    width: 100%;
    height: 100%;
    border: 2px solid #bfbfbf;
    border-radius: 30px;
    resize: none;
    /* 禁止缩放 */
    padding: 16px;
    box-sizing: border-box;
}
</style>
