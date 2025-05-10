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
import { message } from 'ant-design-vue';

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
    mes.value = result;
  } catch (error) {
    console.error('获取消息失败:', error);
  }
  if (mes.value.length == 2) { // 只处理第一轮对话后，这里将修改一个标题（直接改后端）, 刷新一下将更新起来
    const payload = { 'id': currentChatID.value, 'content': mes.value }
    try {
      const response = await fetch('http://127.0.0.1:5000/api/update_title', {
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
      message.success('标题更新成功', 1)
    } catch (error) {
      console.error('提交失败：', error);
      message.error('提交失败: ' + error.message);
    }
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
