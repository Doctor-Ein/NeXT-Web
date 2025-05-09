<template>
    <div>
        <button @click="toggleRecording">
            {{ isRecording ? '结束录音' : '开始录音' }}
        </button>
    </div>
</template>


<script setup>
import { ref, defineEmits } from 'vue';
import axios from 'axios';

const isRecording = ref(false);
const emit = defineEmits(['transcriptReady']);

const toggleRecording = async () => {
    if (isRecording.value) {
        await stopRecording();
    } else {
        await startRecording();
    }
};

const startRecording = async () => {
    try {
        await axios.post('http://127.0.0.1:5000/start_recording');
        isRecording.value = true;
    } catch (error) {
        console.error('录音失败:', error);
    }
};

const stopRecording = async () => {
    try {
        await axios.post('http://127.0.0.1:5000/stop_recording');
        isRecording.value = false;
        await fetchTranscript();
    } catch (error) {
        console.error('停止录音失败:', error);
    }
};

const fetchTranscript = async () => {
    try {
        const response = await axios.post('http://127.0.0.1:5000/transcribe_audio');
        emit('transcriptReady', response.data.transcript);
    } catch (error) {
        console.error('获取转录结果失败:', error);
    }
};
</script>