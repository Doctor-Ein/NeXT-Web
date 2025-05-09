<template>
    <div class="UserInputArea">
        <!-- 文件列表展示区域 -->
        <div class="FileListContainer" v-if="fileList.length > 0">
            <div class="FileItem" v-for="(file, index) in fileList" :key="file.uid">
                <div class="FileInfo">
                    <span class="FileName">{{ file.name }}</span>
                    <span class="FileSize">{{ formatFileSize(file.size) }}</span>
                </div>
                <a-button type="text" danger @click="removeFile(index)" class="RemoveButton">
                    <DeleteOutlined />
                </a-button>
            </div>
        </div>

        <div class="RAG-Function">
            <a-button @click="Switch_RAG" :type="isRAGEnabled ? 'primary' : 'default'">
                <p style="margin: 0;padding: 0;font-family: 'MapleMono';font-size: 15px;font-weight: bold;"
                    :style="{ backgroundColor: isRAGEnabled ? 'rgb(77, 107, 254)' : 'transparent', color: isRAGEnabled ? 'rgb(219, 233, 254)' : '#000' }">
                    {{ isRAGEnabled ? 'RAG 开启中' : '开启 RAG' }}
                </p>
            </a-button>
        </div>

        <div class="InputContainer">
            <!-- 用户输入区域 -->
            <a-textarea class="Unique_Input" v-model:value="user_input" placeholder="在此输入内容..." :rows="10"
                :auto-size="false" @keydown.enter.exact.prevent="handleSubmit" />
            <!-- 操作按钮区域 -->
            <div class="ActionButtons">
                <AudioInputButton />
                <!-- 上传按钮 -->
                <a-upload v-model:file-list="fileList" :before-upload="beforeUpload" :multiple="true"
                    :show-upload-list="false" @change="handleUploadChange" :custom-request="dummyRequest"
                    accept=".png,.jpg,.jpeg" style="display: inline-block">
                    <a-button class="UploadButton" type="default">
                        <FileAddTwoTone style="font-size: 28px;" />
                    </a-button>
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
import { FileAddTwoTone, DeleteOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { defineEmits } from 'vue';
import AudioInputButton from './AudioInputButton.vue';

// 定义向父组件触发事件
const emit = defineEmits(['callParent']);

const user_input = ref('');
const isSubmitting = ref(false);
const fileList = ref([]);
const isRAGEnabled = ref(true); //TODO: 这里先默认开启叭，累了


const dummyRequest = ({ onSuccess }) => {
    // 立即标记上传成功，不执行任何操作
    setTimeout(() => {
        onSuccess && onSuccess();
    }, 0);
};

const Switch_RAG = async () => {
    // isRAGEnabled.value = !isRAGEnabled.value;

    // try {
    //     const response = await fetch('http://127.0.0.1:5000/api/rag-toggle', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ rag_enabled: isRAGEnabled.value }),
    //     });

    //     if (!response.ok) throw new Error('状态切换失败');

    //     message.success(isRAGEnabled.value ? 'RAG 模式已开启' : 'RAG 模式已关闭');
    // } catch (error) {
    //     message.error('RAG 状态切换失败');
    //     // 回滚状态
    //     isRAGEnabled.value = !isRAGEnabled.value;
    // }
};


// 虽然常用的一个检查文件的钩子函数但还是只用来处理后缀名hhh
const beforeUpload = (file) => {
    const isJpg = file.name.toLowerCase().endsWith('.jpg');
    if (isJpg) {
        const newFile = new File([file], file.name.replace(/\.jpg$/i, '.jpeg'), {
            type: 'image/jpeg',
            lastModified: file.lastModified,
        });
        console.log(newFile)
        return newFile;
    }
    console.log(file)
    return file;
};

// 处理上传变化
const handleUploadChange = (info) => {
    if (info.file.status === 'removed') {
        return;
    }

    // 更新文件列表
    fileList.value = info.fileList.map(file => {
        return {
            ...file,
            uid: file.uid,
            name: file.name,
            size: file.size,
            originFileObj: file.originFileObj || file
        };
    });
};

// 移除文件
const removeFile = (index) => {
    fileList.value.splice(index, 1);
};

// 格式化文件大小
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileListJsonWithContent = async () => {
    const filesWithContent = await Promise.all(
        fileList.value.map(async (file) => {
            let base64Content = null;

            if (file.originFileObj) {
                base64Content = await readFileAsBase64(file.originFileObj);
            }

            return {
                uid: file.uid,
                name: file.name,
                size: file.size,
                media_type: file.type,
                data: base64Content // 添加Base64编码内容
            };
        })
    );

    return filesWithContent
};

// 将 File 对象转为带前缀的 Base64 编码
const readFileAsBase64 = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result); // 保留 data URL 前缀
    });
};

