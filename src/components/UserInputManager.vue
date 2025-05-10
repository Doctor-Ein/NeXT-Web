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
            <a-textarea ref="chatInput" class="Unique_Input" v-model:value="user_input" placeholder="在此输入内容..."
                :rows="10" :auto-size="false" @keydown="handleKeyDown" />
            <!-- @keydown.enter="handleSubmit" 这里直接给删掉了哈哈哈 -->
            <!-- 操作按钮区域 -->
            <div class="ActionButtons">
                <AudioInputButton @update:transcript="handle_transcript" />
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
import { FileAddTwoTone, DeleteOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { defineEmits, ref, onMounted, watch, nextTick } from 'vue';
import AudioInputButton from './AudioInputButton.vue';

// 定义向父组件触发事件
const emit = defineEmits(['callParent']);

const user_input = ref('');
const isSubmitting = ref(false);
const fileList = ref([]);
const isRAGEnabled = ref(false); //TODO: 这里先默认开启叭，累了

// 响应式状态管理
const chatInput = ref(null);
const dialogues = ref([]);
const dialogue_list = ref([])

// 新增响应式状态
const isAutoCompleteActive = ref(false)

// 辅助函数：获取最长公共前缀
const getLongestCommonPrefix = (strs) => {
    if (strs.length === 0) return ''
    let prefix = strs[0]
    for (let i = 1; i < strs.length; i++) {
        while (strs[i].indexOf(prefix) !== 0) {
            prefix = prefix.substring(0, prefix.length - 1)
            if (prefix === '') return ''
        }
    }
    return prefix
}

// 键盘事件处理
const handleKeyDown = (e) => {
    if (e.key === 'Tab' && isAutoCompleteActive.value) {
        e.preventDefault()
        const input = user_input.value
        const searchTerm = input.slice(1)

        // 过滤匹配的对话标题
        const matches = dialogues.value.filter(title =>
            title.toLowerCase().startsWith(searchTerm.toLowerCase())
        )

        if (matches.length > 0) {
            // 获取最长公共前缀
            const commonPrefix = getLongestCommonPrefix(matches)

            // 构造新输入内容
            const newValue = `@${commonPrefix} `
            user_input.value = newValue

            // 移动光标到末尾
            nextTick(() => {
                const textarea = chatInput.value?.resizableTextArea?.textArea
                if (textarea) {
                    textarea.selectionStart = newValue.length
                    textarea.selectionEnd = newValue.length
                }
            })
        }
    }
}

// 监听输入内容变化
watch(user_input, (newVal) => {
    // 通过正则判断是否以@开头且不包含空格
    isAutoCompleteActive.value = /^@[^\s]*$/.test(newVal)
})

onMounted(async () => {
    try {
        const res = await fetch('http://127.0.0.1:5000/api/dialogue_list');
        if (!res.ok) throw new Error(res.statusText);

        dialogue_list.value = await res.json();
        // 正确的方式提取 title 数组
        dialogues.value = dialogue_list.value.map(item => item.title);

        console.log('加载的对话标题:', dialogues.value); // 调试用
    } catch (e) {
        console.error('加载历史对话失败', e);
        dialogues.value = []; // 确保初始化为空数组
    }
});

// 新增检测函数
const detectAutoCompleteReference = () => {
    const input = user_input.value

    // 使用正则匹配格式：@开头 + 非空内容 + 空格或结尾
    const referenceRegex = /^@(\S+)(?=\s|$)/
    const match = input.match(referenceRegex)

    if (match) {
        const matchedTitle = match[1]
        // 在dialogues中精确匹配标题（区分大小写）
        return dialogues.value.find(title => title === matchedTitle) || ''
    }
    return ''
}


const handle_transcript = (transcript) => { user_input.value += transcript }

const Switch_RAG = async () => {
    isRAGEnabled.value = !isRAGEnabled.value;
    try {
        const payload = { 'rag_enabled': isRAGEnabled.value }
        const response = await fetch('http://127.0.0.1:5000/api/rag_toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('状态切换失败');
        message.success(isRAGEnabled.value ? 'RAG 模式已开启' : 'RAG 模式已关闭');
    } catch (error) {
        message.error('RAG 状态切换失败');
        // 回滚状态
        isRAGEnabled.value = !isRAGEnabled.value;
    }
};

const dummyRequest = ({ onSuccess }) => {
    // 立即标记上传成功，不执行任何操作
    setTimeout(() => {
        onSuccess && onSuccess();
    }, 0);
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

const findIdByTitle = (targetTitle, data) => {
    // 安全校验
    if (!Array.isArray(data)) return null;

    // 精确匹配版本（区分大小写）
    const item = data.find(({ title }) => title === targetTitle);

    // 不区分大小写版本（如需使用请取消注释）
    // const item = data.find(({ title }) => 
    //   title.toLowerCase() === targetTitle?.toLowerCase()
    // );

    return item ? item.id : null;
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


        const title = detectAutoCompleteReference()
        console.log('DEBUGGGGG:', title, 'dialogue_list', dialogue_list.value)
        const reference_id = findIdByTitle(title, dialogue_list.value)
        console.log('DEBUGGGGG:', reference_id)

        let images = []
        if (fileList.value.length != 0) {
            console.log('Debug:FileList is not empty.')
            images = await getFileListJsonWithContent()
        }
        const payload = { 'text': user_input.value, 'images': images, 'reference_id': reference_id }
        emit('callParent', payload);
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
        emit('callParent');
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
    bottom: 0px;
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
    bottom: 6px;
    right: 8px;

    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: flex-end;
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
    border: 4px solid #bfbfbf;
    border-radius: 20px;

    font-size: 16px;
    resize: none;
    /* 禁止缩放 */
    padding: 16px;
    box-sizing: border-box;
}
</style>
