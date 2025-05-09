<template>
    <div class="transcribe-button">
        <a-button :type="isRecording ? 'primary' : 'default'" :loading="loading" @click="toggleTranscribe">
            {{ isRecording ? '停止录音' : '开始录音' }}
        </a-button>
    </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import { message } from 'ant-design-vue'

const emit = defineEmits(['update:transcript'])

const isRecording = ref(false)
const loading = ref(false)

async function toggleTranscribe() {
    loading.value = true

    try {
        if (!isRecording.value) {
            // 启动录音
            const resp = await fetch('http://127.0.0.1:5000/api/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
            if (!resp.ok) throw new Error(`启动失败：${resp.status}`)
            message.success('转录启动', 1)
            isRecording.value = true
            emit('update:transcript', '')  // 清空原始文本

        } else {
            // 停止录音并获取文本
            const resp = await fetch('http://127.0.0.1:5000/api/transcribe')
            if (!resp.ok) throw new Error(`停止失败：${resp.status}`)
            const data = await resp.json()

            message.success('转录完成', 1)
            isRecording.value = false
            emit('update:transcript', data.text || '')
        }
    } catch (err) {
        console.error(err)
        message.error(err.message)
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.transcribe-button {
    max-width: 200px;
    margin-right: 8px;
    text-align: center;
}

.mt-2 {
    margin-top: 16px;
}
</style>