// 提交处理
const handleSubmit = async () => {
    if (isSubmitting.value) return;
    isSubmitting.value = true;

    try {
        if (!user_input.value && fileList.value.length === 0) {
            message.warning('请输入内容或上传文件');
            return;
        }

        let images = []
        if (fileList.value.length != 0) {
            console.log('Debug:FileList is not empty.')
            images = await getFileListJsonWithContent()
        }
        const payload = { 'text': user_input.value, 'images': images }

        message.success('提交成功');
        user_input.value = '';
        fileList.value = [];

        const response = await fetch('http://127.0.0.1:5000/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            message.error('网络请求失败');
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json()
        // 触发父组件函数调用，并传递 payload
        emit('callParent', payload);
        console.log('Invoke_Model:', result.res)
    } catch (error) {
        console.error('提交失败：', error);
        message.error('提交失败: ' + error.message);
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<style scoped>
.RAG-Text {
    margin: 0px;
    padding: 0px;

    font-family: 'MapleMono';
    font-size: 15px;
    font-weight: bold;
    background-color: rgb(219, 233, 254);
    color: rgb(77, 107, 254);
}

.RAG-Function {
    position: absolute;
    left: 8px;
    bottom: 12px;
    z-index: 1;

    width: 60px;
    height: 40px;
    border-radius: 10px;
    padding: 0px;
    margin: 0px;
}

.FileListContainer {
    height: 20px;
    margin-bottom: 2px;
    position: absolute;
    left: 10px;
    top: 0px;
}

.FileItem {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 4px;
    margin-bottom: 10px;
    background-color: #f9f9f9;
    border: 1px solid #bfbfbf;
    border-radius: 8px;
    width: 100%;
    max-width: 160px;
    /* 固定最大宽度 */
}

.FileInfo {
    display: flex;
    flex-direction: column;
    min-width: 0;
    /* 重要：允许内容溢出 */
    flex: 1;
    /* 占据剩余空间 */
}

.FileName {
    font-size: 14px;
    margin-bottom: 2px;
    white-space: nowrap;
    /* 不换行 */
    overflow: hidden;
    /* 隐藏溢出内容 */
    text-overflow: ellipsis;
    /* 显示省略号 */
    max-width: 100%;
    /* 限制最大宽度 */
}

.FileSize {
    font-size: 12px;
    color: #888;
}

.RemoveButton {
    width: 20px;
    height: 20px;
    color: #ff4d4f;

    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;

    flex-shrink: 0;
    /* 防止按钮被压缩 */
}

.ActionButtons {
    position: absolute;
    bottom: 12px;
    right: 16px;

    display: flex;
    flex-direction: row;
    justify-content: flex-end;
}

.UploadButton {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    margin-right: 8px;
    position: relative;
    z-index: 1;

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
    width: 60%;
    height: 20%;
    bottom: 5%;
    left: 50%;
    transform: translateX(-50%);
}

.InputContainer {
    position: relative;
    width: 100%;
    height: 75%;
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
