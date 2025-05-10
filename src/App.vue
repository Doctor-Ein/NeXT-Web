<template>
  <a-layout style="height: 100%;display: flex;flex-direction: row;overflow: hidden;">
    <!-- 左侧栏 -->
    <LeftSidebar v-model:currentChat="currentChatID" />



    <!-- 主内容区域 -->
    <a-layout-content class="Right-Layout" style="position: relative;padding-left: 15%;padding-right: 15%;">
      <MainChat :messages="mes" />
      <UserInputManager @callParent="handleChildSubmit" />
    </a-layout-content>
  </a-layout>
</template>

<script setup>
import { ref, watch } from 'vue';
import LeftSidebar from './components/LeftSidebar.vue';
import UserInputManager from './components/UserInputManager.vue';
import MainChat from './components/MainChat.vue';

// Reactive state variables
const currentChatID = ref(null);
const mes = ref([]);

// Function to update messages based on the selected chat ID
const updateMessages = async (dialogueId) => {
  console.log('Debug', dialogueId)
  try {
    const response = await fetch(`http://127.0.0.1:5000/api/get_messages/${dialogueId}`);
    if (!response.ok) {
      throw new Error('网络响应错误');
    }
    const result = await response.json();
    console.log('Debug', result);
    // Update the mes ref with the fetched messages
    mes.value = result;
  } catch (error) {
    console.error('获取消息失败:', error);
  }
};

// Watcher to react to changes in currentChatID
watch(currentChatID, (newID) => {
  updateMessages(newID);
});

const handleChildSubmit = (payload = null) => {
  if (payload) {
    console.log('子组件提交的内容:', payload);
    mes.value.push({ 'speaker': 'user', 'content': payload['text'] })
  }
  else {
    updateMessages(currentChatID.value)
  }
  // mes.value.push({ 'role': 'user', 'content': payload['text'] })
  // 这里可以执行任意逻辑，比如更新状态、调用接口、路由跳转等
};

</script>
